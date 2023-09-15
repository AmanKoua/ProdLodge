const express = require("express");
const mongoose = require("mongoose");
const { ObjectId, MongoClient, GridFSBucket } = require("mongodb");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Fs = require('fs/promises'); // imported to retrieve file size
const router = express.Router();

const user = require('../models/userModel');
const userProfile = require("../models/userProfileModel");
const userActionItems = require("../models/userActionItemsModel");
const userFriends = require("../models/userFriendsModel");
const song = require("../models/songModel");
const chain = require("../models/chainModel");

function generateRandomString(length) { // required to create random requestID
    const charset = "ABCDEF0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
}

const createToken = (_id) => {
    return jwt.sign({ _id: _id, }, process.env.SECRET, { expiresIn: '3d' })
}

const verifyTokenAndGetUser = async (req, res, next) => {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET) // fields: _id, iat, exp
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const verifiedUsers = await user.find({ _id: new ObjectId(decodedToken._id) }).exec(); // return array of items matching query

    if (verifiedUsers.length === 0) { // could potentially be the case after a user has deleted their account but has not cleared a token
        return res.status(404).json({ error: "No user found!" });
    }
    else if (verifiedUsers.length > 1) {
        return res.status(500).json({ error: "Multiple users with same ID" });
    }

    req.body.verifiedUser = verifiedUsers[0];

    next();
}

router.post('/signup', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;

    let createdUser = undefined;
    let token = undefined;

    if (!email || !password) {
        return res.status(401).json({ error: "Required fields missing!" });
    }

    try {

        if (userName) {
            createdUser = await user.signup(email, password, userName);
            token = createToken(createdUser._id);
        }
        else {
            createdUser = await user.signup(email, password, '');
            token = createToken(createdUser._id);
        }

    } catch (e) {
        return res.status(401).json({ error: e.message })
    }

    if (!createdUser || !token) {
        return res.status(500).json({ error: "Error creating user!" });
    }
    else {
        return res.status(200).json({ email, userName, token })
    }

})

router.post('/login', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    let retrievedUser = undefined;
    let token = undefined;
    let tokenCreationTime = undefined;

    if (!email || !password) {
        return res.status(401).json({ error: "Required fields missing!" });
    }

    try {
        retrievedUser = await user.login(email, password);
        token = createToken(retrievedUser._id);
        tokenCreationTime = Date.now();
    } catch (e) {
        return res.status(401).json({ error: `${e}` })
    }

    if (!retrievedUser || !token) {
        return res.status(500).json({ error: "Error logging in user!" });
    }
    else {
        const userName = retrievedUser.userName;
        return res.status(200).json({ email, userName, token, tokenCreationTime })
    }

})

router.get('/isAuth', verifyTokenAndGetUser, async (req, res) => { // Check if token is still valid after user has not logged in for longer than token expiration time
    return res.status(200).json({ message: "Token is valid!" });
})

router.get('/profile', async (req, res) => {

    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET) // fields: _id, iat, exp
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const profile = await userProfile.find({ userId: new ObjectId(decodedToken._id) }).exec(); // return array of items matching query

    let doesUserHaveProfileImage;

    if (profile[0].pictureId) {
        doesUserHaveProfileImage = true;
    }
    else {
        doesUserHaveProfileImage = false;
    }

    if (profile.length === 0) { // could potentially be the case after a user has deleted their account but has not cleared a token
        return res.status(404).json({ error: "No user found!" });
    }

    const profileSlice = { // dont send all profile data to frontend
        socialMediaHandles: profile[0].socialMediaHandles ? profile[0].socialMediaHandles : null,
        visibility: profile[0].visibility,
        hasProfileBeenSet: profile[0].hasProfileBeenSet,
        doesUserHaveProfileImage: doesUserHaveProfileImage,
    }

    return res.status(200).json({ profile: profileSlice });

})

const downloadProfileImage = (imageId, fileName, requestId) => {

    return new Promise(async (res, rej) => {

        const client = new MongoClient(process.env.MONGO_URI);

        await client.connect();
        const db = client.db("ProdCluster");
        const bucket = new GridFSBucket(db);

        fs.mkdirSync(path.join(__dirname, `../../downloads/${requestId}/`));

        const dlPath = path.join(__dirname, `../../downloads/${requestId}/`, `${fileName}`);
        const dlStream = bucket.openDownloadStream(new ObjectId(imageId));
        const fileStream = fs.createWriteStream(dlPath);
        dlStream.pipe(fileStream);

        fileStream.on("finish", async () => {
            await client.close();
            res("DL finished!");
        })

    });
}

router.get('/profileImage', verifyTokenAndGetUser, async (req, res) => {

    const requestId = generateRandomString(30).toLowerCase();
    req.body.requestId = requestId;

    const userId = req.body.verifiedUser._id;
    const tempUserProfile = await userProfile.findOne({ userId: userId }).exec();
    const imageId = tempUserProfile.pictureId.valueOf();
    let profileImageFileName;

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("ProdCluster");
    const bucket = new GridFSBucket(db);

    const cursor = bucket.find({ _id: tempUserProfile.pictureId });

    for await (const item of cursor) {
        profileImageFileName = item.filename;
    }

    await downloadProfileImage(imageId, profileImageFileName, req.body.requestId);

    const folderPath = path.join(__dirname, `../../downloads/${req.body.requestId}/`);
    const filePath = path.join(__dirname, `../../downloads/${req.body.requestId}/`, `${profileImageFileName}`);
    const stats = await Fs.stat(filePath);
    const fileSize = stats.size;

    res.setHeader('Content-Length', fileSize);

    return res.status(200).download(filePath, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Failure in transmitting file to user!" });
        }
        else {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                setTimeout(() => {
                    fs.rmdirSync(folderPath);
                }, 1000)
            }
        }
    })

})

router.patch('/profile', async (req, res) => {

    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header!" });
    }

    if (!req.body || !req.body.profile) {
        return res.status(401).json({ error: "Invalid request body!" });
    }

    const token = req.headers.authorization.split(" ")[1]; // bearer token...
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET) // fields: _id, iat, exp
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const filter = { userId: new ObjectId(decodedToken._id) };
    let updateObject = {};
    let profileProperties = Object.keys(req.body.profile);

    if (profileProperties.includes("userId") || profileProperties.includes("actionItemsId") || profileProperties.includes("friendsListId") || profileProperties.includes("_id")) { // dont allow modification of these properties!
        return res.status(401).json({ error: "Invalid profile properties modification!" });
    }

    for (let i = 0; i < profileProperties.length; i++) {
        updateObject[profileProperties[i]] = req.body.profile[profileProperties[i]];
    }

    const update = {
        $set: updateObject,
    };

    const profile = await userProfile.updateOne(filter, update); // return array of items matching query

    return res.status(200).json({ profile: profile }); // CORS will never allow a profole obj to be sent ...

});

router.delete("/profile", async (req, res) => {

    // TODO : Update delete enpoint when user tracks, images, etc have been added!

    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET) // fields: _id, iat, exp
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const profile = await userProfile.find({ userId: new ObjectId(decodedToken._id) }).exec(); // return array of items matching query

    if (profile.length === 0) {
        return res.status(400).json({ error: "No users found for given ID" })
    }
    else if (profile.length > 1) {
        return res.status(400).json({ error: "More than 1 user found for given ID" })
    }

    /*
    delete songs, comments, tracks, and images associated with user account!
    */

    const userProfileId = profile[0]._id;
    const userId = profile[0].userId;
    const friendsListId = profile[0].friendsListId;
    const actionItemsId = profile[0].actionItemsId;

    const userSongs = await song.find({ userId: userId }).exec();

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("ProdCluster");
    const bucket = new GridFSBucket(db);

    for (let i = 0; i < userSongs.length; i++) {
        let tempTrackList = userSongs[i].trackList

        for (let j = 0; j < tempTrackList.length; j++) { // delete all tracks associated with a song
            await bucket.delete(tempTrackList[j]);
        }

        await song.deleteOne({ _id: userSongs[i]._id }).exec();
    }

    await client.close();

    try {
        await userActionItems.findOneAndDelete({ _id: actionItemsId });
        await userFriends.findOneAndDelete({ _id: friendsListId });
        await userProfile.findOneAndDelete({ _id: userProfileId });
        await user.findOneAndDelete({ _id: userId });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

    return res.status(200).json({ mssg: "Successful data deletion!" });

})

router.get("/songs", verifyTokenAndGetUser, async (req, res) => {
    const userId = req.body.verifiedUser._id;
    const songs = await song.find({ userId: userId }).exec();
    let payload = [];

    for (let i = 0; i < songs.length; i++) {
        let tempSong = {};
        let tempTrackIds = [];
        let tempChainsData = [];
        tempSong.title = songs[i].title;
        tempSong.description = songs[i].description;
        tempSong.id = songs[i]._id;

        for (let j = 0; j < songs[i].trackList.length; j++) {
            tempTrackIds.push(songs[i].trackList[j]._id.valueOf());
        }

        for (let j = 0; j < songs[i].chainsList.length; j++) {

            const tempChains = await chain.find({ _id: songs[i].chainsList[j] }).exec();

            if (tempChains.length === 0) {
                // Chain is not found OR deleted...
                continue;
            }
            else {
                let chainSnapShot = {
                    name: tempChains[0].name,
                    data: tempChains[0].data,
                    id: tempChains[0]._id, // send over id for deletion
                }
                tempChainsData.push(chainSnapShot);
            }

        }

        tempSong.chains = tempChainsData;
        tempSong.trackIds = tempTrackIds;
        payload.push(tempSong);
    }

    return res.status(200).json({ payload })
})

router.patch("/song", verifyTokenAndGetUser, async (req, res) => {

    if (!req.body || !req.body.songId || !req.body.title || !req.body.description) {
        return res.status(400).json({ error: "Invalid request body!" })
    }

    const songId = req.body.songId;
    const title = req.body.title;
    const description = req.body.description;
    let songs = [];

    if (songId.length !== 24) {
        return res.status(400).json({ error: "Invalid songId!" });
    }

    try {
        songs = await song.find({ _id: new ObjectId(songId) }).exec();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error querying songs!" });
    }

    if (songs.length === 0) {
        return res.status(404).json({ error: "No song found for given id!" });
    }
    else if (songs.length > 1) {
        return res.status(500).json({ error: "Multiple songs found for same id!" });
    }

    if (songs[0].userId.valueOf() !== req.body.verifiedUser._id.valueOf()) {
        return res.status(401).json({ error: "You are not authorized to change this song!" });
    }

    try {
        await songs[0].updateOne({
            $set: {
                title: title,
                description: description,
            }
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error updating song!" });
    }

    return res.status(200).json({ message: "Song updated successfully!" })

})

router.delete('/song', verifyTokenAndGetUser, async (req, res) => {

    /*
        Todo: Delete all comments associated with a song!
    */

    if (!req.body || !req.body.songId) {
        return res.status(400).json({ error: "Invalid request body!" })
    }

    const songId = req.body.songId;
    let songs = [];

    if (songId.length !== 24) {
        return res.status(400).json({ error: "Invalid songId!" });
    }

    try {
        songs = await song.find({ _id: new ObjectId(songId) }).exec();
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error querying songs!" });
    }

    if (songs.length === 0) {
        return res.status(404).json({ error: "No song found for given id!" });
    }
    else if (songs.length > 1) {
        return res.status(500).json({ error: "Multiple songs found for same id!" });
    }

    if (songs[0].userId.valueOf() !== req.body.verifiedUser._id.valueOf()) {
        return res.status(401).json({ error: "You are not authorized to delete this song!" });
    }

    try {
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        const db = client.db("ProdCluster");
        const bucket = new GridFSBucket(db);

        for (let i = 0; i < songs[0].trackList.length; i++) {
            await bucket.delete(songs[0].trackList[i]);
        }

        await client.close();
        await songs[0].deleteOne();

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error deleting song!" });
    }

    return res.status(200).json({ message: "Song deleted successfully!" })

})

module.exports = router;
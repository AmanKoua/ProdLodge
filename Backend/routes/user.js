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

    if (!email || !password || !userName) {
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

    return res.status(200).json({ profile: profile }); // CORS will never allow a profile obj to be sent ...

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
        tempSong.visibility = songs[i].visibility;

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

    if (!req.body || !req.body.songId || !req.body.title || !req.body.description || !req.body.visibility) {
        return res.status(400).json({ error: "Invalid request body!" })
    }

    const songId = req.body.songId;
    const title = req.body.title;
    const description = req.body.description;
    const visibility = req.body.visibility;
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
                visibility: visibility,
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
        Todo: Delete all comments and chains associated with a song!
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

router.get("/friends", verifyTokenAndGetUser, async (req, res) => {

    const tempUserProfile = await userProfile.findOne({ userId: req.body.verifiedUser._id });
    const tempUserFriends = await userFriends.findOne({ _id: tempUserProfile.friendsListId });
    const tempUserFriendsList = tempUserFriends.friendsList; // [ObjectId]
    let friends = []; // [{id: ObjectId, userName, email}]

    for (let i = 0; i < tempUserFriendsList.length; i++) {

        let temp = {}
        let tempFriendUser = await user.findOne({ _id: tempUserFriendsList[i] })

        temp.id = tempUserFriendsList[i];
        temp.userName = !tempFriendUser.userName ? "" : tempFriendUser.userName;
        temp.email = tempFriendUser.email;

        friends.push(temp);
    }

    return res.status(200).json({ friends });

})

router.post('/addFriend', verifyTokenAndGetUser, async (req, res) => {

    if (!req.body || !req.body.email) {
        return res.status(400).json({ error: "Invalid friend request body!" });
    }

    const userId = req.body.verifiedUser._id; // user ObjectId
    const userEmail = req.body.verifiedUser.email;
    const friendEmail = req.body.email;

    if (userEmail == friendEmail) {
        return res.status(500).json({ error: "Cannot add yourself as a friend!" });
    }

    const friend = await user.findOne({ email: friendEmail });

    if (!friend) {
        return res.status(400).json({ error: "No user is registered to provided friend email!" });
    }

    const tempUserProfile = await userProfile.findOne({ userId: userId });
    const friendProfile = await userProfile.findOne({ userId: friend._id });

    const tempUserFriendsList = await userFriends.findOne({ _id: tempUserProfile.friendsListId });

    if (tempUserFriendsList.friendsList.includes(friendEmail)) {
        return res.status(400).json({ error: "Cannot add user that's already a friend!" });
    }

    const tempUserActionItems = await userActionItems.findOne({ _id: tempUserProfile.actionItemsId });

    for (let i = 0; i < tempUserActionItems.items.length; i++) {
        if (tempUserActionItems.items[i].type == "outgoingFriendRequest" || tempUserActionItems.items[i].type == "incommingFriendRequest") {
            if (tempUserActionItems.items[i].data.email == friendEmail && (tempUserActionItems.items[i].data.status == "pending")) {
                return res.status(400).json({ error: "Cannot send friend request while incomming / outgoing friend request is pending!" });
            }
        }
    }

    const userActionItem = {
        id: generateRandomString(35),
        type: "outgoingFriendRequest",
        data: {
            email: friendEmail,
            status: "pending",
        }
    }

    const friendActionItem = {
        id: generateRandomString(35),
        type: "incommingFriendRequest",
        data: {
            email: userEmail,
            status: "pending",
        }
    }

    await userActionItems.updateOne({ _id: tempUserProfile.actionItemsId }, { $push: { items: userActionItem } });
    await userActionItems.updateOne({ _id: friendProfile.actionItemsId }, { $push: { items: friendActionItem } });

    return res.status(200).json({ message: "Friend request sent successfully!" });

})

router.delete('/removeFriend', verifyTokenAndGetUser, async (req, res) => {
    if (!req.body || !req.body.id) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const tempUserProfile = await userProfile.findOne({ userId: req.body.verifiedUser._id });
    const tempUserFriends = await userFriends.findOne({ _id: tempUserProfile.friendsListId });
    const currentUserFriendsList = tempUserFriends.friendsList;
    let newUserFriendsList = [];

    let friendId
    try {
        friendId = new ObjectId(req.body.id);
    } catch (e) {
        return res.status(400).json({ error: "Invalid friend object id!" });
    }
    const friendProfile = await userProfile.findOne({ userId: friendId });

    if (friendProfile == null) {
        return res.status(400).json({ error: "Invalid friend id!" });
    }

    const friendFriends = await userFriends.findOne({ _id: friendProfile.friendsListId });
    const currentFriendFriendsList = friendFriends.friendsList;
    let newFriendFriendsList = [];

    let userDeleteIdx = currentUserFriendsList.indexOf(friendId);
    let friendDeleteIdx = currentFriendFriendsList.indexOf(req.body.verifiedUser._id);

    if (userDeleteIdx < 0 || friendDeleteIdx < 0) {
        return res.status(500).json({ error: "Internal server error!" });
    }

    newUserFriendsList = currentUserFriendsList;
    newUserFriendsList.splice(userDeleteIdx, 1);
    await tempUserFriends.updateOne({ $set: { friendsList: newUserFriendsList } });

    newFriendFriendsList = currentFriendFriendsList;
    newFriendFriendsList.splice(friendDeleteIdx, 1);
    await friendFriends.updateOne({ $set: { friendsList: newFriendFriendsList } });

    return res.status(200).json({ message: "successfully removed friend" });

})

router.get('/friendRequests', verifyTokenAndGetUser, async (req, res) => {

    const userId = req.body.verifiedUser._id; // user ObjectId
    let payload = [];

    const tempUserProfile = await userProfile.findOne({ userId: userId });
    const tempUserActionItems = await userActionItems.findOne({ _id: tempUserProfile.actionItemsId });

    for (let i = 0; i < tempUserActionItems.items.length; i++) {
        if (tempUserActionItems.items[i].type == "outgoingFriendRequest" || tempUserActionItems.items[i].type == "incommingFriendRequest") {
            payload.push(tempUserActionItems.items[i]);
        }
    }

    return res.status(200).json({ payload });

})

router.post("/handleFriendRequest", verifyTokenAndGetUser, async (req, res) => {

    if (!req.body || !req.body.requestId || !req.body.response) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const acceptableResponses = ["accept", "reject"];

    if (!acceptableResponses.includes(req.body.response)) {
        return res.status(400).json({ error: "Invalid response type" });
    }

    const userId = req.body.verifiedUser._id; // user ObjectId
    const tempUserProfile = await userProfile.findOne({ userId: userId });
    const tempUserActionItems = await userActionItems.findOne({ _id: tempUserProfile.actionItemsId });
    const tempUserFriendsList = await userFriends.findOne({ _id: tempUserProfile.friendsListId });

    let actionItemIndex = undefined;

    let target;
    let targetProfile;
    let targetActionItems;
    let targetFriendsList;
    let targetEmail = "";

    for (let i = 0; i < tempUserActionItems.items.length; i++) {
        if (tempUserActionItems.items[i].id == req.body.requestId) {
            targetEmail = tempUserActionItems.items[i].data.email;
            actionItemIndex = i;
            break;
        }
    }

    if (actionItemIndex === undefined) {
        return res.status(400).json({ error: "Invalid request Id" });
    }

    if (tempUserActionItems.items[actionItemIndex].data.status != "pending") { // Status should never be pending, as items are deleted once handled
        return res.status(400).json({ error: "Cannot set response that's already set" });
    }

    target = await user.findOne({ email: targetEmail });

    if (!target || target == null) {
        return res.status(400).json({ error: "Cannot find friend account!" });
    }

    targetProfile = await userProfile.findOne({ userId: target._id });
    targetActionItems = await userActionItems.findOne({ _id: targetProfile.actionItemsId });
    targetFriendsList = await userFriends.findOne({ _id: targetProfile.friendsListId });

    // let tempUserObjectId = userId;
    let targetUserObjectId = target._id;
    let currentUserFriendsList = tempUserFriendsList.friendsList;
    let newUserFriendsList = [];
    let currentUserActionItems = tempUserActionItems.items;
    let newUserActionItems = [];
    let currentTargetFriendsList = targetFriendsList.friendsList;
    let newTargetFriendsList = [];
    let currentTargetActionItems = targetActionItems.items;
    let newTargetActionItems = [];

    if (req.body.response == "accept") {

        let targetActionItemIndex = undefined;
        let updatedTargetActionItem = undefined;

        if (!currentUserFriendsList.includes(targetUserObjectId)) {
            await tempUserFriendsList.updateOne({ $push: { friendsList: targetUserObjectId } })
        }

        if (!currentTargetFriendsList.includes(userId)) {
            await targetFriendsList.updateOne({ $push: { friendsList: userId } });
        }

        // Remove handled action item for user

        for (let i = 0; i < currentUserActionItems.length; i++) {
            if (currentUserActionItems[i].id != req.body.requestId) {
                newUserActionItems.push(currentUserActionItems[i]);
            }
            else {
                continue;
            }
        }

        await userActionItems.updateOne({ _id: tempUserProfile.actionItemsId }, { $set: { items: newUserActionItems } });

        // Update handled action item for target

        for (let i = 0; i < currentTargetActionItems.length; i++) {
            if (currentTargetActionItems[i].type != "outgoingFriendRequest") {
                continue;
            }
            else if ((currentTargetActionItems[i].data.email == req.body.verifiedUser.email) && (currentTargetActionItems[i].data.status == "pending")) {
                targetActionItemIndex = i;
                break;
            }
        }

        if (targetActionItemIndex == undefined) {
            return res.status(500).json({ error: "Cannot find corresponding friend action item to update!" });
        }

        updatedTargetActionItem = currentTargetActionItems[targetActionItemIndex];
        updatedTargetActionItem.data.status = req.body.response;

        await targetActionItems.updateOne({ $set: { [`items.${targetActionItemIndex}`]: updatedTargetActionItem } });

    } else if (req.body.response == "reject") {

        let targetActionItemIndex = undefined;
        let updatedTargetActionItem = undefined;

        // Remove handled action item for user

        for (let i = 0; i < currentUserActionItems.length; i++) {
            if (currentUserActionItems[i].id != req.body.requestId) {
                newUserActionItems.push(currentUserActionItems[i]);
            }
            else {
                continue;
            }
        }

        await userActionItems.updateOne({ _id: tempUserProfile.actionItemsId }, { $set: { items: newUserActionItems } });

        // Update handled action item for target

        for (let i = 0; i < currentTargetActionItems.length; i++) {
            if (currentTargetActionItems[i].type != "outgoingFriendRequest") {
                continue;
            }
            else if ((currentTargetActionItems[i].data.email == req.body.verifiedUser.email) && (currentTargetActionItems[i].data.status == "pending")) {
                targetActionItemIndex = i;
                break;
            }
        }

        if (targetActionItemIndex == undefined) {
            return res.status(500).json({ error: "Cannot find corresponding friend action item to update!" });
        }

        updatedTargetActionItem = currentTargetActionItems[targetActionItemIndex];
        updatedTargetActionItem.data.status = req.body.response;

        await targetActionItems.updateOne({ $set: { [`items.${targetActionItemIndex}`]: updatedTargetActionItem } });
    }

    return res.status(200).json({ message: "Successfully handled friend request" });

})

router.delete("/requestNotification", verifyTokenAndGetUser, async (req, res) => {

    if (!req.body || !req.body.id) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    let actionItemFound = false;
    const tempUserProfile = await userProfile.findOne({ userId: req.body.verifiedUser._id });
    const tempUserActionItems = await userActionItems.findOne({ _id: tempUserProfile.actionItemsId });
    let currentUserActionItems = tempUserActionItems.items;
    let newUserActionItems = [];

    for (let i = 0; i < currentUserActionItems.length; i++) {
        if (currentUserActionItems[i].id == req.body.id) {
            actionItemFound = true;
            continue;
        }
        else {
            newUserActionItems.push(currentUserActionItems[i]);
        }
    }

    if (!actionItemFound) {
        return res.status(400).json({ error: "Invalid request notification ID!" });
    }

    await tempUserActionItems.updateOne({ $set: { items: newUserActionItems } });

    return res.status(200).json({ message: "request notification deleted" });
})

router.get("/friendProfile/:id", verifyTokenAndGetUser, async (req, res) => {

    if (!req.params || !req.params.id) {
        return res.status(401).json({ error: "Request id parameter missing!" });
    }

    if (req.params.id.length != 24) {
        return res.status(400).json({ error: "Invalid friend ID!" });
    }

    const friendId = new ObjectId(req.params.id);
    const friend = await user.findOne({ _id: friendId });
    let friendProfile = undefined;
    let friendFriends = undefined;
    let doesUserHaveProfileImage = false;

    if (!friend) {
        return res.status(404).json({ error: "Friend not found!" });
    }

    friendProfile = await userProfile.findOne({ userId: friendId });

    if (!friendProfile) {
        return res.status(500).json({ error: "Internal system error!" });
    }

    if (friendProfile.visibility == "Private") {
        return res.status(403).json({ error: "You are not authorized to view this user's profile!" });
    }

    doesUserHaveProfileImage = friendProfile.pictureId ? true : false;
    friendFriends = await userFriends.findOne({ _id: friendProfile.friendsListId });

    if (!friendFriends) {
        return res.status(500).json({ error: "Internal system error!" });
    }

    let profileSlice = {}

    if (doesUserHaveProfileImage) {
        profileSlice = { // dont send all profile data to frontend
            userName: friend.userName,
            socialMediaHandles: friendProfile.socialMediaHandles ? friendProfile.socialMediaHandles : null,
            pictureId: friendProfile.pictureId,
        }
    }
    else {
        profileSlice = { // dont send all profile data to frontend
            userName: friend.userName,
            socialMediaHandles: friendProfile.socialMediaHandles ? friendProfile.socialMediaHandles : null,
        }
    }

    if (friendProfile.visibility == "Public") {
        return res.status(200).json({ profile: profileSlice });
    }
    else if (friendProfile.visibility == "FriendsOnly") {

        if (friendFriends.friendsList.includes(req.body.verifiedUser._id)) {
            return res.status(200).json({ profile: profileSlice });
        }
        else {
            return res.status(403).json({ error: "You are not authorized to view this user's profile!" });
        }

    }

    return res.status(500).json({ error: "Internal system error" });

})

router.get('/friendProfileImage', verifyTokenAndGetUser, async (req, res) => {

    const friendId = req.header("friendId")

    if (!req.headers || !friendId) {
        return res.status(400).json({ error: "Invalid request headers!" })
    }

    const requestId = generateRandomString(30).toLowerCase();
    req.body.requestId = requestId;
    const friend = await user.findOne({ _id: new ObjectId(friendId) });
    let friendProfile;

    if (!friend) {
        return res.status(404).json({ error: "Specified friend not found!" });
    }

    friendProfile = await userProfile.findOne({ userId: friend._id });

    if (!friendProfile) {
        return res.status(500).json({ error: "Internal system error!" });
    }

    if (friendProfile.visibility == "Private") {
        return res.status(403).json({ error: "Forbidden image download request!" });
    }

    if (!friendProfile.pictureId) {
        return res.status(404).json({ error: "User does not have a profile image!" });
    }

    const imageId = friendProfile.pictureId.valueOf();
    let profileImageFileName;

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("ProdCluster");
    const bucket = new GridFSBucket(db);

    const cursor = bucket.find({ _id: friendProfile.pictureId });

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

module.exports = router;
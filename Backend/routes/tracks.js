const express = require("express");
const mongoose = require("mongoose");
const { ObjectId, MongoClient, GridFSBucket } = require("mongodb");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Fs = require('fs/promises'); // imported to retrieve file size
const os = require("os");
const router = express.Router();

const user = require('../models/userModel');
const userProfile = require("../models/userProfileModel");
const userActionItems = require("../models/userActionItemsModel");
const userFriends = require("../models/userFriendsModel");
const song = require("../models/songModel");

function generateRandomString(length) { // required to create random requestID
    const charset = "ABCDEF0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
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

const downloadTrack = (trackId, requestId) => {

    return new Promise(async (res, rej) => {

        const client = new MongoClient(process.env.MONGO_URI);

        await client.connect();
        const db = client.db("ProdCluster");
        const bucket = new GridFSBucket(db);

        fs.mkdirSync(path.join(os.tmpdir(), `/downloads/${requestId}/`));

        const dlPath = path.join(os.tmpdir(), `/downloads/${requestId}/`, `${trackId}.mp3`);
        const dlStream = bucket.openDownloadStream(new ObjectId(trackId));
        const fileStream = fs.createWriteStream(dlPath);
        dlStream.pipe(fileStream);

        fileStream.on("finish", async () => {
            await client.close();
            res("DL finished!");
        })

    });


}

router.get('/:id', verifyTokenAndGetUser, async (req, res) => {

    if (!req.params.id) {
        return res.status(400).json({ error: "No id sent with request!" });
    }

    /*
    TODO :
    Check if user is owner, or if user has permissions to download requested track.
    (song visibility - Public, Private, FriendsOnly, AccessList)
    */

    let trackId = req.params.id;
    let trackName = undefined;
    const requestId = generateRandomString(30).toLowerCase();

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("ProdCluster");
    const bucket = new GridFSBucket(db);
    const cursor = bucket.find({ _id: new ObjectId(trackId) })

    for await (const item of cursor) {
        trackName = item.filename.split("@")[0];
    }

    await client.close();
    await downloadTrack(trackId, requestId);

    const folderPath = path.join(os.tmpdir(), `/downloads/${requestId}/`);
    const filePath = path.join(os.tmpdir(), `/downloads/${requestId}/`, `${trackId}.mp3`);
    const stats = await Fs.stat(filePath);
    const fileSize = stats.size;

    res.setHeader('Content-Length', fileSize);
    res.setHeader('Access-Control-Expose-Headers', 'Trackname');
    res.setHeader('Trackname', trackName);

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
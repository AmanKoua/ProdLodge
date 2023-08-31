const express = require("express");
const mongoose = require("mongoose");
const { ObjectId, MongoClient, GridFSBucket } = require("mongodb");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const router = express.Router();

const user = require('../models/userModel');
const userProfile = require("../models/userProfileModel");
const userActionItems = require("../models/userActionItemsModel");
const userFriends = require("../models/userFriendsModel");
const song = require("../models/songModel");

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

const downloadTrack = async (trackId) => {

    const client = new MongoClient(process.env.MONGO_URI);

    await client.connect();
    const db = client.db("ProdCluster");
    const bucket = new GridFSBucket(db);

    const dlPath = path.join(__dirname, '../../downloads/', `${trackId}.mp3`);
    const dlStream = bucket.openDownloadStream(new ObjectId(trackId));
    const fileStream = fs.createWriteStream(dlPath);
    dlStream.pipe(fileStream);

    fileStream.on("finish", async () => {
        await client.close();
    })
}

router.get('/:id', verifyTokenAndGetUser, (req, res) => {

    const userId = req.body.verifiedUser._id.valueOf();
    let trackId = undefined;

    if (!req.params.id) {
        return res.status(400).json({ error: "No id sent with request!" });
    }

    trackId = req.params.id;

    downloadTrack(trackId);

    return res.status(200).json({ message: "successful" });
})

module.exports = router;
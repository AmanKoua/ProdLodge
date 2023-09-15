const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const path = require("path");
const router = express.Router();

const user = require('../models/userModel');
const userProfile = require("../models/userProfileModel");
const song = require('../models/songModel');
const chain = require('../models/chainModel');
const comment = require('../models/commentsModel');

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

router.post("/", verifyTokenAndGetUser, async (req, res) => {

    if (!req.body || !req.body.songId || !req.body.data) {
        return res.status(400).json({ error: "Invalid comment upload request body!" });
    }

    const userId = req.body.verifiedUser._id.valueOf();
    const creationTime = Date.now();
    const parentId = req.body.parentId !== undefined ? new ObjectId(req.body.parentId) : new ObjectId("000000000000000000000000") // Invalid parent ObjectId

    if (req.body.songId.length !== 24) {
        return res.status(400).json({ error: "Invalid song ID!" });
    }

    const songId = new ObjectId(req.body.songId);

    if (req.body.data.length > 1000) {
        return res.status(400).json({ error: "Comment cannot be more than 1000 characters!" });
    }

    const data = req.body.data;
    const initInteractionData = { // Initial comment post will not have any user interaction history
        likes: 0,
        dislikes: 0,
        children: 0,
    };

    /*
    Request will come with chainID If chain had been created beforehand
    */

    const chainId = req.body.chainId !== undefined ? new ObjectId(req.body.chainId) : new ObjectId("000000000000000000000000"); // Temp chain ObjectId

    try {
        await comment.initialize(new ObjectId(userId), creationTime, parentId, songId, data, initInteractionData, chainId);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error creating comment!" });
    }

    return res.status(200).json({ message: "Successfully uploaded comment" });

})

module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const path = require("path");
const router = express.Router();

const user = require('../models/userModel');
const userProfile = require("../models/userProfileModel");
const userFriends = require("../models/userFriendsModel");
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

    if (!req.body) {
        return res.status(400).json({ error: "Invalid comment upload request body!" });
    }

    const reqFields = Object.keys(req.body);

    if (!reqFields.includes("songId") || !reqFields.includes("data") || !reqFields.includes("hasChain") || !reqFields.includes("chain")) {
        return res.status(400).json({ error: "Invalid comment upload request body!" });
    }

    if (req.body.data.length > 1000) {
        return res.status(400).json({ error: "Comment cannot be more than 1000 characters!" });
    }

    if (req.body.songId.length != 24) {
        return res.status(400).json({ error: "Invalid song or reply Ids!" });
    }

    const hasChainPossibilities = ["true", "false"];

    if (!hasChainPossibilities.includes(req.body.hasChain)) {
        return res.status(400).json({ error: "Invalid has chain value!" });
    }

    let chain = undefined;

    try {
        chain = JSON.parse(req.body.chain);
    } catch (e) {
        console.log(e);
        return res.status(400).json({ error: "Invalid chain JSON!" });
    }

    if (!chain.data || !chain.name) {
        return res.status(400).json({ error: "Invalid chain object structure!" });
    }

    // mutate chain to adhere to comment schema
    chain.data = JSON.stringify(chain.data);
    // chain.name = JSON.stringify(chain.name);

    if (!(req.body.replyId.length == 0 || req.body.replyId.length == 24)) {
        return res.status(400).json({ error: "Invalid reply Id!" });
    }

    if (req.body.replyId.length == 24) {
        try {
            const tempTargetComment = await comment.findOne({ _id: new ObjectId(req.body.replyId) });

            if (!tempTargetComment) {
                return res.status(400).json({ error: "No comment to reply to found!" });
            }

        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: "failed seting reply id song ObjectId!" });
        }
    }

    const userId = req.body.verifiedUser._id.valueOf();
    const userName = req.body.verifiedUser.userName;
    const creationTime = Date.now();
    const isReply = (req.body.replyId.length == 24) ? true : false;
    const data = req.body.data;
    const hasChain = req.body.hasChain == "true" ? true : false;
    let replyId = undefined;
    let songId = undefined;
    let targetSong = undefined;
    let targetSongCreator = undefined;
    let targetSongCreatorProfile = undefined;
    let targetSongCreatorFriendsList = undefined;
    let friendsList = undefined;
    let createdComment = undefined;

    if (isReply) {
        replyId = req.body.replyId;
    }
    else {
        replyId = "empty";
    }

    songId = new ObjectId(req.body.songId);
    targetSong = await song.findOne({ _id: songId });

    if (!targetSong) {
        return res.status(404).json({ error: "Requested song not found!" });
    }

    if (targetSong.visibility == "public") {
        // do nothing
    }
    else if (targetSong.visibility == "private") {
        // If owner, allow comment. else block
        if (targetSong.userId.valueOf() != userId) {
            return res.status(403).json({ error: "Invalid permissions to comment on specified song!" });
        }

    }
    else if (targetSong.visibility == "friendsonly") {

        targetSongCreator = await user.findOne({ _id: targetSong.userId });

        if (!targetSongCreator) {
            return res.status(500).json({ error: "Internal server error. No song creator found" });
        }

        if (targetSongCreator._id.valueOf() != userId) { // If comment poster is not the owner of the song!

            targetSongCreatorProfile = await userProfile.findOne({ userId: targetSongCreator._id })

            if (!targetSongCreatorProfile) {
                return res.status(500).json({ error: "Internal server error. No song creator profile found" });
            }

            targetSongCreatorFriendsList = await userFriends.findOne({ _id: targetSongCreatorProfile.friendsListId });

            if (!targetSongCreatorFriendsList) {
                return res.status(500).json({ error: "Internal server error. No song creator profile friend list found" });
            }

            friendsList = targetSongCreatorFriendsList.friendsList;

            if (!friendsList.includes(new ObjectId(userId))) {
                return res.status(403).json({ error: "Invalid permissions to comment on specified song!" });
            }

        }
        else {
            // do nothing
        }

    }

    try {

        if (hasChain) {
            createdComment = await comment.initialize(targetSong._id, new ObjectId(userId), userName, Date.now(), hasChain, chain, replyId);
        } else {

            const tempChain = {
                name: "",
                data: "",
            }

            createdComment = await comment.initialize(targetSong._id, new ObjectId(userId), userName, Date.now(), hasChain, tempChain, replyId);
        }

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error creating comment!" });
    }

    await targetSong.updateOne({ $push: { commentsList: createdComment._id } });

    return res.status(200).json({ message: "Successfully uploaded comment" });

})

module.exports = router;
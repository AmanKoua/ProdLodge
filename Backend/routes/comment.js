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

const deleteAllChildCommentsAndSelf = async (commentId) => {

    // if no replyId is included, remove the item from the commentList for the song

    let targetComment = await comment.findOne({ _id: commentId });

    if (!targetComment) {
        return;
    }

    for (let i = 0; i < targetComment.replyList.length; i++) {
        await deleteAllChildCommentsAndSelf(targetComment.replyList[i]);
    }

    if (targetComment.replyId.length != 24) { // it must be a parent level comment if not a reply itself
        const targetSong = await song.findOne({ _id: targetComment.songId });

        let targetCommentIdx = targetSong.commentsList.indexOf(targetComment._id);

        if (targetCommentIdx > -1) {
            let tempTargetSongCommentsList = targetSong.commentsList;
            tempTargetSongCommentsList.splice(targetCommentIdx, 1);
            await targetSong.updateOne({ $set: { commentsList: tempTargetSongCommentsList } });
        }
    }
    else {
        // Clear the reply list from the parent comment of this Id

        const parentComment = await comment.findOne({ _id: new ObjectId(targetComment.replyId) });

        if (!parentComment) {
            return;
        }

        const parentCommentReplyList = parentComment.replyList;
        const targetCommentIdx = parentCommentReplyList.indexOf(targetComment._id);

        if (targetCommentIdx > -1) {
            let tempParentCommentReplyList = parentComment.replyList;
            tempParentCommentReplyList.splice(targetCommentIdx, 1);
            await parentComment.updateOne({ $set: { replyList: tempParentCommentReplyList } });
        }

    }

    await comment.deleteOne({ _id: targetComment._id });
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

    let targetComment = undefined;

    if (req.body.replyId.length == 24) {
        try {
            targetComment = await comment.findOne({ _id: new ObjectId(req.body.replyId) });

            if (!targetComment) {
                return res.status(400).json({ error: "No comment to reply to found!" });
            }

        } catch (e) {
            console.log(e);
            return res.status(400).json({ error: "failed setting reply id song ObjectId!" });
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
            createdComment = await comment.initialize(targetSong._id, new ObjectId(userId), userName, Date.now(), req.body.data, hasChain, chain, replyId);
        } else {

            const tempChain = {
                name: "N/A",
                data: "N/A",
            }

            createdComment = await comment.initialize(targetSong._id, new ObjectId(userId), userName, Date.now(), req.body.data, hasChain, tempChain, replyId);
        }

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error creating comment!" });
    }

    if (!isReply) {
        await targetSong.updateOne({ $push: { commentsList: createdComment._id } });
    }
    else {
        await targetComment.updateOne({ $push: { replyList: createdComment._id } });
    }

    return res.status(200).json({ message: "Successfully uploaded comment", commentId: `${createdComment._id.valueOf()}` });
})

router.get("/:id", verifyTokenAndGetUser, async (req, res) => {

    if (!req.params.id) {
        return res.status(400).json({ error: "Missing requried request params (id)!" });
    }

    let userId = req.body.verifiedUser._id.valueOf();
    const commentId = req.params.id;

    if (commentId.length != 24) {
        return res.status(400).json({ error: "Invalid comment id provided!" });
    }

    const targetComment = await comment.findOne({ _id: new ObjectId(commentId) });

    if (!targetComment) {
        return res.status(404).json({ error: "comment not found!" });
    }

    const targetSong = await song.findOne({ _id: targetComment.songId });

    if (!targetSong) {
        return res.status(500).json({ error: "Internal server error!" });
    }

    let targetSongCreator = undefined;
    let targetSongCreatorProfile = undefined;
    let targetSongCreatorFriendsList = undefined;
    let friendsList = undefined;

    if (targetSong.visibility == "public") {
        // do nothing
    }
    else if (targetSong.visibility == "private") {
        // If owner, allow retrieval of comment. else block
        if (targetSong.userId.valueOf() != userId) {
            return res.status(403).json({ error: "Invalid permissions to retrieve comment from specified song!" });
        }

    }
    else if (targetSong.visibility == "friendsonly") {

        targetSongCreator = await user.findOne({ _id: targetSong.userId });

        if (!targetSongCreator) {
            return res.status(500).json({ error: "Internal server error. No song creator found" });
        }

        if (targetSongCreator._id.valueOf() != userId) { // If comment retriever is not the owner of the song!

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
                return res.status(403).json({ error: "Invalid permissions to retrieve comment on specified song!" });
            }

        }
        else {
            // do nothing
        }

    }

    const commentSlice = {};

    commentSlice.songId = targetComment.songId;
    commentSlice.creatorId = targetComment.creatorId;
    commentSlice.creatorUserName = targetComment.creatorUserName;
    commentSlice.creationTime = targetComment.creationTime;
    commentSlice.data = targetComment.data;
    commentSlice.hasChain = targetComment.hasChain;
    commentSlice.chain = targetComment.chain;
    commentSlice.replyId = targetComment.replyId;
    commentSlice.upvoteCount = targetComment.upvoteCount;
    commentSlice.downvoteCount = targetComment.downvoteCount;
    commentSlice.hasUserUpvoted = targetComment.upvotesList.includes(req.body.verifiedUser._id);
    commentSlice.hasUserDownvoted = targetComment.downvotesList.includes(req.body.verifiedUser._id);
    commentSlice.replyList = targetComment.replyList;

    return res.status(200).json({ comment: commentSlice });

})

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {

    if (!req.params.id) {
        return res.status(400).json({ error: "Missing requried request params (id)!" });
    }

    let userId = req.body.verifiedUser._id.valueOf();
    const commentId = req.params.id;

    if (commentId.length != 24) {
        return res.status(400).json({ error: "Invalid comment id provided!" });
    }

    const targetComment = await comment.findOne({ _id: new ObjectId(commentId) });

    if (!targetComment) {
        return res.status(404).json({ error: "comment not found!" });
    }

    if (targetComment.creatorId.valueOf() != userId) {
        return res.status(403).json({ error: "You do not have sufficient permissions to delete this comment" });
    }

    deleteAllChildCommentsAndSelf(targetComment._id);

    return res.status(200).json({ message: "Comment deletion in progress" });

})

router.post("/:id/interact", verifyTokenAndGetUser, async (req, res) => {

    /*
        Do not check to see that a user has access to a comment, because commentIDs are
        by defualt only available to authorized users. Also, a upvtote or downvote is 
        not significant.
    */

    if (!req.params.id) {
        return res.status(400).json({ error: "Missing requried request params (id)!" });
    }

    if (!req.body.interactionStatus) {
        return res.status(400).json({ error: "Missing requried request params (interactionStatus)!" });
    }

    const acceptableStatuses = ["0", "1", "2"];

    if (!acceptableStatuses.includes(req.body.interactionStatus)) {
        return res.status(400).json({ error: "Invalid interaction status!" });
    }

    let userId = req.body.verifiedUser._id.valueOf();
    const commentId = req.params.id;
    const interactionStatus = parseInt(req.body.interactionStatus);

    if (commentId.length != 24) {
        return res.status(400).json({ error: "Invalid comment id provided!" });
    }

    const targetComment = await comment.findOne({ _id: new ObjectId(commentId) });

    if (!targetComment) {
        return res.status(404).json({ error: "comment not found!" });
    }

    let currentInteractionStatus = undefined;

    if (targetComment.upvotesList.includes(req.body.verifiedUser._id)) {
        currentInteractionStatus = 1;
    } else if (targetComment.downvotesList.includes(req.body.verifiedUser._id)) {
        currentInteractionStatus = 2;
    } else {
        currentInteractionStatus = 0;
    }

    if (interactionStatus == currentInteractionStatus) {
        return res.status(200).json({ message: "Comment status unchanged" });
    }

    // define nested comments here

    const upvote = async (targetComment) => {
        const newUpvoteCount = targetComment.upvoteCount + 1;
        await targetComment.updateOne({ $push: { upvotesList: req.body.verifiedUser._id } })
        await targetComment.updateOne({ $set: { upvoteCount: newUpvoteCount } })
    }

    const downvote = async (targetComment) => {
        const newDownvoteCount = targetComment.downvoteCount + 1;
        await targetComment.updateOne({ $push: { downvotesList: req.body.verifiedUser._id } });
        await targetComment.updateOne({ $set: { downvoteCount: newDownvoteCount } });
    }

    const unlike = async (targetComment) => {
        const newUpvoteCount = targetComment.upvoteCount - 1;
        let targetCommentUpvotesList = targetComment.upvotesList;
        const userIdx = targetCommentUpvotesList.indexOf(req.body.verifiedUser._id);

        if (userIdx == -1) {
            return res.status(500).json({ error: "Internal server error - 3" });
        }

        targetCommentUpvotesList.splice(userIdx, 1);

        await targetComment.updateOne({ $set: { upvoteCount: newUpvoteCount } });
        await targetComment.updateOne({ $set: { upvotesList: targetCommentUpvotesList } })
    }

    const undislike = async (targetComment) => {
        const newDownvoteCount = targetComment.downvoteCount - 1;
        let targetCommentDownvotesList = targetComment.downvotesList;
        const userIdx = targetCommentDownvotesList.indexOf(req.body.verifiedUser._id);

        if (userIdx == -1) {
            return res.status(500).json({ error: "Internal server error - 3" });
        }

        targetCommentDownvotesList.splice(userIdx, 1);

        await targetComment.updateOne({ $set: { downvoteCount: newDownvoteCount } });
        await targetComment.updateOne({ $set: { downvotesList: targetCommentDownvotesList } })
    }


    if (currentInteractionStatus == 0) {
        if (interactionStatus == 1) {
            await upvote(targetComment);
        }
        else if (interactionStatus == 2) {
            await downvote(targetComment);
        }
    }
    else if (currentInteractionStatus == 1) {
        if (interactionStatus == 0) {
            await unlike(targetComment);
        } else if (interactionStatus == 2) {
            await unlike(targetComment);
            await downvote(targetComment);
        }
    }
    else if (currentInteractionStatus == 2) {
        if (interactionStatus == 0) {
            await undislike(targetComment);
        }
        else if (interactionStatus == 1) {
            await undislike(targetComment);
            await upvote(targetComment);
        }
    }

    return res.status(200).json({ message: "Comment updated successfully" });
})

module.exports = router;
const express = require("express");
const { ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const router = express.Router();

const user = require('../models/userModel');
const song = require('../models/songModel');
const chain = require('../models/chainModel');

router.post('/', async (req, res) => {

    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header" });
    }

    if (!req.body || !req.body.songId || !req.body.chainName || !req.body.data) {
        return res.status(435).json({ error: "Invalid request body!" });
    }

    // console.log(req.body.songId, req.body.chainName, req.body.data);

    const token = req.headers.authorization.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const verifiedUsers = await user.find({ _id: new ObjectId(decodedToken._id) }).exec();

    if (verifiedUsers.length === 0) {
        return res.status(404).json({ error: "No user found!" });
    } else if (verifiedUsers.length > 1) {
        return res.status(500).json({ error: "Multiple users with same ID!" });
    }

    const verifiedUser = verifiedUsers[0];

    const targetSongs = await song.find({ _id: new ObjectId(req.body.songId) }).exec();

    if (targetSongs.length === 0) {
        return res.status(404).json({ error: "No song found!" });
    }
    else if (targetSongs.length > 1) {
        return res.status(500).json({ error: "Multiple songs with same ID!" });
    }

    const targetSong = targetSongs[0];

    if (targetSong.userId.valueOf() != verifiedUser._id.valueOf()) {
        // TODO : Implement logic such that a chain can be added if track is public, user is friend of owner, or user is on access list
        return res.status(401).json({ error: "You are not authorized to create a chain for this song!" });
    }

    try {
        JSON.parse(req.body.data);
    } catch (e) {
        console.log(e);
        return res.status(400).json({ error: "Invalid JSON configuration!" });
    }

    try {
        const newChain = await chain.initialize(verifiedUser._id, req.body.chainName, req.body.data);
        await targetSong.updateOne({ $push: { chainsList: newChain._id } });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Error creating chain document!" });
    }

    return res.status(200).json({ message: "Chain upload successful!" });

});

router.delete('/', async (req, res) => {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).json({ error: "Invalid request header" });
    }

    if (!req.body || !req.body.chainId) {
        return res.status(435).json({ error: "Invalid request body!" });
    }

    const token = req.headers.authorization.split(" ")[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.SECRET);
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    const verifiedUsers = await user.find({ _id: new ObjectId(decodedToken._id) }).exec();

    if (verifiedUsers.length === 0) {
        return res.status(404).json({ error: "No user found!" });
    } else if (verifiedUsers.length > 1) {
        return res.status(500).json({ error: "Multiple users with same ID!" });
    }

    const verifiedUser = verifiedUsers[0];

    const chains = await chain.find({ _id: new ObjectId(req.body.chainId) }).exec();

    if (chains.length === 0) {
        return res.status(404).json({ error: "No chain found!" });
    } else if (chains.length > 1) {
        return res.status(500).json({ error: "Multiple users with same ID!" });
    }


    if (chains[0].creatorId.valueOf() === verifiedUser._id.valueOf()) { // if user is the creator of the chain, delete it

        /*
        Todo : Delete the object ID from the song document
        */

        await chains[0].deleteOne({ _id: chains[0]._id });
        return res.status(200).json({ message: "Chain deleted successfully!" });
    }
    else {
        return res.status(401).json({ error: "Insufficient permissions to delete chain!" });
    }

})

module.exports = router;
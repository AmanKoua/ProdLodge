const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

const song = require('../models/songModel');
const userProfile = require("../models/userProfileModel");

const createToken = (songId) => {
    return jwt.sign({ songId: songId }, process.env.SECRET, { expiresIn: '5m' })
}

const verifySongToken = (req, res, next) => {

    /*
        decoded token structure
        {
        songId: '64efed88378665f77f558183',
        iat: 1693445512,
        exp: 1693445812
        }
    */

    console.log(req.body);
    return res.status(215);

    if (!req.body.songToken || !req.body.trackName) {
        return res.status(400).json({ error: "Invalid request body!" });
    }

    const trackName = req.body.trackName;
    const songToken = req.body.songToken;
    let decodedToken = undefined;

    try {
        decodedToken = jwt.decode(songToken);
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }


    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }


    // Allow file upload ONLY when all checks have passed!
    // req.verifiedSongId = decodedToken.songId;

    next();
}

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "../uploads");

    },
    filename: (req, file, callBack) => {
        const fileName = req.body.trackName + ".mp3";
        callBack(null, fileName);
    }
})

const upload = multer({ storage });

router.post("/songInit", async (req, res) => {

    /*
        initialize a song document in mongoDb.
    */

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

    if (profile.length === 0) { // could potentially be the case after a user has deleted their account but has not cleared a token
        return res.status(404).json({ error: "No user found!" });
    }

    /*
        TODO : Initialize Song document in database!
        Create user interface to define title and description
    */

    const tempCommendsId = new ObjectId(0xA95554925A5505E5); // temp random ID

    let tempSong = await song.initialize(decodedToken._id, req.body.name, req.body.description, "public", tempCommendsId, [], [], []);
    const songToken = createToken(tempSong._id);

    return res.status(200).json({ message: "Song initialized!", token: songToken });

})

router.post("/track", verifySongToken, upload.single('track'), (req, res) => { // Require that a track be initiilzed first!
    return res.status(200).json({ message: "File uploaded successfully!" });
})

module.exports = router;
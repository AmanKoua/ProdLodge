const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const router = express.Router();

const song = require('../models/songModel');

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
        initialize a song document in mongoDb. Potentially add limit to the number of songs a user can have
        uploaded.
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

    // decodedToken._id;

    const profile = await userProfile.find({ userId: new ObjectId(decodedToken._id) }).exec(); // return array of items matching query

    if (profile.length === 0) { // could potentially be the case after a user has deleted their account but has not cleared a token
        return res.status(404).json({ error: "No user found!" });
    }

    /*
        TODO : Initialize Song document in database!
    */

    return res.status(200).json({ message: "Song initialized!" });

})

router.post("/track", upload.single('track'), async (req, res) => { // Require that a track be initiilzed first!

    /*
    Create a song document with the number of files to be sent over. Retrieve the ID of the song document
    and return it as JSON. In the subsequent track upload requests, resend the song document ID and the 
    JWT. Verify the JWT id and the song owner ID of the created song document, if they match, allow the upload.
    If they do not match, respond with 400 error and delete all tracks in storage belonging to user of a particular 
    ID.

    After all tracks have been uploaded successfully, upload the files to the GridFS bucket. Then delete the files
    from local storage.
    */

    if (!req.file) {
        return res.status(400).json({ error: "No file upload" });
    }

    return res.status(200).json({ message: "File uploaded successfully!" });

})

module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const song = require('../models/songModel');
const userProfile = require("../models/userProfileModel");

const createToken = (songId) => {
    return jwt.sign({ songId: songId }, process.env.SECRET, { expiresIn: '5m' })
}

const verifySongToken = (req, res, next) => {

    if (!req.headers.songtoken) {
        return res.status(400).json({ error: "Invalid request header!" });
    }

    let decodedToken = undefined;

    try {
        decodedToken = jwt.verify(req.headers.songtoken, process.env.SECRET);
    } catch (e) {
        return res.status(401).json({ error: "JWT verification failed!" });
    }

    req.verifiedSongId = decodedToken.songId;

    next();
}

const uploadSongToGridFSBucket = async (req, res, next) => {

    const fileName = req.fileNames[0];
    const files = fs.readdirSync(path.join(__dirname, "../../uploads"))

    const client = new MongoClient(process.env.MONGO_URI);

    if (files.includes(fileName)) {

        await client.connect();
        const db = client.db("ProdCluster")
        const bucket = new GridFSBucket(db);

        const fileNameSplit = fileName.split("@");
        const songId = fileNameSplit[1].substr(0, fileNameSplit[1].length - 4);

        const filePath = path.join(__dirname, "../../uploads", fileName);
        const uploadStream = bucket.openUploadStream(fileName);
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(uploadStream);

        uploadStream.on("finish", async () => {
            const cursor = bucket.find({ "filename": fileName });
            for await (const item of cursor) {
                await song.updateOne({ _id: new ObjectId(songId) }, { $push: { trackList: item._id } })
            }
            fs.unlinkSync(path.join(__dirname, "../../uploads", fileName));
            await client.close();
        })

    }

    next()

}

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, "../uploads");
    },
    filename: (req, file, callBack) => {
        const fileName = req.body.trackName + "@" + req.verifiedSongId + ".mp3";
        req.fileNames = [fileName];
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

    const tempCommendsId = new ObjectId(0xA95554925A5505E5); // temp random ID

    let tempSong = await song.initialize(decodedToken._id, req.body.name, req.body.description, "public", tempCommendsId, [], [], []);
    const songToken = createToken(tempSong._id);

    return res.status(200).json({ message: "Song initialized!", token: songToken });

})

router.post("/track", verifySongToken, upload.single('track'), uploadSongToGridFSBucket, (req, res) => { // Require that a track be initiilzed first!
    return res.status(200).json({ message: "File uploaded successfully!" });
})

module.exports = router;
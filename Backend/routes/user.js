const express = require("express");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const router = express.Router();
const user = require('../models/userModel');
const userProfle = require("../models/userProfileModel");

const createToken = (_id) => {
    return jwt.sign({ _id: _id, }, process.env.SECRET, { expiresIn: '3d' })
}

router.post('/signup', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;

    let createdUser = undefined;
    let token = undefined;

    if (!email || !password) {
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

    if (!email || !password) {
        return res.status(401).json({ error: "Required fields missing!" });
    }

    try {
        retrievedUser = await user.login(email, password);
        token = createToken(retrievedUser._id);
    } catch (e) {
        return res.status(401).json({ error: `${e}` })
    }

    if (!retrievedUser || !token) {
        return res.status(500).json({ error: "Error logging in user!" });
    }
    else {
        const userName = retrievedUser.userName;
        return res.status(200).json({ email, userName, token })
    }

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

    const profile = await userProfle.find({ userId: new ObjectId(decodedToken._id) }).exec(); // return array of items matching query

    const profileSlice = { // dont send all profile data to frontend
        socialMediaHandles: profile[0].socialMediaHandles ? profile[0].socialMediaHandles : null,
        visibility: profile[0].visibility,
        hasProfileBeenSet: profile[0].hasProfileBeenSet,
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

    const profile = await userProfle.updateOne(filter, update); // return array of items matching query

    return res.status(200).json({ profile: profile });

});

module.exports = router;
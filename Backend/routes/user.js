const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const router = express.Router();
const user = require('../models/userModel');

const createToken = (_id) => {
    return jwt.sign({ _id: _id, }, process.env.SECRET, { expiresIn: '3d' })
}

router.post('/signup', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    let createdUser = undefined;
    let token = undefined;

    if (!email || !password) {
        return res.status(401).json({ error: "Required fields missing!" });
    }

    try {
        createdUser = await user.signup(email, password);
        token = createToken(createdUser._id);

    } catch (e) {
        return res.status(401).json({ error: e.message })
    }

    if (!createdUser || !token) {
        return res.status(500).json({ error: "Error creating user!" });
    }
    else {
        return res.status(200).json({ email, token })
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
        return res.status(200).json({ email, token })
    }

})

module.exports = router;
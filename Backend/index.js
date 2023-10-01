const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const cors = require('cors');

const userRouter = require('./routes/user');
const uploadRouter = require('./routes/upload');
const tracksRouter = require("./routes/tracks");
const chainsRouter = require('./routes/chain')
const commentRouter = require('./routes/comment');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'))

app.use('/user', userRouter);
app.use('/upload', uploadRouter);
app.use('/tracks', tracksRouter);
app.use('/chain', chainsRouter);
app.use('/comment', commentRouter);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello to prodlodge!" })
})

mongoose.connect(process.env.MONGO_URI).then(async () => {
    app.listen(process.env.PORT, () => {
        console.log("Listening on port " + process.env.PORT);
    })
}).catch((e) => {
    console.log(e);
}); 
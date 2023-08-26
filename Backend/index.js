const express = require('express');
const mongoose = require('mongoose');
const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const userRouter = require('./routes/user');
const fs = require('fs');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/user', userRouter);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello to prodlodge!" })
})

let getGridFSBucket = async () => {

    const client = new MongoClient(process.env.MONGO_URI);

    try {

        // works for uploading a file!

        await client.connect();
        const db = client.db("ProdCluster")
        const bucket = new GridFSBucket(db);

        const filePath = "C:/Personal Use/Programming/ProdLodge/Testing/AudioInterface/Frontend/src/assets/songs/stems/master.mp3";
        const uploadStream = bucket.openUploadStream("Far cry 4 remix");
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(uploadStream);

        uploadStream.on("finish", () => {
            console.log("Upload successful!");
            client.close();
        })

        //--------------------------------------------------------------------


        // seems to work for DLing a song!
        // await client.connect();
        // const db = client.db("ProdCluster")
        // const bucket = new GridFSBucket(db);

        // const fileId = "Far cry 4 remix";
        // const dlPath = "C:/Personal Use/Programming/ProdLodge/Testing/AudioInterface/Frontend/src/assets/songs/stems/DLTrack.mp3"
        // const dlStream = bucket.openDownloadStreamByName(fileId);
        // const fileStream = fs.createWriteStream(dlPath);
        // dlStream.pipe(fileStream);

        // fileStream.on("finish", () => {
        //     console.log("download successful!");
        //     client.close();
        // })

        //-------------------------------------------------------------------------------

        // seems to work for deleting a song!
        // await client.connect();
        // const db = client.db("ProdCluster")
        // const bucket = new GridFSBucket(db);

        // await bucket.delete(new ObjectId('64e9799c8ebf1a1d3fa1d40a'));

    } catch (e) {
        console.log(e);
    }

}

mongoose.connect(process.env.MONGO_URI).then(async () => {

    await getGridFSBucket();

    app.listen(process.env.PORT, () => {
        console.log("Listening on port " + process.env.PORT);
    })
}).catch((e) => { console.log(e) });
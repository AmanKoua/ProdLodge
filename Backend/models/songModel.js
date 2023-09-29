const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

function generateRandomString(length) { // required to create random requestID
    const charset = "ABCDEF0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset.charAt(randomIndex);
    }

    return result;
}

const songSchema = new Schema({

    userId: {
        type: ObjectId,
        required: true,
        unique: false,
    },

    title: {
        type: String,
        required: true,
        unique: false,
    },

    description: {
        type: String,
        required: false,
        unique: false,
    },

    visibility: { // public - visible to all, private - visible to only the owner, friendsonly - visible only to user and friends.
        type: String,
        required: true,
        unique: false,
    },

    commentsId: { // Vestigate of old schmea. Kept here to satisfy mongoDBs requirement for a commentsId field. For not, it's just the userId
        type: ObjectId,
        required: true,
        unique: false,
    },

    commentsList: {
        type: [], // [ObjectId]
        required: true,
        unique: false,
    },

    accessList: {
        type: [],
        required: true,
        unique: false,
    },

    trackList: {
        type: [], // {trackName: ..., trackId: ...}
        required: true,
        unique: false,
    },

    chainsList: { // List of chains created by the song creator
        type: [], // [chainId, ...]
        required: true,
        unique: false,
    }

});

songSchema.statics.initialize = async function (userId, title, description, visibility, commentsList, accessList, trackList, chainsList) {
    let song = await this.create({ userId: userId, title: title, description: description, visibility: visibility, commentsId: new ObjectId(generateRandomString(24)), commentsList: commentsList, accessList, trackList, chainsList })
    return song;
}

// songSchema.statics.addTrack = async function (trackId){

// }

module.exports = mongoose.model('Song', songSchema);
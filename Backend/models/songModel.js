const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

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

    visibility: { // public - visible to all, private - visible to only the owner, restricted visible to only specified friends.
        type: String,
        required: true,
        unique: false,
    },

    commentsId: {
        type: ObjectId,
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

songSchema.statics.initialize = async function (userId, title, description, visibility, commentsId, accessList, trackList, chainsList) {
    let song = await this.create({ userId: userId, title: title, description: description, visibility: visibility, commentsId: commentsId, accessList, trackList, chainsList })
    return song;
}

// songSchema.statics.addTrack = async function (trackId){

// }

module.exports = mongoose.model('Song', songSchema);
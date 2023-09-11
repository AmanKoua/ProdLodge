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

    visibility: {
        type: String,
        required: true,
        unique: false,
    },

    /*
    Comments ID was removed. Comments will be queried when a user loads a song.
    */

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

songSchema.statics.initialize = async function (userId, title, description, visibility, accessList, trackList, chainsList) {
    let song = await this.create({ userId: userId, title: title, description: description, visibility: visibility, accessList, trackList, chainsList })
    return song;
}

// songSchema.statics.addTrack = async function (trackId){

// }

module.exports = mongoose.model('Song', songSchema);
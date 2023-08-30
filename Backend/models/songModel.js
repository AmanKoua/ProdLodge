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
    to be implemented...
    songCommentsId: {}
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

    chainsList: {
        type: [], // [chainId, ...]
        required: true,
        unique: false,
    }

});

songSchema.statics.initialize = async function (userId, title, description, visibility, accessList, trackList, chainsList) {
    // Create song document...

    //TODO : Finished off here!
}

module.exports = mongoose.model('Song', songSchema);
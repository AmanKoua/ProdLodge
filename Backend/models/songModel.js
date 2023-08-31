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

    commentsId: {
        type: ObjectId,
        required: true,
        unique: true,
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

    chainsList: {
        type: [], // [chainId, ...]
        required: true,
        unique: false,
    }

});

songSchema.statics.initialize = async function (userId, title, description, visibility, commentsId, accessList, trackList, chainsList) {
    // Initialization values will be created within upload route

    let song = await this.create({ userId: userId, title: title, description: description, visibility: visibility, commentsId, accessList, trackList, chainsList })
    return song;

}

module.exports = mongoose.model('Song', songSchema);
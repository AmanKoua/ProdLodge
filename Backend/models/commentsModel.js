const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const songCommentsSchema = new Schema({

    userId: { // FK to user schema
        type: ObjectId,
        required: true,
        unique: true,
    },

    songId: { // FK to song schema
        type: ObjectId,
        required: true,
        unique: false,
    },

    creationTime: { // Epoch time
        type: Number,
        required: true,
        unique: false,
    },

    parentId: { // Parent comment (if there is one)
        type: ObjectId,
        required: false,
        unique: false,
    },

    data: { // Actual comment data
        type: String,
        required: true,
        unique: false,
    },

    interactionData: { // Stores the number of likes, disklikes, and children comments the comment contains
        // ["likes", "dislikes", "chidren"]
        type: Map,
        of: Number,
        required: true,
        unique: false,
    },

    chainId: { // FKs to chain schema
        type: ObjectId,
        required: true,
        unique: false,
    }

})

songCommentsSchema.statics.initialize = async function (userId, creationTime, parentId, songId, data, interactionData, chainId) {
    const songComment = await this.create({ userId: userId, creationTime: creationTime, parentId: parentId, songId: songId, data: data, interactionData: interactionData, chainId: chainId })
    return songComment;
}

module.exports = mongoose.model("songComment", songCommentsSchema);
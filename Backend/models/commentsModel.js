const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const songCommentsSchema = new Schema({

    /*
        comment : {
            _id: automatically generated
            songId: ObjectId,
            creatorId: ObjectId,
            creatorUserName: string,
            creationTime: int (unix epoch time),
            hasChain: bool,
            chain: {
                name: string,
                data: string,
            },
            replyId: (target comment objectId)
            upvoteCount: int,
            downvoteCount: int,
            upvotesList: [ObjectId] (array of user objectIds)
            downvotesList : [ObjectId] (array of user objectIds)
            replyList : [ObjectID] // list of comment doc ObjectIds that are replies to this comment
        }
    */

    songId: {
        type: ObjectId,
        required: true,
        unique: false,
    },

    creatorId: {
        type: ObjectId,
        required: true,
        unique: false,
    },

    creatorUserName: {
        type: String,
        required: true,
        unique: false
    },

    creationTime: {
        type: Number,
        required: true,
        unique: false,
    },

    hasChain: {
        type: Boolean,
        required: true,
        unique: false,
    },

    chain: {
        name: {
            type: String,
            required: true,
            unique: false,
        },
        data: {
            type: String,
            required: true,
            unique: false,
        }
    },

    replyId: {
        type: String,
        required: true,
        unique: false,
    },

    upvoteCount: {
        type: Number,
        required: true,
        unique: false,
    },

    downvoteCount: {
        type: Number,
        required: true,
        unique: false,
    },

    upvotesList: {
        type: [],
        required: true,
        unique: false,
    },

    downvotesList: {
        type: [],
        required: true,
        unique: false,
    },

    replyList: {
        type: [],
        required: true,
        unique: false,
    },


})

songCommentsSchema.statics.initialize = async function (songId, creatorId, creatorUserName, creationTime, hasChain, chain, replyId) {
    const songComment = await this.create({ songId: songId, creatorId: creatorId, creatorUserName: creatorUserName, creationTime: creationTime, hasChain: hasChain, chain: chain, replyId: replyId, upvoteCount: 0, downvoteCount: 0, upvotesList: [], downvotesList: [], replyList: [] });
    return songComment;
}

module.exports = mongoose.model("songComment", songCommentsSchema);
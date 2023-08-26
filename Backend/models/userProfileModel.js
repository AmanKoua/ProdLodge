const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const userFriendsModel = require("./userFriendsModel");
const userActionItemsModel = require("./userActionItemsModel");

const Schema = mongoose.Schema;

const userProfileSchema = new Schema({

    userId: { // FK to user schema
        type: ObjectId,
        required: true,
        unique: true,
    },

    pictureId: { // FK to image stored in gridfs bucket
        type: ObjectId,
        required: false,
        unique: false,
    },

    socialMediaHandles: {
        type: Map,
        of: String,
        required: false,
        unique: false,
    },

    settings: {

        isPublic: {
            type: Boolean,
            required: true,
            unique: false,
        },
        isRestrictedToFriends: {
            type: Boolean,
            required: true,
            unique: false,
        },
        isPrivate: {
            type: Boolean,
            required: true,
            unique: false,
        },

    },

    friendsListId: {
        type: ObjectId,
        required: true,
        unique: true,
    },

    actionItemsId: {
        type: ObjectId,
        required: true,
        unique: true,
    },

    hasProfileBeenSet: { // Required to see if user needs to set up profile
        type: Boolean,
        required: true,
        unique: false,
    },

})

userProfileSchema.statics.initialize = async function (userId) {

    const newUserFriends = await userFriendsModel.initialize();
    const newUserActions = await userActionItemsModel.initialize();

    const tempSettings = {
        isPublic: true,
        isRestrictedToFriends: false,
        isPrivate: false,
    }

    const userProfile = await this.create({ userId: userId, settings: tempSettings, friendsListId: newUserFriends._id, actionItemsId: newUserActions._id, hasProfileBeenSet: false })

    return userProfile;
}

userProfileSchema.statics.addPicture = async function () {

}

userProfileSchema.statics.setProfile = async function () {

}

module.exports = mongoose.model('UserProfile', userProfileSchema);
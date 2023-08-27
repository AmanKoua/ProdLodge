const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const userFriendsSchema = new Schema({

    // Id field will be automatically generated with the object

    friendsList: {
        type: [], // array of user ids
        required: true,
        unique: false,
    }

});

userFriendsSchema.statics.initialize = async function () {
    let userFriends = await this.create({ friendsList: [] });
    return userFriends;
}

userFriendsSchema.statics.addFriend = async function () {

}

userFriendsSchema.statics.removeFriend = async function () {

}

module.exports = mongoose.model('UserFriends', userFriendsSchema);
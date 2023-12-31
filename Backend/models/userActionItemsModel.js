const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const userActionItemsSchema = new Schema({

    /*

    const userActionItem = {
        id: generateRandomString(35),
        type: "outgoingFriendRequest",
        data: {
            email: friendEmail,
            status: "pending",
        }
    }

    const friendActionItem = {
        id: generateRandomString(35),
        type: "incommingFriendRequest",
        data: {
            email: userEmail,
            status: "pending",
        }
    }

    */

    items: {
        type: [],
        required: true,
        unique: false,
    },

});

userActionItemsSchema.statics.initialize = async function () {
    const userActionItems = await this.create({ items: [] });
    return userActionItems;
}

module.exports = mongoose.model('UserActionItems', userActionItemsSchema);
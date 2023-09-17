const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const userActionItemsSchema = new Schema({

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
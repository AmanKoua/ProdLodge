const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const userActionItemsSchema = new Schema({

    // Id field will be automatically generated with the object

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
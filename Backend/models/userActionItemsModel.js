const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const userActionItemsSchema = new Schema({

    /*
    - id will randomly generated string of 35 chars
    - Will contain data property for incomming and outgoing friend requests
    
        [ {id: ... , type:.... data : {email: ..., status: .... } } ]
    */


    items: {
        type: [], //
        required: true,
        unique: false,
    },

});

userActionItemsSchema.statics.initialize = async function () {
    const userActionItems = await this.create({ items: [] });
    return userActionItems;
}

module.exports = mongoose.model('UserActionItems', userActionItemsSchema);
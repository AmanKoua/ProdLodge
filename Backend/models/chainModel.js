const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Schema = mongoose.Schema;

const chainSchema = new Schema({

    // Id will automatically be added

    creatorId: {
        type: ObjectId,
        required: true,
        unique: false,
    },

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
})

chainSchema.statics.initialize = async function (creatorId, name, data) {
    let chain = await this.create({ creatorId, name, data });
    return chain;
}

module.exports = mongoose.model("Chain", chainSchema);
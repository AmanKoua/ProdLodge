const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userProfile = require("./userProfileModel");

const Schema = mongoose.Schema;

const userSchema = new Schema({

    email: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: false,
        unique: false,
    },
    password: {
        type: String,
        required: true,
    }

});

userSchema.statics.signup = async function (email, password, userName) {

    if (!email || !password) {
        throw Error("Missing required fields!");
    }

    if (!validator.isEmail(email)) {
        throw Error("Invalid email!");
    }

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error("Email already in use!");
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await this.create({ email, password: hash, userName })

    // Need to create : User profile (which will create friends list and action items list)

    const newUserProfile = await userProfile.initialize(user._id);

    return user;
}

userSchema.statics.login = async function (email, password) {

    if (!email || !password) {
        throw Error("Required fields missing!");
    }

    const user = await this.findOne({ email });

    if (!user) {
        throw Error("Invalid email!");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw Error("Invalid password!");
    }

    return user;

}

module.exports = mongoose.model('User', userSchema)
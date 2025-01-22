const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        min: 4,
        max: 15,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 50
    },
    profilePicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    desc: {
        type: String,
        max: 400,
    },
  },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
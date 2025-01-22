const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        max: 500
    },
},
    { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    type: { type: String,enm:['public','private'], required: true }, // 'public' or 'private'
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachement: [{ type: String, default: "" }],
    time: { type: String },
    createdAt: { type: Date, default: Date.now }
    });

const message = mongoose.model("Message", messageSchema);

module.exports = message;


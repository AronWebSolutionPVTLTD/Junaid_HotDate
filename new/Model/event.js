const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  mainImage:{ type: String},
    userId:{ type: mongoose.Schema.Types.ObjectId,ref: "User"},
    eventName: { type: String, required: true },
    date: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    videos: [{ type: String, required: true }],
    type: { type: String, enm: ["Private Place", "Public Place", "Virtual Date"], required: true },
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
      }],
      isPromoted: { type: Boolean, default: false }

    });

const event = mongoose.model("event", eventSchema);

module.exports = event;

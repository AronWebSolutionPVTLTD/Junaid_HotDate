const mongoose = require("mongoose");

const ClubSchema = new mongoose.Schema({
  mainImage: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  owner_name: { type: String },
  clubname: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  description: {
    type: String,
  },
  image: [
    {
      type: String,
    },
  ],
  video: [
    {
      type: String,
    },
  ],
  clubtype: {
    type: String,
    enum: ["privateplace", "publicplace", "virtualdate"],
  },
  customer: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  customerCount: { type: Number, default: 0 },
  booking_price: { type: String }
}, { timestamps: true });

const Club = mongoose.model("Club", ClubSchema);

module.exports = Club;

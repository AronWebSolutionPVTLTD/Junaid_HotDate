const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema({
  image: { type: String },
  person_1_age: { type: String },
  person_2_age: { type: String },
  location: { type: String },
  time: {type: String},
  startDate: { type: String},
  endDate: { type: String},
  interested: { type: String},
  description: { type: String},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isVerify:{type: Boolean, default: false }
});

const travel = mongoose.model("travel", travelSchema);

module.exports = travel;

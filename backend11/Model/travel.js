const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema({
  image: { type: String },
  person_1_age: { type: String, required: true },
  person_2_age: { type: String, required: true },
  location: { type: String, required: true },
  time: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  interested: { type: String, required: true },
  description: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const travel = mongoose.model("travel", travelSchema);

module.exports = travel;

const mongoose = require("mongoose");
const travelSchema = new mongoose.Schema({
  image: { type: String },
  min_age_range: { type: String },
  max_age_range: { type: String },
  locationto: { type: String },
  locationfrom: { type: String },
  time: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  interested: { type: String },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  isVerify: { type: Boolean, default: false },
  website_url: { type: String },
});
const travel = mongoose.model("travel", travelSchema);
module.exports = travel;
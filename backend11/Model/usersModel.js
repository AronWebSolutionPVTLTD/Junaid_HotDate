const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    username: { type: String },
    password: { type: String },
    introduction: { type: String },
    image: {
      type: String,
      default:
        "https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png",
    },
    marital_status: { type: String },
    body_type: { type: String },
    race: { type: String },
    distance: { type: String },
    sexual_orientation: { type: String },
    looking_for: { type: String },
    location: { type: String },
    relocate: { type: String },
    dob: { type: String },
    age: { type: String },
    speaks: { type: String },
    gender: { type: String },
    country: { type: String },
    isModel: { type: Boolean, default: false },
    wallet: { type: Number, default: 0 },
    token: { type: String },
    otp: { type: String },
    favouriteModels: [String],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

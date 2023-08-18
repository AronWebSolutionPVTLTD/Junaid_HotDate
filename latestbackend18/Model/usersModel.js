const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: { type: String },
    DOB: { type: String },
    introduction: { type: String },
    image: {
      type: String,
      default:
        "https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png",
    },
    marital_status: { type: String },
    body_type: { type: String },
    language: { type: String },
    race: { type: String },
    distance: { type: String },
    sexual_orientation: { type: String },
    looking_for: { type: String },
    age: { type: String },
    role: { type: String, default: "user", enum: ["user", "model", "admin"] },
    gender: { type: String },
    country: { type: String },
    booking_by: { type: String },
    booking_price: { type: String },
    followers: [{ type: String }],
    paymentUser: { type: String },
    album: [{ name: String, images: [String] }],
    images: [{ type: String }],
    videos: [{ type: String }],
    isLive: { type: Boolean, default: false },
    favouriteModels: [String],
    commission: { type: String },
    wallet: { type: Number, default: 0 },
    isVerify: { type: Boolean, default: false },
    token: { type: String },
    otp: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    profile_type: {
      type: String,
      default: "single",
      enum: ["single", "couple"],
    },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: { type: String },
    DOB: { type: String },
    relocate: { type: Boolean, default: false },
    introduction: { type: String },
    image: {
      type: String,
      default:
        "https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png",
    },
    interests: {
      male_male: [String],
      female_female: [String],
      male_female: [String],
      male: [String],
      female: [String],
      transgender: [String],
    },
    marital_status: { type: String },
    slogan: { type: String },

    speaks: { type: String },
    race: { type: String },
    distance: { type: String },
    sexual_orientation: { type: String },
    looking_for: { type: String },
    age: { type: String },
    role: { type: String, default: "user", enum: ["user", "model", "admin"] },
    gender: { type: String },
    body_hair: [{ type: String }],
    height: { type: String },
    weight: { type: String },
    body_type: { type: String },
    ethnic_background: { type: String },
    smoking: { type: String },
    tattoos: { type: String },
    piercings: { type: String },
    language: { type: String },
    circumcised: { type: String },
    looks_important: { type: String },
    intelligence: { type: String },
    sexuality: { type: String },
    relationship_status: { type: String },
    experience: { type: String },
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
    modelVerify: { type: Boolean, default: false },
    otp: { type: String },
    personName:{type:String},

    couple: {
      person1: {
        gender: { type: String },
        DOB: { type: String },
        body_hair: [{ type: String }],
        height: { type: String },
        weight: { type: String },
        body_type: { type: String },
        ethnic_background: { type: String },
        smoking: { type: String },
        tattoos: { type: String },
        piercings: { type: String },
        language: { type: String },
        circumcised: { type: String },
        looks_important: { type: String },
        intelligence: { type: String },
        sexuality: { type: String },
        relationship_status: { type: String },
        experience: { type: String },
        person1_Name:{type:String}
      },
      person2: {
        gender: { type: String },
        DOB: { type: String },
        body_hair: [{ type: String }],
        height: { type: String },
        weight: { type: String },
        body_type: { type: String },
        ethnic_background: { type: String },
        smoking: { type: String },
        tattoos: { type: String },
        piercings: { type: String },
        language: { type: String },
        circumcised: { type: String },
        looks_important: { type: String },
        intelligence: { type: String },
        sexuality: { type: String },
        relationship_status: { type: String },
        experience: { type: String },
        person2_Name:{type:String}
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;

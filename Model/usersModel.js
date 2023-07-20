const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  introduction: {
    type: String,
  },
  image: {
    type: String,
    default:"https://www.seekpng.com/png/detail/966-9665493_my-profile-icon-blank-profile-image-circle.png"
  },
  location: {
    type: String,
  },
  token:{
    type: String,
  },
  otp:{
    type: String,
  },
},{
  timestamps:true
});

const User = mongoose.model("User", UserSchema);

module.exports = User;

const userModel = require("../Model/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Mailsend = require("../helper/mail");
const mongoose = require("mongoose");
const SECRET_KEY = process.env.JWT_SECRETKEY;
module.exports = {
   async signup(req, res) {
    const {
      email,
      password,
      confirmpassword,
      username,
      introduction,
      logintype,
      token,
    } = req.body;
    console.log("dsfj");
    if (!logintype) {
      try {
        if (!email || !username) {
          return res.status(400).send("Please Provide Required Information");
        }
        const exist = await userModel.findOne({ email });
        if (exist) {
          return res.status(200).send("User already exists");
        }
        const username_exist = await userModel.findOne({ username: username });
        if (username_exist) {
          return res.status(200).send("Username already exist");
        }
        if (confirmpassword !== password) {
          return res.status(400).send("Password doesm't match");
        }
        const hash_password = await bcrypt.hash(password, 10);
        const data = await userModel.create({
          email: email,
          username: username,
          password: hash_password,
          introduction: introduction,
        });
        if (!data) {
          return res.status(400).send("Failed to create user");
        } else {
          const verificationLink = `${process.env.FRONTEND_URL}/verified/${data._id}`;

          let emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        *{margin:0;padding: 0;box-sizing: border-box;}
        .top_bar {
            height: 30px;
            background:linear-gradient(46deg, #F79220 55.15%, #F94A2B 82%);
        }
        .email_temp_inner {
          padding:0 20px;
            margin: 40px auto 0;
        }
        img{
            max-width: 100%;
        }
        .logo_wrap {
            max-width: 130px;
            margin: 50px auto;
        }
        .confirm_email_title {
    text-align: center;
    font-size: 20px;
    margin-bottom: 20px;
}
.verification_btn {
    display: block;
    width: 100%;
    max-width: 200px;
    margin: 0 auto 150px;
    text-align: center;
    background: #00bf63;
    color: #f7f7f7 !important;
    font-size: 18px;
    padding: 12px 10px;
    border-radius: 7px;
    cursor: pointer;
}
.confirm_email_footer {
    margin-bottom: 50px;
}


.footer_title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
}
.footer_right {
    display: grid;
    gap: 6px;
}

.footer_right a {
    color: #1357b3;
    text-decoration: none;
}
    </style>
</head>
<body>
    <div class="email_temp_wrapper">
        <div class="top_bar"></div>
        <div class="email_temp_inner">
            <div class="logo_wrap">
                <img src="${process.env.FRONTEND_URL}/landingPage/images/landing-logo.png" alt="Logo" />
            </div>
            <div class="confirm_email_wrap">
                <p class="confirm_email_title">Please confirm your email address by clicking the 'Verify Email' button. After clicking the verify button, you will be redirected to Login page. Please use your newly created credentials to login.</p>
                <a class="verification_btn" href=${verificationLink}>Verify Email</a>
                <div class="confirm_email_footer">
                    <p>Sincerely,</p>
                    <p>Your Kaizen Globe staff</p>
                </div>
            </div>
            <div class="email_temp_footer">
                <p class="footer_title">Contact Us</p>
                <div class="footer_right">
                    <p>Kaizen Globe</p>
                    <p><a href="tel:+91-1234567890">+91-1234567890</a></p>
                    <p><a href="mailto:test@gmail.com">test@gmail.com</a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
          `;
          var mailOptions = {
            from: process.env.Nodemailer_id,
            to: email,
            subject: "user verify",
            html: emailHtml,
          };
          Mailsend(req, res, mailOptions);
          res
            .status(201)
            .send({ statusCode: 201, Message: "User Created Successfully" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      try {
        const exist = await userModel.findOne({ email });
        if (exist) {
          const token = jwt.sign(
            { _id: exist._id, email: exist.email, role: exist.role },
            SECRET_KEY,
            {
              expiresIn: "30d",
              expiresIn: "30d",
            }
          );
          exist.token = token;
          exist.save();
          return res.status(200).send({ statusCode: 200, Message: token });
        } else {
          const data = await userModel.create({
            email: email,
            username: username,
            logintype: logintype,
            isVerify: true,
          });
          console.log(data);
          const token = jwt.sign(
            { _id: exist._id, email: exist.email, role: exist.role },
            SECRET_KEY,
            {
              expiresIn: "30d",
              expiresIn: "30d",
            }
          );
          data.token = token;
          data.save();
          if (!data) {
            return res.status(400).send("Failed to create user");
          } else {
            res.status(201).send({ statusCode: 201, Message: token });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  },
  async login(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).send("Please Provide Required Information");
      }
      const exist = await userModel.findOne({ email });
      if (!exist) {
        return res.status(400).send("User doesn't exist");
      }
      if (exist.isVerify == false) {
        return res.status(400).send("email is not verify");
      }
      const match = await bcrypt.compare(password, exist.password);
      if (!match) {
        return res.status(400).send("wrong password");
      } else {
        const token = jwt.sign(
          { _id: exist._id, email: exist.email, role: exist.role },
          SECRET_KEY,
          {
            expiresIn: "30d",
          }
        );
        const userData = await userModel.findOneAndUpdate(
          { email: email },
          { token: token },
          { new: true }
        );
        return res.status(200).json({ data: userData });
      }
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  async findOne(req, res) {
    try {
      const { id } = req.params;
      const data = await userModel.findOne({ _id: id }).select("-password ");
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send(e);
    }
  },
  async update(req, res) {
    try {
      const { userId, dltImage, dltVideo } = req.body;
      if (!userId) {
        return res.status(404).send("required the userId");
      }
      const exist = await userModel.findOne({ _id: userId });
      if (!exist) {
        return res.status(404).send("model not found");
      }

      let mainImage = exist.image; // Initialize with existing image URL

      // Check if a new main image was uploaded
      if (req.files && req.files["image"]) {
        mainImage =
          process.env.Backend_URL_Image + req.files["image"][0].filename;
      }
      let image = exist.images.slice(); // Create a copy of the existing image array
      let video = exist.videos.slice(); // Create a copy of the existing video array
      let removeImage = [];
      let removeVideo = [];
      if (dltImage) {
        removeImage = dltImage.split(",");
      }
      if (dltVideo) {
        removeVideo = dltVideo.split(",");
      }
      // Check if new images were uploaded
      if (req.files && req.files["images"]) {
        for (const uploadedImage of req.files["images"]) {
          image.push(
            `${process.env.Backend_URL_Image}${uploadedImage.filename}`
          );
        }
      }
      // Check if new videos were uploaded
      if (req.files && req.files["videos"]) {
        for (const uploadedVideo of req.files["videos"]) {
          video.push(
            `${process.env.Backend_URL_Image}${uploadedVideo.filename}`
          );
        }
      }
      // Remove specific images if requested
      if (removeImage && Array.isArray(removeImage)) {
        for (const imageToRemove of removeImage) {
          const index = image.indexOf(imageToRemove);
          if (index !== -1) {
            image.splice(index, 1);
          }
        }
      }
      // Remove specific videos if requested
      if (removeVideo && Array.isArray(removeVideo)) {
        for (const videoToRemove of removeVideo) {
          const index = video.indexOf(videoToRemove);
          if (index !== -1) {
            video.splice(index, 1);
          }
        }
      }
      const data = await userModel.findOneAndUpdate(
        { _id: userId },
        {
          ...req.body,
          image: mainImage,
          images: image,
          videos: video,
        },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async delete_user(req, res) {
    try {
      const data = await userModel.findOneAndDelete({ _id: req.params.id });
      return res.status(200).send("user delete successfully");
    } catch (e) {
      return res.status(500).send(e);
    }
  },
  async search_user(req, res) {
    try {
      const { q } = req.query;

      const data = await userModel.find({ role: "user" }).select("-password ");
      if (q) {
        const result = await userModel
          .find({
            $or: [
              { role: "user" },
              { username: { $regex: q, $options: "i" } },
              { country: { $regex: q, $options: "i" } },
            ],
          })
          .select("-password");
        return res.status(200).send(result);
      }
      return res.status(200).send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async logout(req, res) {
    try {
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { token: null }
      );
      if (!data) {
        return res.status(404).send({ message: "User not found" });
      }
      return res.status(200).send({ message: "Logout successful" });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async forget(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).send("email is required");
      }
      const userExist = await userModel.findOne({ email: email });
      if (!userExist) {
        return res.status(400).send("User doesn't exist");
      }
      const OTP = otpGenerator.generate(6, {
        alphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
      });

      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: " Forget Password",
        html: `<h1>Hot Date</h1> </br> <p>Your OTP is: ${OTP}</p>`,
      };
      console.log(OTP);
      await userModel.findOneAndUpdate(
        { _id: userExist._id },
        { otp: OTP },
        { new: true }
      );
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async verifyOtp(req, res) {
    try {
      const { otp } = req.body;
      if (!otp) {
        return res.status(400).send("otp is required");
      }
      const userExist = await userModel.findOne({ otp: otp });
      if (!userExist) {
        return res.status(400).send("wrong otp");
      }
      const date = userExist.updatedAt;
      var currentdate = new Date();
      let mint = date.getMinutes() + 2;
      let curtMint = currentdate.getMinutes();
      if (mint <= curtMint) {
        return res.status(400).send("expired otp");
      }
      if (userExist) {
        const deleteotp = await userModel.findOneAndUpdate(
          { _id: userExist._id },
          { otp: "" },
          { new: true }
        );
        console.log(deleteotp);
        if (deleteotp) {
          return res.status(200).send("verify otp seccess");
        }
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async reset_pass(req, res) {
    try {
      const { email, new_password, confirm_password } = req.body;
      if ((!new_password, !confirm_password)) {
        return res.status(400).send("required the data");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("Enter the same password");
      }
      const hash = await bcrypt.hash(confirm_password, 10);
      console.log(confirm_password);
      const data = await userModel.findOneAndUpdate(
        { email: email },
        { password: hash },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("reset password successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async changePassword(req, res) {
    try {
      const { old_password, new_password, confirm_password } = req.body;
      if ((!old_password, !new_password, !confirm_password)) {
        return res.status(400).send("required the data");
      }
      const get_pass = await userModel.findOne({ _id: req.user._id });
      const password = await bcrypt.compare(old_password, get_pass.password);
      if (!password) {
        return res.status(400).send("wrong old_password");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("enter the same password");
      }
      const hash = bcrypt.hashSync(confirm_password, 10);
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { password: hash },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("change password successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async userdetail(req, res) {
    try {
      const { id } = req.params;
      const data = await userModel
        .findById({ _id: id })
        .select(
          "username image  marital_status  body_type language  race distance sexual_orientation looking_for location age gender"
        );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(data);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async contactUs(req, res) {
    try {
      const { username, email, reason, message } = req.body;
      if ((!username, !email, !reason, !message)) {
        return res.status(400).send("required the data");
      }

      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: process.env.Nodemailer_admin,
        subject: "contactUs",
        text: ` Name : ${username},  Email : ${email} , Reason  : ${reason}, Message : ${message}`,
      };
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async model_mail(req, res) {
    try {
      const user = req.user;
      const email = user.email;
      const verificationLink = `http://localhost:3000/verified/${user.email}`;

      let emailHtml = `
      <!doctype html>
      <html lang="en-US">
      
      <head>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <title>Email Verification</title>
          <meta name="description" content="Email Verification Template.">
          <style type="text/css">
              a:hover { text-decoration: underline !important; }
          </style>
      </head>
      
      <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #F2F3F8;" leftmargin="0">
          <!-- 100% body table -->
          <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#F2F3F8"
              style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700%7COpen+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
              <tr>
                  <td>
                      <table style="background-color: #F2F3F8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                          align="center" cellpadding="0" cellspacing="0">
                          <tr>
                              <td style="height: 80px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height: 20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td>
                                  <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                      style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                      <tr>
                                          <td style="height: 40px;">&nbsp;</td>
                                      </tr>
                                      <tr>
                                          <td style="padding: 0 35px;">
                                              <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Email Verification</h1>
                                              <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #CECECE; width:100px;"></span>
                                              <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Thank you for signing up. Please verify your email address by clicking the button below.</p>
                                              <a  href="${verificationLink}"
                                                  style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email</a>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="height: 40px;">&nbsp;</td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td style="height: 20px;">&nbsp;</td>
                          </tr>
                          <tr>
                              <td style="height: 80px;">&nbsp;</td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
          <!-- /100% body table -->
      </body>
      
      </html>
      `;
      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: "model verify",
        html: emailHtml,
      };
      Mailsend(req, res, mailOptions);
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async user_verify(req, res) {
    console.log(req.params.id);
    try {
      const data = await userModel.findOneAndUpdate(
        { _id: req.params.id },
        { isVerify: true },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("user verify successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async subscribe(req, res) {
    try {
      const { modelId } = req.params;
      const exist = await userModel.findOne({ _id: modelId });
      exist.followers.forEach((el) => {
        if (el.toString() == req.user._id) {
          return res.status(400).send("model already subscribe");
        }
      });

      var mailOptions = {
        from: process.env.Nodemailer_id,
        to: exist.email,
        subject: "new subscriber",
        html: `<h4>Hello,${exist.firstName} ${exist.lastName}</h4>
                 \nWe have a new subscribe request. from:\nName: ${req.user.username}\nEmail: ${req.user.email}`,
      };
      exist.followers.push(req.user._id);
      await exist.save();
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async upload_album(req, res) {
    try {
      const { album_name } = req.body;
      let image = [];
      if (req.files) {
        req.files.forEach((file) => {
          console.log(file.path);
          var att = process.env.Backend_URL_Image + file.filename;
          image.push(att);
        });
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { album: [{ name: album_name, images: image }] } },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      }
      return res.status(200).send(data);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async add_img_album(req, res) {
    try {
      const { albumId } = req.params;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("sommething went wrong");
      }
      let image = [];
      if (req.files) {
        req.files.forEach((file) => {
          console.log(file.path);
          var att = process.env.Backend_URL_Image + file.filename;
          image.push(att);
        });
      }
      const data = await userModel.findOneAndUpdate(
        { _id: req.user._id, "album._id": albumId },
        { $push: { "album.$.images": image }, ...req.body },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("Error updating the document:");
      } else {
        return res.status(200).send("New image added successfully!");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async del_img_album(req, res) {
    try {
      const { albumId } = req.params;
      const { filename } = req.body;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      if (!filename) {
        return res.status(400).send("filename is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("something went wrong");
      }
      const data = await userModel.findOneAndUpdate(
        { _id: exist._id, "album._id": albumId },
        { $pull: { "album.$.images": filename } },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("Error updating the document:");
      } else {
        return res.status(200).send("file delete successfulliy");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async deleteAlbum(req, res) {
    try {
      const { albumId } = req.params;
      if (!albumId) {
        return res.status(400).send("albumId is required");
      }
      const convertedAlbumId = new mongoose.Types.ObjectId(albumId);
      const exist = await userModel.findOne({ "album._id": convertedAlbumId });
      if (!exist) {
        return res.status(400).send("album id is not exist");
      }
      const data = await userModel.findOneAndUpdate(
        { "album._id": convertedAlbumId },
        { $pull: { album: { _id: convertedAlbumId } } },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("album delete successfully");
      } else {
        return res.status(200).send("album delete successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async addwallet(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      if (!amount) {
        return res.status(400).send("amount is required");
      }
      const exist = await userModel.findOne({ _id: id });
      if (!exist) {
        return res.status(404).send("user not found");
      }
      exist.wallet += amount;
      await exist.save();
      return res.status(200).send("amount add successfully");
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async favModel(req, res) {
    try {
      const { userId, status } = req.body;
      const { modelId } = req.params;
      if ((!userId, !modelId)) {
        return res.status(400).send("required the id");
      }
      const userExist = await userModel.findOne({ _id: userId });
      if (!userExist) {
        return res.status(400).send("user not exist");
      }
      const modelExist = await userModel.findOne({ _id: modelId });
      if (!modelExist) {
        return res.status(400).send("model not exist");
      }
      if (status === true) {
        if (userExist.favouriteModels.includes(modelId)) {
          return res.status(200).send("Model is already in favorites");
        }
        userExist.favouriteModels.push(modelId);
        await userExist.save();
        console.log(userExist);
        return res.status(200).send(userExist);
      } else if (status === false) {
        userExist.favouriteModels.pull(modelId);
        await userExist.save();
        console.log(userExist);
        return res.status(200).send(userExist);
      } else {
        return res.status(400).send("something went wrong");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getfavModel(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).send("userId is required");
      }
      const userExist = await userModel.findOne({ _id: userId });
      if (!userExist) {
        return res.status(404).send("user not exist");
      }
      const favModels = await userModel
        .find({ _id: { $in: userExist.favouriteModels } })
        .select("-password -updatedAt -createdAt");
      return res.status(200).send(favModels);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
};

// const MERCHANT_ID = "YOUR_MERCHANT_ID";
// const MERCHANT_KEY = "YOUR_MERCHANT_KEY";
// const WEBSITE = "YOUR_WEBSITE";
// const CHANNEL_ID = "YOUR_CHANNEL_ID";
// const INDUSTRY_TYPE_ID = "YOUR_INDUSTRY_TYPE_ID";
// const CALLBACK_URL = "YOUR_CALLBACK_URL";

// router.post("/add-wallet-amount", async (req, res) => {
//   const { userId, amount } = req.body;

//   try {
//     const existingUser = await User.findById(userId);
//     if (!existingUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Generate unique order ID
//     const orderId = `ORDER${Date.now()}`;

//     // Create the request data for Paytm
//     const requestData = {
//       MID: MERCHANT_ID,
//       ORDER_ID: orderId,
// CUST_ID: userId,
//       INDUSTRY_TYPE_ID,
//       CHANNEL_ID,
//       TXN_AMOUNT: amount.toString(),
//       WEBSITE,
//       CALLBACK_URL,
//       CHECKSUMHASH: "", // Placeholder for the checksum
//     };

//     // Generate checksum using Paytm merchant key
//     requestData.CHECKSUMHASH = generateChecksum(requestData, MERCHANT_KEY);

//     // Make the payment request to Paytm
//     const response = await axios.post("https://securegw.paytm.in/order/process", requestData);

//     // After successful payment, update the user's wallet amount
//     existingUser.wallet += amount;
//     await existingUser.save();

//     // Redirect the user to the Paytm payment page
//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error adding wallet amount:", error.message);
//     return res.status(500).json({ error: "Error adding wallet amount" });
//   }
// });

// // Generate the checksum using Paytm merchant key
// function generateChecksum(data, key) {
//   const sortedData = Object.keys(data)
//     .sort()
//     .reduce((acc, key) => ({ ...acc, [key]: data[key] }), {});

//   const checksumString = Object.keys(sortedData)
//     .map((key) => `${key}=${sortedData[key]}`)
//     .join("&");

//   return crypto.createHmac("sha256", key).update(checksumString).digest("hex");
// }

// module.exports = router;

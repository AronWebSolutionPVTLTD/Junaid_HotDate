const userModel = require("../Model/usersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
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
          res
            .status(201)
            .send({ statusCode: 201, Message: "User Created Successfully" });
        }
      } catch (error) {
        return res.status(500).send(error);
      }
    } else {
      try {
        const data = await userModel.create({
          email: email,
          username: username,
          logintype: logintype
        });

        const token = jwt.sign({ userId: data._id }, SECRET_KEY, {
          expiresIn: "30d",
        });
console.log(token,data)
        if (!data) {
          return res.status(400).send("Failed to create user");
        } else {
          res
            .status(201)
            .send({ statusCode: 201, Message: token });
        }
      } catch (error) {
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
      const match = await bcrypt.compare(password, exist.password);
      if (!match) {
        return res.status(400).send("wrong password");
      } else {
        const token = jwt.sign({ userId: exist._id }, SECRET_KEY, {
          expiresIn: "30d",
        });
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
      const data = await userModel
        .findOne({ _id: id })
        .select("email username introduction image");
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
  async update_user(req, res) {
    try {
      const tokenUser = req.decode;
      const get = await userModel
        .findOne({ _id: tokenUser._id })
        .select("-password");
      let image = null;
      if (req.file) {
        image = req.file.filename;
      } else {
        image = get.image;
      }
      const update = await userModel.findOneAndUpdate(
        { _id: tokenUser._id },
        {
          image: image,
          username: req.body.username,
          introduction: req.body.introduction,
          location: req.body.location,
        },
        { new: true }
      );
      if (!get) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(get);
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async delete_user(req, res) {
    try {
      const data = await userModel.findOneAndDelete({ _id: req.decode._id });
      return res.status(200).send("user delete successfully");
    } catch (e) {
      return res.status(500).send(e);
    }
  },
  async search_user(req, res) {
    try {
      const { limit, page, q } = req.query;

      const data = await userModel
        .find()
        .limit(limit || 7)
        .skip(page > 0 ? (page - 1) * limit : 0)
        .select("username introduction image location");
      if (q) {
        const result = await userModel
          .find({
            $or: [
              { username: { $regex: q, $options: "i" } },
              { location: { $regex: q, $options: "i" } },
            ],
          })
          .limit(limit || 7)
          .skip(page > 0 ? (page - 1) * limit : 0)
          .select("username introduction image location");
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
        { _id: req.decode._id },
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
      const { email } = req.query;
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
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.Nodemailer_id,
          pass: process.env.Nodemailer_pass,
        },
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
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {
          console.log("Email error sent: " + JSON.stringify(error));
          return res.status(400).send(error);
        } else {
          console.log("Email result sent: " + JSON.stringify(result));
          return res.status(200).send("send mail successfully");
        }
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async verifyOtp(req, res) {
    try {
      const { otp } = req.query;
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
  async contactUs(req, res) {
    try {
      const { username, email, reason, message } = req.body;
      if ((!username, !email, !reason, !message)) {
        return res.status(400).send("required the data");
      }
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.Nodemailer_id,
          pass: process.env.Nodemailer_pass,
        },
      });
      var mailOptions = {
        from: email,
        to: process.env.Nodemailer_id,
        subject: "contactUs",
        text: ` Name : ${username},  Email : ${email} , Reason  : ${reason}, Message : ${message}`,
      };
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {
          console.log("Email error sent: " + JSON.stringify(error));
          return res.status(400).send(error);
        } else {
          console.log("Email result sent: " + JSON.stringify(result));
          return res.status(200).send("send mail successfully");
        }
      });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
};

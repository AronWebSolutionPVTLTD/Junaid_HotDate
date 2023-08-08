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
console.log("dsfj")
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

        const exist = await userModel.findOne({ email });
        if (exist) {
          const token = jwt.sign({ userId: exist._id }, SECRET_KEY, {
            expiresIn: "30d",
          });
          exist.token=token;
  exist.save();
          return res.status(200).send({ statusCode: 200, Message: token });
        }else{


        const data = await userModel.create({
          email: email,
          username: username,
          logintype: logintype
        });
        
        console.log(data)
       
        const token = jwt.sign({ userId: data._id }, SECRET_KEY, {
          expiresIn: "30d",
        });
        data.token=token;
        data.save();

     
        if (!data) {
          return res.status(400).send("Failed to create user");
        } else {
          res
            .status(201)
            .send({ statusCode: 201, Message: token });
        }}
      } catch (error) {
        console.log(error )
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
      const data = await userModel.findOne({ _id: id }).select("-password");
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
        image = "http://localhost:5000/" + req.file.filename;
      } else {
        image = get.image;
      }
      const update = await userModel.findOneAndUpdate(
        { _id: tokenUser._id },
        {
          ...req.body,
          image: image,
        },
        { new: true }
      );
      if (!get) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send(update);
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
  async reset_pass(req, res) {
    try {
      const { new_password, confirm_password } = req.body;
      if ((!new_password, !confirm_password)) {
        return res.status(400).send("required the data");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("Enter the same password");
      }
      const hash = bcrypt.hashSync(confirm_password, 10);
      console.log(confirm_password);
      const data = await userModel.findOneAndUpdate(
        { _id: req.decode._id },
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
      const get_pass = await userModel.findOne({ _id: req.decode._id });
      const password = await bcrypt.compare(old_password, get_pass.password);
      if (!password) {
        return res.status(400).send("wrong old_password");
      }
      if (new_password !== confirm_password) {
        return res.status(400).send("enter the same password");
      }
      const hash = bcrypt.hashSync(confirm_password, 10);
      const data = await userModel.findOneAndUpdate(
        { _id: req.decode._id },
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
      const { userId } = req.params;
      const data = await userModel
        .findById({ _id: userId })
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
  async model_mail(req, res) {
    try {
      const email = req.decode.email;
      const verificationLink = `http://localhost:5000/api/loginVerify`;
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.Nodemailer_id,
          pass: process.env.Nodemailer_pass,
        },
      });
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
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {
          console.log("Email error sent: " + JSON.stringify(error));
          return res.status(400).send(error);
        } else {
          console.log("Email result sent: " + JSON.stringify(result));
          return res.status(200).send("send mail successfully");
        }
      });
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async model_verify(req, res) {
    try {
      const data = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { isModel: true },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("model verify successfully");
      }
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

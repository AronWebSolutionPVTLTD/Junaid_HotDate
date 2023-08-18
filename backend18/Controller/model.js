const userModel = require("../Model/usersModel");
const nodemailer = require("nodemailer");
const Mailsend = require("../helper/mail");
const bcrypt = require("bcrypt");
module.exports = {
  async addModel(req, res) {
    try {
      const {
        firstName,
        lastName,
        DOB,
        lookingFor,
        marital_status,
        booking_price,
        body_type,
        username,
        email,
        password,
        language,
      } = req.body;
      console.log(req.body);
      if (
        (!firstName,
        !lastName,
        !DOB,
        !lookingFor,
        !email,
        !password,
        !booking_price,
        !marital_status,
        !username,
        !body_type,
        !language)
      ) {
        return res.status(400).send("Required data is missing.");
      }
      let images = [];
      let videos = [];
      // Check if images were uploaded
      if (req.files["images"]) {
        for (const image of req.files["images"]) {
          images.push(`${process.env.Backend_URL_Image}${image.filename}`);
        }
      }
      // Check if videos were uploaded
      if (req.files["videos"]) {
        for (const video of req.files["videos"]) {
          videos.push(`${process.env.Backend_URL_Image}${video.filename}`);
        }
      }
      const hash = await bcrypt.hashSync(password, 10);
      const data = await userModel.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
        username: username,
        DOB: DOB,
        lookingFor: lookingFor,
        booking_price: booking_price,
        marital_status: marital_status,
        body_type: body_type,
        language: language,
        role: "model",
        images: images,
        videos: videos,
      });
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        const mailOptions = {
          from: email,
          to: process.env.Nodemailer_admin,
          subject: "New Model Created",
          html: `<h4>
          Dear Admin,

          A new Model request has been submitted for approval. The Model name is ${username}.
    
          Please review the request and take appropriate action.
    
          Best regards,
          The Model Management Team</h4>`,
        };
        console.log("Notification email sent to admin");
        Mailsend(req, res, mailOptions);
        return res
          .status(201)
          .json({ message: "Model request submitted for approval." });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async find(req, res) {
    try {
      const { q } = req.query;
      const data = await userModel.find({ role: "model" });
      const total = await userModel.count();
      console.log(total, "total");
      if (q) {
        let result = await userModel.find({
          $or: [
            { role: "model" },
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
          ],
          role: "model",
        });
        console.log(q, result);
        return res.status(200).send({ data: result, total: total });
      }
      return res.status(200).send({ data, total: total });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async booking_model(req, res) {
    try {
      const { modelId } = req.params;
      const { userId } = req.body;
      const exist = await userModel.findOne({ _id: modelId });
      if (exist.booking_by !== undefined) {
        return res.status(404).send("model already booked");
      }
      const update = await userModel.findOneAndUpdate(
        { _id: modelId },
        { booking_by: userId },
        { new: true }
      );

      let html = `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Model Book </title>
            </head>
            <body>
                <p>Hello Model</p>
                <p>Your booking has been confirmed. We look forward to seeing you soon!</p>
            </body>
            </html>
            `;
      const mailOptions = {
        from: req.user.email,
        to: update.email,
        subject: "Book Model",
        html: html,
      };
      Mailsend(req, res, mailOptions);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },

  async update_wallet(req, res) {
    try {
      const { modelId } = req.params;
      const { userId, amount } = req.body;
      if ((!modelId, !amount)) {
        return res.status(400).send("required the data");
      }

      const get = await userModel.findOne({ _id: modelId });
      if (!get) {
        return res.status(400).send("model not exist");
      }
      const data = await userModel.findOneAndUpdate(
        { _id: modelId },
        { paymentUser: userId, wallet: get.wallet + amount },
        { new: true }
      );
      const user = await userModel.findOneAndUpdate(
        { _id: userId },
        { wallet: req.user.wallet - amount },
        { new: true }
      );
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("data update successfully");
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error" });
    }
  },
  async is_modelverify(req, res) {
    try {
      const { modelId } = req.params;
      const { status } = req.body;
      const exist = await userModel.findOne({ _id: modelId });
      if (!exist) {
        return res.status(404).send("model not found");
      }

      let text = "";
      if (status == "accept") {
        text = "Congratulations! Your account registration has been accepted.";
      } else {
        text = "Your account registration has been rejected.";
      }
      const mailOptions = {
        from: req.user.email,
        to: exist.email, // Make sure exist.email contains a valid email address
        subject: "Account registration", // Subject of the email
        html: `<h4>${text}</h4>`, // Email content in HTML format
      };

      if (!exist.email) {
        return res.status(400).send("Email address not found for the model");
      }

      if (status == "accept") {
        const data = await userModel.findOneAndUpdate(
          { _id: exist._id },
          { isverify: true },
          { new: true }
        );
        Mailsend(req, res, mailOptions);
      } else if (status == "reject") {
        const data = await userModel.findByIdAndDelete(
          { _id: exist._id },
          { new: true }
        );
        Mailsend(req, res, mailOptions);
      } else {
        return res.status(500).send("something went wrong");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async isLive(req, res) {
    try {
      const data = await userModel.find({ isLive: true });
      if (!data) {
        return res.status(400).send("data not found");
      } else {
        return res.status(200).send(data);
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

//  async update_wallet (req, res) => {
//   const { modelId, userId, amount } = req.body;
//   try {
//     const existingModel = await model.findById(modelId);
//     if (!existingModel) {
//       return res.status(404).json({ error: "Model not found" });
//     }

//     const existingUser = await userModel.findById(userId);
//     if (!existingUser) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Generate unique order ID
//     const orderId = `ORDER${Date.now()}`;
//     // Create the request data for Paytm
//     const requestData = {
//       MID: MERCHANT_ID,
//       ORDER_ID: orderId,
//       CUST_ID: modelId,
//       INDUSTRY_TYPE_ID,
//       CHANNEL_ID,
//       TXN_AMOUNT: amount.toString(),
//       WEBSITE,
//       CALLBACK_URL,
//       CHECKSUMHASH: "", // Placeholder for the checksum
//     };

//     // Generate checksum using Paytm merchant key
//     requestData.CHECKSUMHASH = generateChecksum(requestData, MERCHANT_KEY);

//     // Save the transaction details in the model
//     existingModel.wallet += amount;
//     existingModel.paymentUser = userId;
//     await existingModel.save();

//     // Deduct the amount from the user's wallet
//     existingUser.wallet -= amount;
//     await existingUser.save();

//     // Make the payment request to Paytm
//     const response = await axios.post("https://securegw.paytm.in/order/process", requestData);

//     // Redirect the user to the Paytm payment page
//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error making payment:", error.message);
//     return res.status(500).json({ error: "Error making payment" });
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

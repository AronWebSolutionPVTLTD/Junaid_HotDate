const clubModel = require("../Model/clubModel");
const mongoose = require("mongoose");
const userModel = require("../Model/usersModel");
const nodemailer = require("nodemailer");
const Mailsend = require("../helper/mail");

module.exports = {
  async create_club(req, res) {
    const {
      clubname,
      ownerId,
      location,
      description,
      clubtype,
      booking_price,
    } = req.body;
    try {
      if (!clubname) {
        return res.status(400).send("Clubname is required");
      }
      if (!clubtype) {
        return res.status(400).send("Clubtype is required");
      }
      const userExist = await userModel.findOne({ _id: ownerId });
      if (!userExist) {
        return res.status(400).send("user not exist");
      }
      let image = [];
      let video = [];
      if (req.files["image"]) {
        for (const images of req.files["image"]) {
          image.push(`${process.env.Backend_URL_Image}${images.filename}`);
        }
      }
      // Check if videos were uploaded
      if (req.files["video"]) {
        for (const videos of req.files["video"]) {
          video.push(`${process.env.Backend_URL_Image}${videos.filename}`);
        }
      }
      const data = await clubModel.create({
        ownerId: userExist._id,
        clubname: clubname,
        location: location,
        clubtype: clubtype,
        owner_name: userExist.username,
        image: image,
        video: video,
        description: description,
        booking_price: booking_price,
      });
      if (!data) {
        return res.status(400).send("Failed to Create club");
      } else {
        const mailOptions = {
          from: process.env.Nodemailer_id,
          to: process.env.Nodemailer_admin,
          subject: "New Club Created",
          html: `<h4>
          Dear Admin,
          A new club request has been submitted for approval. The club name is ${clubname}.
          Please review the request and take appropriate action.
          Best regards,
          The Club Management Team</h4>`,
        };
        console.log("Notification email sent to admin");
        Mailsend(req, res, mailOptions);
        return res
          .status(201)
          .json({ message: "Club request submitted for approval." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },

  async delete_club(req, res) {
    const { clubId } = req.params;
    try {
      if (!clubId) {
        return res.status(400).send("club id required");
      } else {
        const exist = await clubModel.findOne({ _id: clubId });
        if (!exist) {
          return res.status(404).send("Club doesn't exist");
        } else {
          const data = await clubModel.deleteOne({ _id: exist._id });
          if (!data) {
            return res.status(400).send("Failed to delete club");
          } else {
            return res.status(200).send("Club deleted successfully");
          }
        }
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async update_club(req, res) {
    const { clubId } = req.params;
    const { dltImage, dltVideo } = req.body;
    try {
      if (!clubId) {
        return res.status(400).send("clubId is required");
      }
      const exist = await clubModel.findOne({ _id: clubId });
      if (!exist) {
        return res.status(404).send("Club doesn't exist");
      }
      let mainImage = null;
      if (req.files && req.files["mainImage"]) {
        for (const uploadedImage of req.files["mainImage"]) {
          mainImage = `${process.env.Backend_URL_Image}${uploadedImage.filename}`;
        }
      } else {
        mainImage = exist.mainImage;
      }
      let image = exist.image; // Create a copy of the existing image array
      let video = exist.video; // Create a copy of the existing video array

      let removeImage = [];
      let removeVideo = [];
      if (dltImage) {
        removeImage = dltImage.split(",");
      }
      if (dltVideo) {
        removeVideo = dltVideo.split(",");
      }
      // Check if new images were uploaded
      if (req.files && req.files["image"]) {
        for (const uploadedImage of req.files["image"]) {
          image.push(
            `${process.env.Backend_URL_Image}${uploadedImage.filename}`
          );
        }
      }

      // Check if new videos were uploaded
      if (req.files && req.files["video"]) {
        for (const uploadedVideo of req.files["video"]) {
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
      console.log(image);
      const data = await clubModel.findByIdAndUpdate(
        { _id: exist._id },
        {
          ...req.body,
          mainImage: mainImage,
          image: image,
          video: video,
        },
        { new: true }
      );

      if (!data) {
        return res.status(400).send("Failed to update Club");
      } else {
        return res.status(200).send("Club Updated");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  },
  async search_club(req, res) {
    try {
      const { q } = req.query;
      const get = await clubModel.find({});
      console.log(get);
      if (q) {
        let data = await clubModel.find({
          $or: [
            { clubname: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
          ],
        });
        return res.status(200).send(data);
      }
      return res.status(200).send(get);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async bookingClub(req, res) {
    try {
      const { cludId } = req.params;
      const { payment, userId } = req.body;
      if (!payment) {
        return res.status(400).send("payment is required");
      }
      const exist = await clubModel.findOne({ _id: cludId });
      if (!exist) {
        return res.status(404).send("clud not exist");
      }
      // console.log(exist)
      let update = {
        user: userId,
        payment: payment,
      };
      if (exist?.customer.length !== 0) {
        for (let i = 0; i < exist?.customer.length; i++) {
          if (exist.customer[i].user.toString() === userId.toString()) {
            return res.status(400).json("customer already added");
          }
        }
      }
      if (payment == true) {
        const data = await clubModel.findOneAndUpdate(
          { _id: exist._id },
          { $push: { customer: update } },
          { new: true }
        );
        return res.status(200).send("booking club successfully");
      } else {
        return res.status(400).send("something went wrong");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getClub(req, res) {
    try {
      const { id } = req.params;
      const data = await clubModel
        .findOne({ _id: id })
        .populate("customer ownerId", "image username");
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
  async club_verify(req, res) {
    try {
      const { clubId } = req.params;
      const { status } = req.body;
      if (!clubId) {
        return re.status(400).send("clubId  Is Required ");
      }
      const exist = await clubModel
        .findOne({ _id: clubId })
        .populate("ownerId", "email");
      if (!exist) {
        return res.status(400).send("club not exist");
      }
      let text = "";
      if (status == "accept") {
        text = "Congratulations! Your account registration has been accepted.";
      } else {
        text = "Your account registration has been rejected.";
      }
      let email = exist.ownerId.email;
      console.log(email);
      if (!status) {
        return res.status(400).send("status Is Required");
      }

      const mailOptions = {
        from: process.env.Nodemailer_id,
        to: email,
        subject: "Account registration",
        html: `<h4>${text}</h4>`,
      };
      if (status == "accept") {
        const data = await clubModel.findOneAndUpdate(
          { _id: exist._id },
          { isverify: true },
          { new: true }
        );
        Mailsend(req, res, mailOptions);
        return res.status(200).send("Acceptance email sent successfully");
      } else if (status == "reject") {
        const data = await clubModel.findByIdAndDelete(
          { _id: exist._id },
          { new: true }
        );
        Mailsend(req, res, mailOptions);
        return res.status(200).send("Rejection email sent successfully");
      } else {
        return res.status(400).send("something went wrong");
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  },
};

// const PAYTM_MERCHANT_KEY = 'your_merchant_key';
// const PAYTM_MID = 'your_merchant_id';
// const PAYTM_WEBSITE = 'WEBSTAGING';

// // Define the payment route
// app.post('/pay', async (req, res) => {
//   const { orderId, amount, email, mobileNumber } = req.body;
//   try {
//     // Generate a unique transaction token
//     const transactionToken = await generateTransactionToken(orderId, amount);

//     // Create a payment request
//     const paymentRequest = {
//       orderId,
//       transactionToken,
//       amount,
//       customerId: email,
//       mobileNumber,
//       email,
//       website: PAYTM_WEBSITE,
//       callbackUrl: 'http://yourwebsite.com/callback' // Replace with your callback URL
//     };

//     // Make a request to initiate the payment
//     const response = await axios.post('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction?mid=' + PAYTM_MID + '&orderId=' + orderId, paymentRequest, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + transactionToken
//       }
//     });
//     // Return the payment URL to the client
//     res.json({ paymentUrl: response.data.body.txnToken });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Failed to initiate payment' });
//   }
// });
// // Generate the transaction token using Paytm API
// async function generateTransactionToken(orderId, amount) {
//   try {
//     const response = await axios.post('https://securegw-stage.paytm.in/theia/api/v1/token?mid=' + PAYTM_MID + '&orderId=' + orderId, {
//       amount,
//       customerId: 'your_customer_id' // Replace with your customer ID
//     });

//     return response.data.body.txnToken;
//   } catch (error) {
//     throw new Error('Failed to generate transaction token');
//   }
// }

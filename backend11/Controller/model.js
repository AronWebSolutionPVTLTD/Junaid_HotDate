const model = require("../Model/model");
const userModel = require("../Model/usersModel");
module.exports = {
  async addModel(req, res) {
    try {
      const {
        firstName,
        lastName,
        DOB,
        lookingFor,
        marital_status,
        body_type,
        language,
      } = req.body;
      console.log(req.body);
      if (
        (!firstName,
        !lastName,
        !DOB,
        !lookingFor,
        !marital_status,
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
      const data = await model.create({
        firstName: firstName,
        lastName: lastName,
        DOB: DOB,
        lookingFor: lookingFor,
        marital_status: marital_status,
        body_type: body_type,
        language: language,
        images: images,
        videos: videos,
      });
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
  async find(req, res) {
    try {
      const { limit, q, page } = req.query;
      const data = await model.find();
      const total = await model.count();
      console.log(total, "total");
      if (q) {
        let result = await model.find({
          $or: [
            { firstName: { $regex: q, $options: "i" } },
            { lastName: { $regex: q, $options: "i" } },
          ],
        });

        console.log(q, result);

        return res.status(200).send({ data: result, total: total });
      }

      res.status(200).send({ data, total: total });
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async update(req, res) {
    try {
      const { modelId, dltImage, dltVideo } = req.body;
      if (!modelId) {
        return res.status(404).send("required the modelId");
      }
      const exist = await model.findOne({ _id: modelId });
      if (!exist) {
        return res.status(404).send("model not found");
      }
      let mainImage = null;
      if (req.files && req.files["mainImage"]) {
        for (const uploadedImage of req.files["mainImage"]) {
          mainImage = `${process.env.Backend_URL_Image}${uploadedImage.filename}`;
        }
      } else {
        mainImage = exist.mainImage;
      }
      let image = exist.images; // Create a copy of the existing image array
      let video = exist.videos; // Create a copy of the existing video array
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
      const data = await model.findOneAndUpdate(
        { _id: modelId },
        {
          ...req.body,
          mainImage: mainImage,
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
  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(404).send("required the modelId");
      }
      const exist = await model.findOne({ _id: id });
      if (!exist) {
        return res.status(404).send("model not found");
      }
      const data = await model.findByIdAndDelete({ _id: id });
      if (!data) {
        return res.status(400).send("something went wrong");
      } else {
        return res.status(200).send("delete successfully");
      }
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async booking_model(req, res) {
    try {
      const { modelId } = req.params;
      const { status } = req.query;
      const exist = await model
        .findOne({ _id: modelId })
        .select(
          "firstName booking_by mainImage lastName location booking_price description"
        )
        .populate("booking_by", "username");
      if (status == "book_model") {
        console.log(exist.booking_by);
        if (exist.booking_by !== undefined) {
          return res.status(404).send("model already booked");
        }
        const update = await model.findOneAndUpdate(
          { _id: modelId },
          { booking_by: req.decode._id },
          { new: true }
        );
        return res.status(200).send("model book succsessfully");
      }
      return res.status(200).send(exist);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  },
  async getModel(req, res) {
    try {
      const { id } = req.params;
      const data = await model.findOne({ _id: id });
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
  async follow_request(req, res) {
    const { modelId } = req.params;
    try {
      const get = await model.findById(modelId);
      if (!get) {
        return res.status(404).json({ error: "model not found" });
      }
      const followersIndex = get.followers.findIndex(
        (p) => p.user.toString() === req.decode._id
      );
      if (followersIndex !== -1) {
        return res.status(400).json({ error: "user already added" });
      }
      get.followers.push({ user: req.decode._id });
      await get.save();
      res.status(200).json({ message: "user request sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  async update_follow_request(req, res) {
    const { modelId, followerId } = req.params;
    const { status } = req.body;
    try {
      // Find the event by ID
      const data = await model.findById(modelId);
      if (!data) {
        return res.status(404).json({ error: "Event not found" });
      }
      console.log(followerId);
      const follower = data.followers.find(
        (el) => el._id.toString() === followerId
      );
      if (!follower) {
        return res.status(404).json({ error: "user  not found" });
      }
      follower.status = status;
      await data.save();
      return res.status(200).json({ message: "data updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
  async update_wallet(req, res) {
    try {
      const { modelId, amount } = req.body;
      if ((!modelId, !amount)) {
        return res.status(400).send("required the data");
      }
      const get = await model.findOne({ _id: modelId });
      if (!get) {
        return res.status(400).send("model not exist");
      }
      const data = await model.findOneAndUpdate(
        { _id: modelId },
        { paymentUser: req.decode._id, wallet: get.wallet + amount },
        { new: true }
      );
      const user = await userModel.findOneAndUpdate(
        { _id: req.decode._id },
        { wallet: req.decode.wallet - amount },
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

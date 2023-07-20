const clubModel = require("../Model/clubModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
module.exports = {
  async create_club(req, res) {
    const { clubname, location, description, clubtype } = req.body;
    try {
      if (!clubname) {
        return res.status(400).send("Clubname is required");
      }
      if (!clubtype) {
        return res.status(400).send("Clubtype is required");
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
        ownerId: req.decode._id,
        clubname: clubname,
        location: location,
        owner_name: req.decode.username,
        image: image,
        video: video,
        description: description,
      });
      if (!data) {
        return res.status(400).send("Failed to Create club");
      } else {
        return res.status(201).send("Club Created Successfully");
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },

  async delete_club(req, res) {
    const { id } = req.body;
    try {
      if (!id) {
        return res.status(400).send("club id required");
      } else {
        const exist = await clubModel.findOne({ _id: id });
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
    const { id, dltImage, dltVideo } = req.body;
    try {
      if (!id) {
        return res.status(400).send("club id required");
      }
      const exist = await clubModel.findOne({ _id: id });
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
      const { status } = req.body;
      const exist = await clubModel
        .findOne({ _id: cludId })
        .select(
          `mainImage booking_price customer customerCount description location clubname owner_name`
        );
      if (!exist) {
        return res.status(404).send("clud not exist");
      }
      if (status == "book_club") {
        exist.customer.forEach((el, i) => {
          if (el.toString() === req.decode._id.toString()) {
            return res.status(404).send("customer already exist");
          }
        });
        const updateQuerry = {};
        updateQuerry["$push"] = { customer: req.decode._id };
        const data = await clubModel.findByIdAndUpdate(
          { _id: exist._id },
          { updateQuerry, customerCount: exist.customerCount + 1 },
          { new: true }
        );
        return res.status(200).send("booking club successfully");
      }
      return res.status(200).send(exist);
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
};

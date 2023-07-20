const model = require("../Model/model");

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
        let result = await model
          .find({
            $or: [
              { firstName: { $regex: q, $options: "i" } },
              { lastName: { $regex: q, $options: "i" } },
            ],
          })
          .limit(limit || 7)
          .skip(page > 0 ? (page - 1) * limit : 0);
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
};

const eventModel = require("../Model/event");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = {
  async createEvent(req, res) {
    try {
      const { eventName, date, location, description, type } = req.body;
      if ((!eventName, !date, !location, !description, !type)) {
        return res.status(400).send("Required data is missing.");
      }
      let images = [];
      let videos = [];
      if (req.files["images"]) {
        for (const image of req.files["images"]) {
          images.push(`${process.env.Backend_URL_Image}${image.filename}`);
        }
      }
      if (req.files["videos"]) {
        for (const video of req.files["videos"]) {
          videos.push(`${process.env.Backend_URL_Image}${video.filename}`);
        }
      }
      const data = await eventModel.create({
        ...req.body,
        images: images,
        videos: videos,
        userId: req.body.userId,
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
      const { q } = req.query;
      const data = await eventModel.find();
      const total = await eventModel.count();
      console.log(total, "total");
      if (q) {
        let result = await eventModel.find({
          $or: [
            { eventName: { $regex: q, $options: "i" } },
            { type: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
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
  async get_event(req, res) {
    try {
      const { id } = req.params;
      console.log(id);
      const data = await eventModel
        .findOne({ _id: id })
        .populate("userId", " image username");

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
  async update_event(req, res) {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        return res.status(404).send("required the eventId");
      }
      const exist = await eventModel.findOne({ _id: eventId });
      if (!exist) {
        return res.status(404).send("event not found");
      }
      console.log(exist);
      let images = exist.images;
      if (req.files["images"] && req.files["images"].length > 0) {
        const newImages = req.files["images"].map((image) => image.filename);
        images = [...images, ...newImages];
        console.log(images);
      }
      let mainImage = null;
      if (req.files && req.files["mainImage"]) {
        for (const uploadedImage of req.files["mainImage"]) {
          mainImage = uploadedImage.filename;
        }
      } else {
        mainImage = exist.mainImage;
      }
      if (req.body.removeImages && req.body.removeImages.length > 0) {
        const imagesToRemove = req.body.removeImages;
        images = images.filter((image) => !imagesToRemove.includes(image));
      }

      let videos = exist.videos;
      if (req.files["videos"] && req.files["videos"].length > 0) {
        const newVideos = req.files["videos"].map((video) => video.filename);
        videos = [...videos, ...newVideos];
      }

      if (req.body.removeVideos && req.body.removeVideos.length > 0) {
        const videosToRemove = req.body.removeVideos;
        videos = videos.filter((video) => !videosToRemove.includes(video));
      }
      const data = await eventModel.findOneAndUpdate(
        { _id: eventId },
        {
          ...req.body,
          images: images,
          mainImage: mainImage,
          videos: videos,
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
  async delete_event(req, res) {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        return res.status(404).send("required the eventId");
      }
      const exist = await eventModel.findOne({ _id: eventId });
      if (!exist) {
        return res.status(404).send("event not found");
      }
      const data = await eventModel.findByIdAndDelete({ _id: eventId });
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
  async requestParticipant(req, res, next) {
    try {
      console.log(req.user._id);
      const { eventId } = req.params;
      // console.log("Event ID:", eventId);
      const event = await eventModel.findById(eventId);
      // console.log("Event:", event);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      const userIdString =
        req.user && req.user._id ? req.user._id.toString() : null;
      console.log("UserID String:", userIdString);
      const participantExists = event.participants.find(
        (participant) =>
          participant.user && participant.user.toString() === userIdString
      );
      console.log("Participant Exists:", participantExists);

      if (participantExists) {
        return res.status(400).send("Participant already added");
      }

      event.participants.push({ user: req.user._id });
      await event.save();
      res.status(200).send("Participant request sent successfully");
    } catch (error) {
      console.error(error);
      return next(error);
    }
  },
  async updateParticipantStatus(req, res, next) {
    const { eventId, participantId } = req.params;
    const { status } = req.body;
    try {
      // Find the event by ID
      const event = await eventModel.findById(eventId);
      if (!event) {
        return res.status(404).send("Event not found");
      }
      const participant = event.participants.find(
        (p) => p._id.toString() === participantId
      );
      // console.log(participant)
      if (!participant) {
        return res.status(404).send("Participant not found");
      }
      if (status == "Rejected") {
        const data = await eventModel.findOneAndUpdate(
          { _id: eventId, participants: [{ _id: participantId }] },
          { $pull: { participants: { _id: participantId } } }
        );
        if (!data) {
          return res.status(400).send("something went wrong");
        }
        return res.status(200).send("Rejected  request");
      } else if (status == "Approved") {
        participant.status = "Approved";
        await event.save();
        return res.status(200).send("Approved  request");
      }
    } catch (error) {
      console.error(error);
      return next();
    }
  },
};

//   async promote(req, res) {
//     try {
//       const eventId = req.params.eventId;
//       // Perform any necessary validation and authorization checks here
//       // ...

//       // Retrieve the event from the database
//       const event = await eventModel.findById(eventId);
//       if (!event) {
//         return res.status(404).json({ error: "Event not found" });
//       }

//       // Check if the event is already promoted
//       if (event.isPromoted) {
//         return res.status(400).json({ error: "Event is already promoted" });
//       }

//       // Process the payment and update the event document
//       // ... (Payment processing logic goes here)

//       // Update the event as promoted
//       event.isPromoted = true;
//       await event.save();

//       // Return a success response
//       return res.status(200).json({ message: "Event successfully promoted" });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   }

// async promote(req, res) {
//     try {
//         const eventId = req.params.eventId;

//         // Retrieve the event from the database
//         const event = await eventModel.findById(eventId);
//         if (!event) {
//             return res.status(404).json({ error: "Event not found" });
//         }
//         // Check if the event is already promoted
//         if (event.isPromoted) {
//             return res.status(400).json({ error: "Event is already promoted" });
//         }

//         // Process the payment using the Stripe SDK
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: 1000, // Amount in cents, adjust according to your pricing
//             currency: "usd", // Currency code
//             payment_method: req.body.paymentMethodId,
//             description: "Event promotion payment for Event XYZ", // Additional payment description
//             metadata: {
//                 eventId: eventId, // Additional metadata about the event
//                 userId: "64ae7a78fd24fceaf4cd831d", // Additional metadata about the user
//             },
//         });

//         // Handle the payment response, update the event if successful
//         if (paymentIntent.status === "succeeded") {
//             // Update the event as promoted
//             event.isPromoted = true;
//             await event.save();
//             if (paymentIntent) {
//                 return res.status(200).json({ message: "Event successfully promoted" });
//             }
//         } else {
//             console.error(paymentIntent); // Log the payment error for debugging
//             return res.status(500).json({ error: "Payment failed" });
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// }

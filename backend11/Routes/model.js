const express = require("express");
const router = express.Router();
const modelController = require("../Controller/model");
const multer = require("multer");
const path = require("path");
const { verifyToken } = require("../helper/middleware");
// Define the upload file path
const uploadFilePath = path.resolve(__dirname, "../", "public/uploads");
// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFilePath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Define the file filter logic
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and MP4/MKV files are allowed."
      ),
      false
    );
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post(
  "/addModel",
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  modelController.addModel
);
router.get("/getModel/:id", modelController.getModel);
router.get("/models", modelController.find);
router.put(
  "/update_model",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "mainImage", maxCount: 1 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  modelController.update
);
router.delete("/delete_model/:id", verifyToken, modelController.delete);
router.post(
  "/:modelId/follow_request",
  verifyToken,
  modelController.follow_request
);
router.post(
  "/:modelId/:followerId/update_follow_request",
  verifyToken,
  modelController.update_follow_request
);
router.put("/update_wallet", verifyToken, modelController.update_wallet);

router.put(
  "/booking_model/:modelId",
  verifyToken,
  modelController.booking_model
);
module.exports = router;
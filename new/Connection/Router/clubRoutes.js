const express = require("express");
const club = require("../Controller/clubController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
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
      new Error("Invalid file type. Only JPEG, PNG, and MP4/MKV files are allowed."),
      false
    );
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post(
  "/create_club",
  upload.fields([
    { name: "image", maxCount: 1000 * 1000 },
    { name: "video", maxCount: 1000 * 1000 },
  ]),
  club.create_club
);

router.delete("/delete_club", club.delete_club);

router.put(
  "/update_club",
  upload.fields([
    { name: "image", maxCount: 1000 * 1000 },
    { name: "video", maxCount: 1000 * 1000 },
  ]),
  club.update_club
);

module.exports = router;

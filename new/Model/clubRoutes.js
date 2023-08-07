const express = require("express");
const club = require("../Controller/clubController");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, "./Public/images");
    } else if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/MPEG-4" ||
      file.mimetype === "video/mkv"
    ) {
      cb(null, "./Public/videos");
    }
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "image") {
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
      ? cb(null, true)
      : cb(null, false);
  } else if (file.fieldname === "video") {
    file.mimetype === "video/mp4" ||
    file.mimetype === "video/MPEG-4" ||
    file.mimetype === "video/mkv"
      ? cb(null, true)
      : cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

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

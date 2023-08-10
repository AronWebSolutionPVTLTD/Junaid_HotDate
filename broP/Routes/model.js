const express = require("express")
const router = express.Router()
const modelController = require("../Controller/model")
const multer = require("multer");
const path = require("path");
const {verifyToken,verifyAdmin,verifyUser,verifyModel} = require("../helper/middleware")
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

router.post("/addModel", upload.fields([{ name: 'images', maxCount: 1000 * 100 * 10 }, { name: 'videos', maxCount: 1000 * 100 * 10 }]), modelController.addModel)
router.get("/models", modelController.find)
router.put("/update_wallet/:modelId",verifyUser,modelController.update_wallet)
router.put("/booking_model/:modelId",verifyUser,modelController.booking_model)
router.put("/is_modelverify/:modelId",verifyAdmin,modelController.is_modelverify)
router.get("/isLive",modelController.isLive)
module.exports = router








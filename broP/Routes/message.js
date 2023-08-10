const express = require("express")
const router = express.Router()
const messageController = require("../Controller/message")
const { verifyToken,verifyAdmin,verifyUser } = require("../helper/middleware")
const multer = require("multer");
const path = require("path");
const uploadFilePath = path.resolve(__dirname, "../", "public/uploads");
const storage = multer.diskStorage({
  destination: uploadFilePath,
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100000 * 10000 * 100,
  },
});
router.post("/publicChat",verifyToken,upload.any("attachement"),messageController.publicChat)
router.post("/privateChat",verifyToken,upload.any("attachement"),messageController.privateChat)
router.get("/messages",verifyToken,messageController.messages)
router.put("/update_message/:id",verifyToken,messageController.update_message)
router.delete("/delete_message/:id",verifyToken,messageController.delete_message)
module.exports=router
const express = require("express");
const user = require("../Controller/userController");
const router = express.Router();
const { verifyToken } = require("../helper/middleware")
const eventController =require("../Controller/event")
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
    fileSize: 1024 * 1024 * 5,
  },
});

router.post("/register", user.signup);
router.post("/login", user.login);
router.get("/forget",user.forget)
router.post("/verifyOtp",user.verifyOtp)
router.get("/findOne/:id", user.findOne)
router.put("/update_user", verifyToken, upload.single("image"),user.update_user)
router.delete("/delete_user", verifyToken, user.delete_user)
router.get("/search_user",user.search_user)
router.post("/logout",verifyToken,user.logout)

router.post("/events/:eventId/participants",verifyToken, eventController.requestParticipant);
router.post("/contactUs",user.contactUs)
module.exports = router;

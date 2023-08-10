const express = require("express")
const router = express.Router();
const travelController = require("../Controller/travel")
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
    fileSize: 1024 * 1024 * 5,
  },
});
router.post("/createTravle", upload.single("image"), travelController.createtravel)
router.get("/search_travel", travelController.search_travel)
router.get("/travel/:id", travelController.findOne)
router.put("/update_travel", verifyToken, upload.single("image"), travelController.update_travel)
router.delete("/delete_travel/:travelId", verifyToken, travelController.delete_travel)
module.exports = router
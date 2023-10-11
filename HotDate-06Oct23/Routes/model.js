const express = require("express")
const router = express.Router()
const modelController = require("../Controller/model")
const {verifyToken,verifyAdmin,verifyUser,verifyModel} = require("../helper/middleware")
// Define the upload file path
const upload = require("../helper/multer")
router.post("/addModel", upload.fields([{ name: 'images', maxCount: 1000 * 100 * 10 }, { name: 'videos', maxCount: 1000 * 100 * 10 }]), modelController.addModel)
router.get("/models", modelController.find)
router.post("/verify_mail/:modelId",modelController.verify_mail)
router.put("/update_wallet/:modelId",verifyUser,modelController.update_wallet)
router.put("/booking_model/:modelId",verifyUser,modelController.booking_model)
router.put("/is_modelverify/:modelId",verifyAdmin,modelController.is_modelverify)
router.get("/isLive",modelController.isLive)
module.exports = router








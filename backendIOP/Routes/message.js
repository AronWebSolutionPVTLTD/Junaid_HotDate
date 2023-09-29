const express = require("express")
const router = express.Router()
const upload = require("../helper/multer")
const messageController = require("../Controller/message")
const { verifyToken,verifyAdmin,verifyUser } = require("../helper/middleware")

router.post("/publicChat",verifyToken,upload.any("attachement"),messageController.publicChat)
router.post("/privateChat",verifyToken,upload.any("attachement"),messageController.privateChat)
router.get("/messages",verifyToken,messageController.messages)
router.put("/update_message/:id",verifyToken,messageController.update_message)
router.delete("/delete_message/:id",verifyToken,messageController.delete_message)
module.exports=router
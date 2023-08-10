const express = require("express")
const router = express.Router()
const faq = require("../Controller/faq")
const {verifyAdmin} = require("../helper/middleware")
router.post("/create_faq",verifyAdmin,faq.create_faq)
router.get("/getall_faq",faq.get_faq)
router.put("/update_faq/:id",verifyAdmin,faq.update_faq)
router.delete("/delete_faq",verifyAdmin,faq.delete_faq)

module.exports=router
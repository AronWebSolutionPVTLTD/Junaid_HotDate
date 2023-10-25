const express = require("express");
const user = require("../Controller/userController");
const router = express.Router();
const {
  verifyToken,
  verifyAdmin,
  verifyUser,
  verifyModel,verifyTokenActive
} = require("../helper/middleware");

const userController = require("../Controller/userController");
const upload = require("../helper/multer");
console.log(upload);
router.post("/register", user.signup);
router.post("/login", user.login);
router.get("/active/:id",user.userLoggedIN)
router.get("/active_users",user.activeUsers)
router.get("/recent_users",user.RecentUsers)
router.post(
  "/upload_album",
  verifyModel,
  upload.any("album.images"),
  user.upload_album
);
router.post(
  "/add_img_album/:albumId",
  verifyModel,
  upload.any("album.images"),
  user.add_img_album
);
router.put("/deleteAlbum/:albumId", verifyModel, user.deleteAlbum);
router.put("/del_img_album/:albumId", verifyModel, user.del_img_album);
router.post("/model_mail", verifyModel, user.model_mail);
router.post("/user_verify/:id", user.user_verify);
router.post("/forget", user.forget);
router.post("/verifyOtp", user.verifyOtp);
router.post("/reset_pass", user.reset_pass);
router.get("/findOne/:id", user.findOne);
router.put(
  "/update",
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  userController.update
);
router.delete("/delete_user/:id", verifyAdmin, user.delete_user);
router.get("/search_user", user.search_user);
router.post("/logout/:id", user.logout);
router.put("/changePassword",verifyToken, user.changePassword);
router.post("/contactUs", user.contactUs);
router.get("/userdetail/:id", user.userdetail);
router.post("/subscribe/:modelId", verifyUser, user.subscribe);
router.put(
  "/upload_image/:userId",
  upload.fields([
    { name: "images", maxCount: 1000 * 100 * 10 },
    { name: "image", maxCount: 1 },
    { name: "videos", maxCount: 1000 * 100 * 10 },
  ]),
  user.upload_image
);

router.post("/addwallet/:id", verifyUser, user.addwallet);
router.get("/getfavModel/:userId", user.getfavModel);
router.post("/favModel/:modelId", verifyToken, user.favModel);
module.exports = router;

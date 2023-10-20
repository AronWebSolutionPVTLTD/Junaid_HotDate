const express = require("express")
const router = express.Router()

const { verifyToken } = require("../helper/middleware")
const {createFriendRequest,
    pendingFriendRequests,
    outGoingRequests,
    cancelPendingRequest,
    acceptPendingRequest,
    getAllFriends,} = require("../Controller/friend")


router.post("/add_friend/:id",verifyToken,createFriendRequest);
router.get('/pending-requests',verifyToken, pendingFriendRequests);
router.get('/outgoing-requests',verifyToken,outGoingRequests);
router.patch('/cancel-pending-request/:id',verifyToken,cancelPendingRequest);
router.patch('/accept-pending-request/:id',verifyToken, acceptPendingRequest);
router.get('/all-friends',verifyToken, getAllFriends);


module.exports=router;
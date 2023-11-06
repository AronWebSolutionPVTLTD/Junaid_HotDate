const FriendRequest = require('../Model/friend');
const User = require('../Model/usersModel');
const createFriendRequest = async (req,res) => {
  const { username, shortId } = req.body;
const user = req.user;
  const foundUser = await User.findById(req.params.id);
  if (!foundUser) {
    return res.status(404).send(
      `Hm, didn't work. Double check that the capitalization, spelling, any spaces, and numbers are correct.`
    );
  }
  if (foundUser._id.toString() === user._id.toString()) {
    return res.status(406).send(`You cannot invite yourself!`);
  }
  const alreadyRequest = await FriendRequest.findOne({ from: user._id, to: foundUser._id });
  if (alreadyRequest) {
    return res.status(406).send('You already send the request');
  }
  const friendRequest = await FriendRequest.create({ from: user._id, to: foundUser._id });
  return res.status(200).send(friendRequest);
};
const checkFriendRequest = async (req, res) => {
  const { id } = req.params;
  const user = req.user; // Assuming you have authenticated the user

  const userM = id===user._id;
  const pendingRequest = await FriendRequest.findOne({ from: user._id, to: id, status: 'pending' });

  const approvedRequestFromUser = await FriendRequest.findOne({
    $or: [
      { from: user._id, to: id, status: 'approved' },
      { from: id, to: user._id, status: 'approved' },
    ],
  });
console.log(approvedRequestFromUser);
  if (pendingRequest) {
    return res.status(200).json({ status: 'pending', existingRequest: pendingRequest });
  } else if (approvedRequestFromUser) {
    return res.status(200).json({ status: 'approved', existingRequest: approvedRequestFromUser });
  }else if(userM){
    return res.status(200).json({ status: 'same' });
  }
   else {
    return res.status(200).json({ status: 'not_pending' });
  }
};

const pendingFriendRequests = async (req,res) => {
  const friendRequest = await FriendRequest.find({ to: req.user._id, status: 'pending' })
    .populate({ path: 'to' })
    .populate({ path: 'from' });
  return res.status(200).send(friendRequest);
};
const outGoingRequests = async (req,res) => {
  const friendRequest = await FriendRequest.find({ from: req.user._id, status: 'pending' })
    .populate({ path: 'to' })
    .populate({ path: 'from' });
  return res.status(200).send(friendRequest);
};
const cancelPendingRequest = async (req,res) => {
  const deletedRequest = await FriendRequest.findByIdAndRemove({ _id: req.params.id });
  return res.status(200).send(deletedRequest);
};
const acceptPendingRequest = async (req,res) => {
  let user = req.user;
  const friendRequest = await FriendRequest.findById({ _id: req.params.id });
  if (friendRequest.status !== "pending") {
    return res.status(200).send('Request status is not correct');
  }
  if (user._id.toString() !== friendRequest.to.toString()) {
    return res.status(200).send('You cant accept friend request');
  }
  friendRequest.status = "approved";
  const result = await friendRequest.save();
  return res.status(200).send(result);
};
const getAllFriends = async (req,res) => {
  const friends = await FriendRequest.find({ $or: [{ to: req.user._id }, { from: req.user._id }], status: 'approved' })
    .populate({ path: 'to' })
    .populate({ path: 'from' });
    return res.status(200).send(friends);
};
module.exports = {
  createFriendRequest,
  pendingFriendRequests,
  outGoingRequests,
  cancelPendingRequest,
  acceptPendingRequest,
  getAllFriends,checkFriendRequest
};








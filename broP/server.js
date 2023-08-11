const express = require("express")
const dotenv = require("dotenv")
const app = express()
const cors = require("cors")
const http = require('http')
dotenv.config();
const PORT = process.env.PORT
const db = require("./Connection/connection")
app.use(express.static("public"))
app.use("images", express.static("uploads"))
const path = require("path");
const clubroutes = require("./Routes/clubRoutes")
const userroutes = require("./Routes/userRoutes")
const event = require("./Routes/event")
const model = require("./Routes/model")
const message = require("./Routes/message")
const travel = require("./Routes/travel")
const faq = require("./Routes/faq")
app.use(express.json())
const corsOptions = {
    origin: 'https://hot-date.vercel.app/',
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors());
app.use("/api", userroutes, model, event, travel, clubroutes, message,faq);
db();
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
// const socketIo = require('socket.io');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo();

const CHAT_BOT = 'ChatBot';
let allUsers = [];

io.on('connection', (socket) => {
  console.log(`Koi to connect hua ${socket.id}`);
  // Room Joining:------------------------------------->
  socket.on('join_room', (data) => {
    const { username, room } = data;
    console.log(data);
    socket.join(room);
    let __createdtime__ = Date.now();
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the sixcard game`,
      username: CHAT_BOT,
      __createdtime__,
    });
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });
    const newPlayer = { id: socket.id, username, room};
    allUsers.push(newPlayer);
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);})
})



 server.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});
module.exports = {  app, server, io };

// const io = require("socket.io")(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: "*",
//   },
// });

// let users = [];
// const addNewuser = (username, socketId) => {
//   !users.some((user) => user.username === username) &&
//     users.push({ username, socketId });
// };
// const removeUser = (socketId) => {
//   onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
// };
// const getUser = (username) => {
//   return users.find((user) => user.username == username);
// };
// io.on("connection", (socket) => {
  
//   console.log("new user connected", socket.id);
//   socket.on("newUser", (username) => {
//     addNewuser(username, socket.id);
//   });
//   socket.on("sendNotification", (senderName, receiverName, type) => {
//     const receiver = getUser(receiverName);
//     io.to(receiver.socketId).emit("getNotification", {
//       senderName,
//       type,
//     });
//   });

//   socket.on("sendText", ({ senderName, receiverName, text }) => {
//     const receiver = getUser(receiverName);
//     io.to(receiver.socketId).emit("getText", {
//       senderName,
//       text,
//     });
//     socket.on("disconnect", () => {
//       removeUser(socket.id);
//     });
//   });
// });


 // Export the io instance











const express = require("express")
const dotenv = require("dotenv")
const app = express()
const cors = require("cors")
const http = require('http')
const cookieParser = require('cookie-parser')
dotenv.config();
const PORT = process.env.PORT
const db = require("./Connection/connection")
app.use(express.static("public"))
app.use("images", express.static("uploads"))
app.use("images", express.static("images"))
const path = require("path");
const clubroutes = require("./Routes/clubRoutes")
const userroutes = require("./Routes/userRoutes")
const event = require("./Routes/event")
const model = require("./Routes/model")
const message = require("./Routes/message")
const travel = require("./Routes/travel")
const faq = require("./Routes/faq")
const friends = require("./Routes/friend")
app.use(express.json())
var corsOptions = {
  origin: ['http://localhost:3000','http://localhost:3001',"https://hot-date.vercel.app"],
  credentials: true };

app.use(cors(corsOptions));
app.use(cookieParser())
app.use("/api", userroutes, model, event, travel, clubroutes, message,faq,friends);
db();
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// const socketIo = require('socket.io');
const server = http.createServer(app);
 server.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

let admin = process.env.Admin_id;
let users = [];
const addNewuser = (username, socketId) => {
  !users.some((user) => user.username === username) &&
    users.push({ username, socketId });
};
const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};
const getUser = (username) => {
  return users.find((user) => user.username == username);
};
io.on("connection", (socket) => {
  
  // console.log("new user connected", socket.id);
  // socket.on("newUser", (username) => {
  //   addNewuser(username, socket.id);
  // });
  // socket.on("sendNotification", (senderName, receiverName, type) => {
  //   const receiver = getUser(receiverName);
  //   io.to(receiver.socketId).emit("getNotification", {
  //     senderName,
  //     type,
  //   }); 
  // });

  // socket.on("sendText", ({ senderName, receiverName, text }) => {
  //   const receiver = getUser(receiverName);
  //   io.to(receiver.socketId).emit("getText", {
  //     senderName,
  //     text,
  //   });
  //   socket.on("disconnect", () => {
  //     removeUser(socket.id);
  //   });
  // });
  socket.on('sendNotification', (data) => {
    const { sender, receiver, message } = data;
    io.to(receiver).emit('receiveNotification', { sender, message });
  });
});













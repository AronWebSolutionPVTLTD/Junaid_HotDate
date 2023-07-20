const express = require("express");
const dotenv = require("dotenv");
const app = express();
const  cors = require("cors")
dotenv.config();
const PORT = process.env.PORT;
const db = require("./Connection/connection");
app.use(express.static("public"));
app.use("images", express.static("uploads"));
const clubroutes = require("./Routes/clubRoutes");
const userroutes = require("./Routes/userRoutes");
const event = require("./Routes/event")
const model = require("./Routes/model")
app.use(express.json());
app.use(cors())
app.use("/api", userroutes,model,event,clubroutes);
db();
app.get("/",(req,res)=>{
console.log("HELLO WORLD")
}
app.listen(PORT, () => {
  console.log(`Connected to port ${PORT}`);
});

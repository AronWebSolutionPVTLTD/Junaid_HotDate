const jwt = require("jsonwebtoken");
const user = require("../Model/usersModel")
module.exports={
  verifyToken: async function (req, res, next) {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).send("Token does not exist");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).send("Token has expired");
      }
      let userExist = await user.findOne({ token: token });
      if (!userExist) {
        return res.status(401).send("Invalid token");
      }
      req.decode = userExist;
      next();
    } catch (error) {

      return res.status(401).send(error.message);
    }
  },
     
}

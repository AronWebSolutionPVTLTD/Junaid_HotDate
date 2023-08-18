const nodemailer = require("nodemailer");
const Mailsend=(req,res,data)=>{
    var transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com", // Replace with your SMTP server host
        port: 465, // Replace with the appropriate port
        secure: true,
        auth: {
          user: process.env.Nodemailer_id,
          pass: process.env.Nodemailer_pass,
        },
      });
      var mailOptions = data;
      transporter.sendMail(mailOptions, function (error, result) {
        if (error) {
          console.log("Email error sent: " + JSON.stringify(error));
          return res.status(400).send(error);
        } else {
          console.log("Email result sent: " + JSON.stringify(result));
          return res.status(200).send("send mail successfully");
        }
      });
}
module.exports=Mailsend;
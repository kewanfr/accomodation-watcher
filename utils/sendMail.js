import config from "../config.js";
import nodemailer from "nodemailer";

export default function sendMail(to, subject, html = null, text = null) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.GMAIL.USER,
      pass: config.GMAIL.CODE,
    },
  });
  const mailOptions = {
    from: config.GMAIL.CODE,
    to: to,
    subject: subject,
  };

  if (text != null) {
    mailOptions.text = text;
  } else {
    mailOptions.html = html;
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
}

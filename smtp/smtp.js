const nodemailer = require("nodemailer");

const mailer = nodemailer.createTransport({
  host: process.env.GAMESITE_SMTP_HOST,
  port: process.env.GAMESITE_SMTP_PORT,
  secure: process.env.GAMESITE_SMTP_SECURE === "1",
  auth: {
    user: process.env.GAMESITE_SMTP_USER,
    pass: process.env.GAMESITE_SMTP_PASSWORD,
  },
});
const mailer_from = process.env.GAMESITE_SMTP_FROM;

module.exports = {mailer, mailer_from};
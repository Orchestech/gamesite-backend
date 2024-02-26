const nodemailer = require("nodemailer");

const mailerOptions = {
  host: process.env.GAMESITE_SMTP_HOST ?? "127.0.0.1",
  port: process.env.GAMESITE_SMTP_PORT ?? "465",
  secure: process.env.GAMESITE_SMTP_SECURE !== "0",
  auth: {
    user: process.env.GAMESITE_SMTP_USER ?? "no-reply@example.com",
    pass: process.env.GAMESITE_SMTP_PASSWORD ?? "example_password",
  }
}
const mailerFrom = process.env.GAMESITE_SMTP_FROM ?? "no-reply@example.com";

module.exports = {mailerOptions, mailerFrom};
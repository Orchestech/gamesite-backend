const nodemailer = require("nodemailer");
const controller = require.main.require('../database/controller');
const fs = require('fs');
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
const mailHTML = fs.readFileSync('../smtp/default.html', 'utf8');

const transporter = nodemailer.createTransport(mailerOptions);


async function registrationEmail(user_id) {

    const user = await controller.getUserById(user_id);
    const profile = await controller.getProfileByUserId(user_id);
    const activationKey = (await controller.getActivationKeyByUserId(user_id)).key;

    const mailText = `Hi, ${profile.first_name} ${profile.last_name}!\nActivate your account by clicking <a href="herehttps://rukolf.team/account/activate/${activationKey}">here</a>`
    const mailSubject = 'Gamesite registration';
    return await transporter.sendMail({
        from: mailerFrom,
        to: user.username,
        subject: mailSubject,
        html: mailHTML
            .replace('$text', mailText)
            .replace('$title', mailSubject),
    }, (error) => {
        if (error) {
            console.error(mailerOptions);
            console.error(error);
        }
    });
}

module.exports = {registrationEmail}
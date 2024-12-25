import dotenv from "dotenv";
import nodemailer from 'nodemailer'
dotenv.config();

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'testdjango805@gmail.com',
        pass: 'htpv flxv igsy gwjr',
    },
    tls: {
        rejectUnauthorized: true,
    },
})

export default transporter
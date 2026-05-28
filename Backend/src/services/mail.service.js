// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config()
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({
//   path: path.resolve(__dirname, "../../.env"),
// });

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.BREVO_USER,
//     pass: process.env.BREVO_PASS,
//   },
// });

// // transporter
// // .verify()
// // .then(() => { console.log("✅ Email transporter is ready"); }) //
// //  .catch((err) => { console.error("❌ Email transporter verification failed", err);  });

// export async function sendEmail({ to, subject, html, text = "" }) {
//   const mailOptions = {
//     from: process.env.BREVO_USER,
//     to,
//     subject,
//     html,
//     text,
//   };

//   // console.log("Attempting to send email...");

//   try {
//     const info = await transporter.sendMail(mailOptions);

//     console.log("EMAIL SENT:", info);

//     return info;
//   } catch (error) {
//     console.log("EMAIL ERROR:", error);

//     throw error;
//   }

// }

import { Resend } from "resend";
import dotenv from "dotenv";
 dotenv.config()
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", data);

    return data;
  } catch (error) {
    console.log("EMAIL ERROR:", error);

    throw error;
  }
}

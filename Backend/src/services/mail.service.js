import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },

  tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// transporter
// .verify()
// .then(() => { console.log("✅ Email transporter is ready"); }) //
//  .catch((err) => { console.error("❌ Email transporter verification failed", err);  });

export async function sendEmail({ to, subject, html, text = "" }) {
  const mailOptions = {
    from: "irshaddevelops@gmail.com",
    to,
    subject,
    html,
    text,
  };

  console.log("Attempting to send email...");

  try {
    transporter
      .sendMail(mailOptions)
      .then((info) => {
        console.log("EMAIL SENT SUCCESSFULLY");
        console.log(info.response);
      })
      .catch((error) => {
        console.error("FULL EMAIL ERROR:", error);
      });

    return `✅ Email request triggered for ${to}`;
  } catch (error) {
    console.error("FULL EMAIL ERROR:", error);

    throw new Error(`Email send failed: ${error.message}`);
  }
}

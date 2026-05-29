import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  connectionTimeout: 60000,
  greetingTimeout: 60000,
  socketTimeout: 60000,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

console.log("SMTP USER:", process.env.BREVO_SMTP_USER);
console.log("SMTP PASS EXISTS:", !!process.env.BREVO_SMTP_PASS);

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log("📧 Email Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ Email Error:", error);
    throw error;
  }
}

import * as brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

export async function sendEmail({ to, subject, html }) {
  try {
    const email = new brevo.SendSmtpEmail();

    email.sender = {
      email: process.env.EMAIL_FROM,
      name: "Perplexity by Irshad",
    };

    email.to = [
      {
        email: to,
      },
    ];

    email.subject = subject;
    email.htmlContent = html;

    const response = await apiInstance.sendTransacEmail(email);

    console.log("📧 Email Sent:", response.body?.messageId || "Success");

    return response;
  } catch (error) {
    console.error("❌ Email Error:", error.response?.body || error.message);
    throw error;
  }
}

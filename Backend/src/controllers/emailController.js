import { addEmailToQueue } from "../queues/email.queue.js";
import { generateEmail } from "../services/ai.service.js";

export async function handleSendEmail(req, res) {
  try {
    const { to, subject, prompt } = req.body;

    if (!to || !subject || !prompt) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const generatedEmail = await generateEmail({
      subject,
      prompt,
    });
    await addEmailToQueue({
      to,
      subject,
      html: `
          <div style="font-family:sans-serif; line-height:1.6;">
              ${generatedEmail.replace(/\n/g, "<br/>")}
          </div>`,
      text: generatedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Email queued successfully for background processing.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

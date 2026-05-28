import { Worker } from "bullmq";
import { getRedisConnection } from "../config/redis.js";
import { sendEmail } from "../services/mail.service.js";

// Initialize a dedicated Redis connection for the Worker (crucial since workers use blocking Redis commands)
const connection = getRedisConnection();

const emailWorker = new Worker("emailQueue", async (job) => {
  const { to, subject, html, text } = job.data;
  console.log(`[EmailWorker] Job ${job.id} - Starting processing for email to: ${to}`);

  try {
    const result = await sendEmail({ to, subject, html, text });
    console.log(`[EmailWorker] Job ${job.id} - Email sent successfully. SMTP response:`, result?.response || "Success");
    return result;
  } catch (error) {
    console.error(`[EmailWorker] Job ${job.id} - Failed to send email to ${to}:`, error.message);
    // Propagate the error so that BullMQ registers it and attempts configured retries
    throw error;
  }
}, {
  connection,
  concurrency: 5, // Process up to 5 emails concurrently on a single server instance
});

emailWorker.on("completed", (job) => {
  console.log(`[EmailWorker] Job ${job.id} completed successfully.`);
});

emailWorker.on("failed", (job, err) => {
  // Check if job exists (can be undefined if failed on startup/init)
  const jobInfo = job ? `Job ${job.id} (attempts made: ${job.attemptsMade})` : "A job";
  console.error(`[EmailWorker] ${jobInfo} has failed permanently:`, err.message);
});

export default emailWorker;

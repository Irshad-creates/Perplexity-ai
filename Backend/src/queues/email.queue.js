import { Queue } from "bullmq";
import { getRedisConnection } from "../config/redis.js";

// Initialize a dedicated Redis connection for the Queue
const connection = getRedisConnection();

export const emailQueue = new Queue("emailQueue", {
  connection,
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, 10s, 20s...
    },
    removeOnComplete: true, // Automatically clean up completed jobs to prevent memory bloat
    removeOnFail: false,   // Keep failed jobs so we can audit/debug them
  },
});

/**
 * Helper to push an email sending job onto the queue.
 * 
 * @param {Object} jobData
 * @param {string} jobData.to
 * @param {string} jobData.subject
 * @param {string} jobData.html
 * @param {string} [jobData.text]
 */
export async function addEmailToQueue({ to, subject, html, text }) {
  // Set a 5-second timeout for adding jobs to the queue to prevent API routes from hanging
  // if Redis is unreachable or reconnecting.
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Queue addition timed out (Redis might be unreachable)")), 5000)
  );

  try {
    const jobPromise = emailQueue.add("sendEmail", { to, subject, html, text });
    const job = await Promise.race([jobPromise, timeoutPromise]);
    console.log(`[EmailQueue] Job ${job.id} successfully added for recipient: ${to}`);
    return job;
  } catch (error) {
    console.error(`[EmailQueue] Failed to queue email to ${to}:`, error.message);
    throw error;
  }
}

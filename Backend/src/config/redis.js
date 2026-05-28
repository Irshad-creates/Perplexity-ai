import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

/**
 * Returns a new Redis connection instance.
 * BullMQ requires separate connection instances for Queue and Worker.
 * We must set `maxRetriesPerRequest: null` for BullMQ compatibility.
 */
export function getRedisConnection() {
  if (process.env.REDIS_URL) {
    console.log("[Redis Config] Using REDIS_URL for connection.");
    const conn = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
    });
    conn.on("error", (err) => {
      console.error("[Redis Connection Error]:", err.message);
    });
    return conn;
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = parseInt(process.env.REDIS_PORT || "6379", 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  console.log(`[Redis Config] Using manual connection options - Host: ${host}, Port: ${port}`);
  
  const conn = new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: null,
  });

  conn.on("error", (err) => {
    console.error("[Redis Connection Error]:", err.message);
  });

  return conn;
}

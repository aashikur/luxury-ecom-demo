import mongoose from 'mongoose';

/**
 * ============================================================================
 * SENIOR ARCHITECTURE NOTE: The MongoDB Singleton Pattern in Next.js
 * ============================================================================
 * 
 * WHY IS THIS NEEDED?
 * In a traditional Node.js/Express server, the server starts once and keeps a 
 * single persistent connection to MongoDB open for its entire lifetime.
 * 
 * In Next.js (App Router / Serverless environment):
 * 1. During development, Next.js clears the Node cache and re-runs code on every 
 *    Hot Module Reload (HMR) when you save a file.
 * 2. In production (e.g. Vercel), API routes run as isolated serverless lambdas.
 * 
 * IF WE DON'T CACHE:
 * Every file save or request calls `mongoose.connect()`, opening a new connection.
 * Within minutes, MongoDB Atlas throws: "Too many connections error" and crashes.
 * 
 * THE SOLUTION:
 * We store the active connection in the Node.js `global` object. The `global` object 
 * persists across file reloads in development.
 */

const MONGODB_URI = process.env.MONGODB_URI;

// Define a type for our global cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach cache to global scope in development
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      '⚠️ Missing MONGODB_URI in environment variables. Please check your .env.local file.'
    );
  }

  // 1. If an active connection already exists, reuse it immediately (0ms latency)
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If a connection attempt is in-flight, await the same promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast if DB is unreachable rather than hanging
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB successfully.');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset promise so next request can retry
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }

  return cached.conn;
}

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// 1. Load environment variables from .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;

console.log('--------------------------------------------------');
console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('Target URI:', uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'MISSING (Undefined!)');
console.log('--------------------------------------------------');

if (!uri) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env.local!');
  process.exit(1);
}

async function testConnection() {
  try {
    const startTime = Date.now();
    
    // Attempt connection
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    
    const latency = Date.now() - startTime;
    console.log(`✅ SUCCESS: Connected to MongoDB Atlas!`);
    console.log(`⚡ Response Time: ${latency}ms`);
    console.log(`📦 Database Name: ${mongoose.connection.name}`);
    console.log('--------------------------------------------------');
    
    // Close cleanly
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED:');
    console.error(err.message);
    console.log('--------------------------------------------------');
    process.exit(1);
  }
}

testConnection();

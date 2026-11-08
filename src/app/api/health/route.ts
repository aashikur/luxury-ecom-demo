import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';

/**
 * ============================================================================
 * LESSON: Multi-Service Production Health Check
 * ============================================================================
 * 
 * In real-world enterprise apps, /api/health verifies ALL external infrastructure:
 * 1. Database (MongoDB) - checks readyState and ping
 * 2. Media Storage (Cloudinary) - verifies API signature with cloudinary.api.ping()
 * 
 * If any critical service fails, the response status code changes from 200 to 503
 * so DevOps alerts are triggered immediately.
 */

export async function GET() {
  const startTime = Date.now();

  // 1. Verify MongoDB
  let dbStatus = { state: 'disconnected', readyStateCode: 0, latency: '0ms' };
  try {
    const dbStart = Date.now();
    await connectDB();
    const stateCode = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    dbStatus = {
      state: stateMap[stateCode] || 'unknown',
      readyStateCode: stateCode,
      latency: `${Date.now() - dbStart}ms`,
    };
  } catch (err) {
    dbStatus.state = err instanceof Error ? err.message : 'failed';
  }

  // 2. Verify Cloudinary
  let cloudinaryStatus = { status: 'disconnected', cloudName: '', latency: '0ms' };
  try {
    const cloudStart = Date.now();
    const pingResult = await cloudinary.api.ping();
    cloudinaryStatus = {
      status: pingResult.status === 'ok' ? 'connected' : 'error',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      latency: `${Date.now() - cloudStart}ms`,
    };
  } catch (err) {
    cloudinaryStatus.status = err instanceof Error ? err.message : 'failed';
  }

  // 3. Determine Overall Health
  const isHealthy = dbStatus.readyStateCode === 1 && cloudinaryStatus.status === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      message: isHealthy
        ? 'All systems operational (MongoDB + Cloudinary connected).'
        : 'One or more systems are not operational.',
      services: {
        database: dbStatus,
        cloudinary: cloudinaryStatus,
      },
      totalLatency: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  );
}

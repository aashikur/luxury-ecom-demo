import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { connectDB } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { r2 } from '@/lib/r2';

/**
 * ============================================================================
 * LESSON: Production Multi-Cloud Infrastructure Health Check
 * ============================================================================
 * 
 * Verifies all 3 critical cloud components:
 * 1. Database: MongoDB Atlas (via Mongoose readyState)
 * 2. Media Transform: Cloudinary (via cloudinary.api.ping)
 * 3. High-Scale Storage: Cloudflare R2 (via AWS S3 HeadBucketCommand)
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

  // 3. Verify Cloudflare R2
  let r2Status = { status: 'disconnected', bucket: '', latency: '0ms' };
  try {
    const r2Start = Date.now();
    const bucket = process.env.R2_BUCKET_NAME || 'ecom-demo';
    await r2.send(new HeadBucketCommand({ Bucket: bucket }));
    r2Status = {
      status: 'connected',
      bucket: bucket,
      latency: `${Date.now() - r2Start}ms`,
    };
  } catch (err) {
    r2Status.status = err instanceof Error ? err.message : 'failed';
  }

  // Determine overall system health
  const isHealthy =
    dbStatus.readyStateCode === 1 &&
    cloudinaryStatus.status === 'connected' &&
    r2Status.status === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      message: isHealthy
        ? 'All cloud services operational (MongoDB + Cloudinary + Cloudflare R2).'
        : 'One or more cloud services failed.',
      services: {
        database: dbStatus,
        cloudinary: cloudinaryStatus,
        cloudflareR2: r2Status,
      },
      totalLatency: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
    },
    { status: isHealthy ? 200 : 503 }
  );
}

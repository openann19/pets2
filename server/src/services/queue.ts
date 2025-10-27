/**
 * BullMQ Queue Setup for PawReels
 */

import { Queue, Worker as BullWorker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!);

export const renderQueue = new Queue(process.env.RENDER_QUEUE || 'render', { connection });

export interface RenderJobData {
  reelId: string;
}

export async function addRenderJob(data: RenderJobData): Promise<void> {
  await renderQueue.add('render', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

export async function getJobStatus(jobId: string): Promise<any> {
  const job = await renderQueue.getJob(jobId);
  if (!job) return null;
  
  return {
    id: job.id,
    state: await job.getState(),
    progress: job.progress,
    data: job.data,
    error: job.failedReason,
  };
}


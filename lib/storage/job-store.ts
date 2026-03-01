/**
 * In-memory job store for tracking presentation generation status
 * In production, this would be backed by Redis or a database
 */

import type { GenerationJob, GenerationStatus, GeneratedSlide, TemplateType } from '@/lib/types/presentation';
import { randomUUID } from 'crypto';

// Use global to survive Next.js HMR module reloads in dev mode.
// On HMR, the module re-executes but `global.__jobStore` persists, so in-flight jobs aren't lost.
const g = global as typeof global & { __jobStore?: Map<string, GenerationJob> };
if (!g.__jobStore) {
  g.__jobStore = new Map<string, GenerationJob>();
}
const jobs = g.__jobStore;

// Auto-cleanup interval (24 hours)
const JOB_EXPIRY_TIME = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL = 60 * 60 * 1000; // Every hour

// Start cleanup interval
if (typeof global !== 'undefined' && !global.jobStoreCleanupStarted) {
  (global as any).jobStoreCleanupStarted = true;

  setInterval(() => {
    const now = Date.now();
    for (const [jobId, job] of jobs.entries()) {
      if (now - job.createdAt.getTime() > JOB_EXPIRY_TIME) {
        jobs.delete(jobId);
        console.log(`[v0] Cleaned up expired job: ${jobId}`);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Create a new generation job
 */
export function createJob(
  topic: string,
  slideCount: number,
  template?: TemplateType
): { jobId: string; job: GenerationJob } {
  const jobId = randomUUID();
  const now = new Date();

  const job: GenerationJob = {
    jobId,
    status: 'generating',
    progress: 0,
    currentSlide: 0,
    totalSlides: slideCount,
    topic,
    template,
    createdAt: now,
    updatedAt: now,
  };

  jobs.set(jobId, job);
  console.log(`[v0] Created job: ${jobId} for "${topic}" with ${slideCount} slides`);

  return { jobId, job };
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): GenerationJob | null {
  return jobs.get(jobId) || null;
}

/**
 * Update job status
 */
export function updateJobStatus(
  jobId: string,
  status: GenerationStatus,
  progress?: number
): GenerationJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.status = status;
  if (progress !== undefined) {
    job.progress = Math.min(100, Math.max(0, progress));
  }
  job.updatedAt = new Date();

  return job;
}

/**
 * Update job progress
 */
export function updateJobProgress(
  jobId: string,
  currentSlide: number,
  totalSlides: number
): GenerationJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.currentSlide = currentSlide;
  job.totalSlides = totalSlides;
  job.progress = Math.round((currentSlide / totalSlides) * 100);
  job.updatedAt = new Date();

  return job;
}

/**
 * Mark job as complete
 */
export function completeJob(
  jobId: string,
  pptxUrl: string,
  slides?: GeneratedSlide[]
): GenerationJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.status = 'complete';
  job.progress = 100;
  job.pptxUrl = pptxUrl;
  if (slides) job.slides = slides;
  job.updatedAt = new Date();

  console.log(`[v0] Job completed: ${jobId}`);

  return job;
}

/**
 * Mark job as failed
 */
export function failJob(jobId: string, error: string): GenerationJob | null {
  const job = jobs.get(jobId);
  if (!job) return null;

  job.status = 'error';
  job.error = error;
  job.updatedAt = new Date();

  console.log(`[v0] Job failed: ${jobId} - ${error}`);

  return job;
}

/**
 * Delete job
 */
export function deleteJob(jobId: string): boolean {
  return jobs.delete(jobId);
}

/**
 * Get all jobs (for debugging)
 */
export function getAllJobs(): GenerationJob[] {
  return Array.from(jobs.values());
}

/**
 * Clear all jobs (for testing)
 */
export function clearAllJobs(): void {
  jobs.clear();
}

/**
 * Get job statistics
 */
export function getJobStats() {
  const allJobs = Array.from(jobs.values());
  return {
    total: allJobs.length,
    generating: allJobs.filter((j) => j.status === 'generating').length,
    complete: allJobs.filter((j) => j.status === 'complete').length,
    error: allJobs.filter((j) => j.status === 'error').length,
  };
}

import { useEffect, useState, useCallback } from 'react';
import type { GenerationJob } from '@/lib/types/presentation';

interface UseGenerationStatusOptions {
  jobId: string | null;
  onComplete?: (job: GenerationJob) => void;
  onError?: (error: string) => void;
}

export function useGenerationStatus({
  jobId,
  onComplete,
  onError,
}: UseGenerationStatusOptions) {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!!jobId);

  const pollStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/status/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setJob(data.job);
      setError(null);

      if (data.job.status === 'completed' || data.job.status === 'failed') {
        setIsLoading(false);
        if (data.job.status === 'completed' && onComplete) {
          onComplete(data.job);
        }
        if (data.job.status === 'failed' && onError) {
          onError(data.job.error || 'Generation failed');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setIsLoading(false);
      if (onError) onError(message);
    }
  }, [jobId, onComplete, onError]);

  useEffect(() => {
    if (!jobId) return;

    // Initial poll
    pollStatus();

    // Set up polling interval (every 500ms for fast feedback)
    const interval = setInterval(pollStatus, 500);

    return () => clearInterval(interval);
  }, [jobId, pollStatus]);

  return {
    job,
    error,
    isLoading,
  };
}

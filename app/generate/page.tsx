'use client';

/**
 * Presentation generation page with form and progress tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PresentationForm from '@/components/PresentationForm';
import GenerationProgress from '@/components/GenerationProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { GenerationRequest, GenerationJob } from '@/lib/types/presentation';
import { toast } from 'sonner';
import { Download, ArrowLeft } from 'lucide-react';

export default function GeneratePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error('Failed to fetch job status');
          return;
        }

        setJob(data.data);

        // Stop polling if complete or error
        if (data.data.status === 'complete' || data.data.status === 'error') {
          clearInterval(pollInterval);
          setIsLoading(false);

          if (data.data.status === 'complete') {
            toast.success('Presentation generated successfully!');
          } else {
            toast.error(`Generation failed: ${data.data.error}`);
          }
        }
      } catch (error) {
        console.error('[v0] Error polling status:', error);
        toast.error('Connection error while checking status');
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [jobId]);

  const handleGenerateSubmit = useCallback(async (data: GenerationRequest) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to start generation');
        setIsLoading(false);
        return;
      }

      const newJobId = result.data?.jobId || result.jobId;
      setJobId(newJobId);
      setJob({
        jobId: newJobId,
        status: 'generating',
        progress: 0,
        currentSlide: 0,
        totalSlides: data.slideCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast.success('Generation started! This may take a few minutes...');
    } catch (error) {
      console.error('[v0] Error starting generation:', error);
      toast.error('Failed to start generation. Please try again.');
      setIsLoading(false);
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/download/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to retrieve download');
        return;
      }

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.data.downloadUrl;
      link.download = data.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started!');
    } catch (error) {
      console.error('[v0] Error downloading:', error);
      toast.error('Failed to download presentation');
    }
  }, [jobId]);

  const handleReset = useCallback(() => {
    setJob(null);
    setJobId(null);
    setIsLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Presentation Generator</h1>
            <p className="mt-2 text-slate-600">
              Create professional PowerPoint presentations in minutes
            </p>
          </div>
          {(job || jobId) && (
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </Button>
          )}
        </div>

        {/* Main Content */}
        {!job || job.status === 'error' ? (
          <div className="space-y-4">
            <PresentationForm
              onSubmit={handleGenerateSubmit}
              isLoading={isLoading}
            />
            {job?.status === 'error' && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <GenerationProgress job={job} />

            {job.status === 'complete' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-green-900">
                      ✓ Your presentation is ready!
                    </p>
                    <p className="text-sm text-green-700">
                      Click download to save your PowerPoint file
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      className="gap-2"
                      size="lg"
                    >
                      <Download className="h-4 w-4" />
                      Download PPTX
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                    >
                      Create Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

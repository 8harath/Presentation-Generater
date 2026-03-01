'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Lock, Download } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [slides, setSlides] = useState(10);
  const [template, setTemplate] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setLoading(true);
    setDownloadReady(false);
    setDownloadUrl('');
    setProgress(0);
    setStatus('Starting generation...');

    try {
      // Step 1: Start generation job
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context, slideCount: slides, template }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus(`Error: ${result.error || 'Failed to start generation'}`);
        setLoading(false);
        return;
      }

      const jobId = result.data?.jobId || result.jobId;
      setStatus('AI is generating your slides...');

      // Step 2: Poll for status
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status/${jobId}`);
          const statusData = await statusRes.json();

          if (!statusRes.ok) {
            setStatus('Error checking status. Retrying...');
            return;
          }

          const job = statusData.data;
          setProgress(job.progress || 0);

          if (job.status === 'generating') {
            setStatus(`Generating slides... (${job.currentSlide}/${job.totalSlides})`);
          } else if (job.status === 'composing') {
            setStatus('Composing and formatting your presentation...');
          } else if (job.status === 'complete') {
            clearInterval(pollRef.current!);
            setStatus('✅ Your presentation is ready!');
            setProgress(100);
            setDownloadReady(true);
            setDownloadUrl(job.pptxUrl || '');
            setLoading(false);
          } else if (job.status === 'error') {
            clearInterval(pollRef.current!);
            setStatus(`❌ Error: ${job.error || 'Generation failed'}`);
            setLoading(false);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 1500);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${topic.replace(/\s+/g, '-').toLowerCase()}-presentation.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">
              Presentation Generator
            </span>
          </div>
          <Link href="/generate">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Create Professional
            <span className="block bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              PowerPoint Presentations
            </span>
            <span className="block">in Minutes</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Powered by AI, our presentation generator creates polished, professional PowerPoint decks from just your topic. No design skills needed.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/generate">
              <Button size="lg" className="gap-2 px-8">
                Generate Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            Why Choose Our Generator?
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <Sparkles className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                AI-Powered Content
              </h3>
              <p className="mt-2 text-slate-600">
                Automatically generate compelling slide content tailored to your topic using advanced AI models.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <Zap className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Lightning Fast
              </h3>
              <p className="mt-2 text-slate-600">
                Generate a complete 10-slide presentation in just 2-3 minutes. No waiting for manual design.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <Lock className="h-12 w-12 text-blue-600" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Professional Templates
              </h3>
              <p className="mt-2 text-slate-600">
                Choose from curated professional templates (Minimal, Professional, Creative) that look great.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">
            How It Works
          </h2>

          <div className="mt-16 space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Enter Your Topic</h3>
                <p className="mt-2 text-slate-600">
                  Provide your presentation topic and any additional context you'd like included.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Select Template & Slides</h3>
                <p className="mt-2 text-slate-600">
                  Choose your preferred design template and specify how many slides you need (3-15).
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">AI Generates Content</h3>
                <p className="mt-2 text-slate-600">
                  Our AI creates engaging, relevant content for each slide with appropriate visuals.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Download & Present</h3>
                <p className="mt-2 text-slate-600">
                  Download your PowerPoint file and start presenting immediately, or edit as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Form */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-xl sm:p-12 border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900">Try It Now</h2>
          <p className="mt-4 text-slate-600">
            Create a professional PowerPoint presentation in minutes, powered by AI.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Climate Change, Machine Learning, Digital Marketing"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Context (optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Any specific details or themes to include..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Slides
                </label>
                <select
                  value={slides}
                  onChange={(e) => setSlides(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[3, 5, 7, 10, 12, 15].map((n) => (
                    <option key={n} value={n}>{n} slides</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Template
                </label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minimal">Minimal</option>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
            </div>

            {status && (
              <div className={`p-3 border rounded-lg text-sm ${status.startsWith('❌')
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : status.startsWith('✅')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                {status}
              </div>
            )}

            {loading && (
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {downloadReady ? (
              <Button
                onClick={handleDownload}
                size="lg"
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-5 w-5" />
                Download Presentation (.pptx)
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="w-full gap-2"
              >
                {loading ? 'Generating...' : 'Generate Presentation'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-600">
          <p>© 2025 Presentation Generator. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

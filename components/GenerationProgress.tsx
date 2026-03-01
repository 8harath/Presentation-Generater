'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, XCircle, Layers, Palette, FileDown } from 'lucide-react';
import type { GenerationJob } from '@/lib/types/presentation';

interface GenerationProgressProps {
    job: GenerationJob;
}

const statusConfig = {
    idle: {
        label: 'Waiting to start...',
        icon: <Loader2 className="h-5 w-5 animate-spin text-slate-500" />,
        color: 'text-slate-600',
    },
    generating: {
        label: 'AI is generating slide content...',
        icon: <Loader2 className="h-5 w-5 animate-spin text-blue-600" />,
        color: 'text-blue-600',
    },
    composing: {
        label: 'Composing slides and building PPTX...',
        icon: <Loader2 className="h-5 w-5 animate-spin text-purple-600" />,
        color: 'text-purple-600',
    },
    complete: {
        label: 'Presentation ready!',
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        color: 'text-green-600',
    },
    error: {
        label: 'Generation failed',
        icon: <XCircle className="h-5 w-5 text-red-600" />,
        color: 'text-red-600',
    },
};

const steps = [
    {
        key: 'generating',
        label: 'Generating Content',
        description: 'AI creates slide text and structure',
        icon: <Layers className="h-4 w-4" />,
    },
    {
        key: 'composing',
        label: 'Composing Slides',
        description: 'Applying template and styling',
        icon: <Palette className="h-4 w-4" />,
    },
    {
        key: 'complete',
        label: 'Build Complete',
        description: 'PPTX file is ready to download',
        icon: <FileDown className="h-4 w-4" />,
    },
];

function getStepStatus(stepKey: string, currentStatus: string): 'pending' | 'active' | 'done' {
    const order = ['generating', 'composing', 'complete'];
    const stepIdx = order.indexOf(stepKey);
    const currentIdx = order.indexOf(currentStatus);

    if (currentStatus === 'error') return stepIdx <= currentIdx ? 'done' : 'pending';
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
}

export default function GenerationProgress({ job }: GenerationProgressProps) {
    const config = statusConfig[job.status] || statusConfig.idle;

    return (
        <Card className="shadow-lg border-slate-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Generating Your Presentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Status indicator */}
                <div className={`flex items-center gap-3 ${config.color}`}>
                    {config.icon}
                    <span className="font-medium">{config.label}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>
                            {job.currentSlide > 0
                                ? `Slide ${job.currentSlide} of ${job.totalSlides}`
                                : 'Processing...'}
                        </span>
                        <span className="font-semibold">{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-3" />
                </div>

                {/* Step indicators */}
                <div className="space-y-3">
                    {steps.map((step) => {
                        const status = getStepStatus(step.key, job.status);
                        return (
                            <div
                                key={step.key}
                                className={`flex items-center gap-3 rounded-lg p-3 transition-colors ${status === 'active'
                                        ? 'bg-blue-50 border border-blue-200'
                                        : status === 'done'
                                            ? 'bg-green-50 border border-green-100'
                                            : 'bg-slate-50 border border-transparent'
                                    }`}
                            >
                                <div
                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${status === 'active'
                                            ? 'bg-blue-600 text-white'
                                            : status === 'done'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-slate-200 text-slate-400'
                                        }`}
                                >
                                    {status === 'done' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : status === 'active' ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>
                                <div>
                                    <p
                                        className={`text-sm font-semibold ${status === 'active'
                                                ? 'text-blue-700'
                                                : status === 'done'
                                                    ? 'text-green-700'
                                                    : 'text-slate-400'
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                    <p className="text-xs text-slate-500">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Error message */}
                {job.status === 'error' && job.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">Error Details</p>
                        <p className="mt-1 text-sm text-red-600">{job.error}</p>
                    </div>
                )}

                {/* Time estimate */}
                {(job.status === 'generating' || job.status === 'composing') && (
                    <p className="text-center text-sm text-slate-400">
                        ⏱ This usually takes 2–4 minutes. Please keep this tab open.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Loader2 } from 'lucide-react';
import type { GenerationRequest, TemplateType } from '@/lib/types/presentation';

interface PresentationFormProps {
  onSubmit: (data: GenerationRequest) => Promise<void>;
  isLoading: boolean;
}

export default function PresentationForm({ onSubmit, isLoading }: PresentationFormProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [template, setTemplate] = useState<TemplateType>('professional');
  const [topicError, setTopicError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopicError('');

    if (!topic.trim()) {
      setTopicError('Please enter a topic');
      return;
    }
    if (topic.trim().length < 3) {
      setTopicError('Topic must be at least 3 characters');
      return;
    }
    if (topic.trim().length > 100) {
      setTopicError('Topic must be less than 100 characters');
      return;
    }

    await onSubmit({
      topic: topic.trim(),
      context: context.trim(),
      slideCount,
      template,
    });
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-blue-600" />
          Generate Presentation
        </CardTitle>
        <CardDescription>
          Fill in the details below and let AI create your presentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-semibold text-slate-700">
              Presentation Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (topicError) setTopicError('');
              }}
              placeholder="e.g., Climate Change, Machine Learning, Digital Marketing..."
              className={`h-11 ${topicError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
              disabled={isLoading}
              maxLength={100}
            />
            {topicError && (
              <p className="text-sm text-red-500">{topicError}</p>
            )}
            <p className="text-xs text-slate-400">{topic.length}/100 characters</p>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context" className="text-sm font-semibold text-slate-700">
              Additional Context <span className="text-slate-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="context"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add any specific points, audience, tone, or details you want included..."
              className="min-h-[90px] resize-none"
              disabled={isLoading}
              maxLength={1000}
            />
            <p className="text-xs text-slate-400">{context.length}/1000 characters</p>
          </div>

          {/* Slide Count */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">
              Number of Slides: <span className="text-blue-600 font-bold">{slideCount}</span>
            </Label>
            <Slider
              min={3}
              max={15}
              step={1}
              value={[slideCount]}
              onValueChange={(val) => setSlideCount(val[0])}
              disabled={isLoading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>3 slides</span>
              <span>15 slides</span>
            </div>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label htmlFor="template" className="text-sm font-semibold text-slate-700">
              Design Template
            </Label>
            <Select
              value={template}
              onValueChange={(val) => setTemplate(val as TemplateType)}
              disabled={isLoading}
            >
              <SelectTrigger id="template" className="h-11">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Minimal</span>
                    <span className="text-xs text-slate-500">Clean and modern with whitespace</span>
                  </div>
                </SelectItem>
                <SelectItem value="professional">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Professional</span>
                    <span className="text-xs text-slate-500">Corporate design with strong hierarchy</span>
                  </div>
                </SelectItem>
                <SelectItem value="creative">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Creative</span>
                    <span className="text-xs text-slate-500">Vibrant and engaging for creative topics</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full gap-2 h-12 text-base font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Presentation
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-400">
            Generation typically takes 2–4 minutes depending on slide count
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

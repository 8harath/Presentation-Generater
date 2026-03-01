'use client';

import { useState } from 'react';
import type { GeneratedSlide, TemplateType } from '@/lib/types/presentation';
import { Monitor, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlidePreviewGridProps {
    slides: GeneratedSlide[];
    template: TemplateType;
    onPresent: (startIndex: number) => void;
}

// Template color palettes
const TEMPLATE_STYLES: Record<TemplateType, {
    bg: string;
    titleColor: string;
    textColor: string;
    accentBg: string;
    accentText: string;
    bulletDot: string;
}> = {
    minimal: {
        bg: '#FFFFFF',
        titleColor: '#1F2937',
        textColor: '#374151',
        accentBg: '#F3F4F6',
        accentText: '#1F2937',
        bulletDot: '#3B82F6',
    },
    professional: {
        bg: '#F8F9FA',
        titleColor: '#003366',
        textColor: '#222222',
        accentBg: '#003366',
        accentText: '#FFFFFF',
        bulletDot: '#FF6B35',
    },
    creative: {
        bg: '#FAFAFA',
        titleColor: '#7C3AED',
        textColor: '#1E293B',
        accentBg: '#7C3AED',
        accentText: '#FFFFFF',
        bulletDot: '#EC4899',
    },
};

interface SlideCardProps {
    slide: GeneratedSlide;
    template: TemplateType;
    index: number;
    onClick: () => void;
}

function SlideCard({ slide, template, index, onClick }: SlideCardProps) {
    const [hovered, setHovered] = useState(false);
    const styles = TEMPLATE_STYLES[template];
    const isTitleSlide = slide.type === 'title';

    return (
        <div
            className="group cursor-pointer"
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Slide number badge */}
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                    Slide {index + 1}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.type === 'title' ? 'bg-blue-100 text-blue-700' :
                        slide.type === 'summary' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-600'
                    }`}>
                    {slide.type}
                </span>
            </div>

            {/* The slide thumbnail */}
            <div
                className="relative overflow-hidden rounded-xl shadow-md transition-all duration-200"
                style={{
                    aspectRatio: '16/9',
                    backgroundColor: styles.bg,
                    border: hovered ? `2px solid ${styles.bulletDot}` : '2px solid transparent',
                    boxShadow: hovered
                        ? `0 12px 40px -8px ${styles.bulletDot}40`
                        : '0 4px 20px -4px rgba(0,0,0,0.12)',
                    transform: hovered ? 'scale(1.02)' : 'scale(1)',
                }}
            >
                {/* Title bar stripe for non-title slides */}
                {!isTitleSlide && (
                    <div
                        className="absolute top-0 left-0 right-0 h-[18%]"
                        style={{ backgroundColor: styles.titleColor }}
                    />
                )}

                {/* Content wrapper scaled to fit the thumbnail */}
                <div className="absolute inset-0 p-[8%]">
                    {isTitleSlide ? (
                        // Title slide layout: centered
                        <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                            <div
                                className="font-bold leading-tight"
                                style={{
                                    fontSize: 'clamp(8px, 2.2cqw, 18px)',
                                    color: styles.titleColor,
                                    lineHeight: 1.2,
                                }}
                            >
                                {slide.title}
                            </div>
                            {slide.bullets[0] && (
                                <div
                                    className="opacity-75"
                                    style={{
                                        fontSize: 'clamp(5px, 1.2cqw, 10px)',
                                        color: styles.textColor,
                                    }}
                                >
                                    {slide.bullets[0]}
                                </div>
                            )}
                            {/* Decorative accent line */}
                            <div
                                className="rounded-full mt-1"
                                style={{
                                    width: '30%',
                                    height: '2px',
                                    backgroundColor: styles.bulletDot,
                                }}
                            />
                        </div>
                    ) : (
                        // Content slide layout: title at top, bullets below
                        <div className="flex flex-col h-full">
                            {/* Title in colored bar */}
                            <div
                                className="font-bold mb-[6%] z-10"
                                style={{
                                    fontSize: 'clamp(6px, 1.6cqw, 13px)',
                                    color: isTitleSlide ? styles.titleColor : '#ffffff',
                                    lineHeight: 1.2,
                                    paddingTop: '4%',
                                }}
                            >
                                {slide.title}
                            </div>
                            {/* Bullets */}
                            <div className="flex flex-col gap-[4%] flex-1 mt-[20%]">
                                {slide.bullets.slice(0, 4).map((bullet, bi) => (
                                    <div key={bi} className="flex items-start gap-[3%]">
                                        <div
                                            className="rounded-full flex-shrink-0 mt-[0.5%]"
                                            style={{
                                                width: 'clamp(3px, 0.6cqw, 5px)',
                                                height: 'clamp(3px, 0.6cqw, 5px)',
                                                backgroundColor: styles.bulletDot,
                                                minWidth: '3px',
                                                minHeight: '3px',
                                            }}
                                        />
                                        <span
                                            className="leading-tight"
                                            style={{
                                                fontSize: 'clamp(4px, 1cqw, 9px)',
                                                color: styles.textColor,
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {bullet.length > 60 ? bullet.slice(0, 60) + '…' : bullet}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Hover overlay with "Click to present" */}
                <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl transition-all duration-200"
                    style={{
                        backgroundColor: hovered ? 'rgba(0,0,0,0.35)' : 'transparent',
                    }}
                >
                    {hovered && (
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                            <Monitor className="h-3 w-3" />
                            Present from here
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SlidePreviewGrid({ slides, template, onPresent }: SlidePreviewGridProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Slide Preview</h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {slides.length} slides generated — click any slide to present from that point
                    </p>
                </div>
                <button
                    onClick={() => onPresent(0)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                    <Monitor className="h-4 w-4" />
                    Present All
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {slides.map((slide, index) => (
                    <SlideCard
                        key={slide.slideNumber}
                        slide={slide}
                        template={template}
                        index={index}
                        onClick={() => onPresent(index)}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Core type definitions for the presentation generator
 */

export type SlideType = 'title' | 'content' | 'summary';

export type TemplateType = 'minimal' | 'professional' | 'creative';

/**
 * Raw slide data generated from Gemini API
 */
export interface GeneratedSlide {
  slideNumber: number;
  type: SlideType;
  title: string;
  bullets: string[];
  imageConcept?: string;
  imageUrl?: string | null;
}

/**
 * Complete presentation metadata
 */
export interface Presentation {
  jobId: string;
  topic: string;
  context?: string;
  slideCount: number;
  template: TemplateType;
  slides: GeneratedSlide[];
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Generation request from frontend
 */
export interface GenerationRequest {
  topic: string;
  context?: string;
  slideCount: number;
  template: TemplateType;
}

/**
 * Generation status for polling
 */
export type GenerationStatus = 'idle' | 'generating' | 'composing' | 'complete' | 'error';

export interface GenerationJob {
  jobId: string;
  status: GenerationStatus;
  progress: number; // 0-100
  currentSlide: number;
  totalSlides: number;
  pptxUrl?: string;
  slides?: GeneratedSlide[];
  template?: TemplateType;
  topic?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Template configuration
 */
export interface Template {
  name: TemplateType;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    title: string;
    body: string;
  };
}

/**
 * Slide layout configuration
 */
export interface SlideLayout {
  type: SlideType;
  titleFontSize: number;
  bodyFontSize: number;
  marginTop: number;
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  imagePosition?: 'left' | 'right' | 'center' | 'background';
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  jobId?: string;
}

export interface GenerateResponse extends ApiResponse<{ jobId: string; estimatedTime: number }> { }
export interface StatusResponse extends ApiResponse<GenerationJob> { }
export interface TemplatesResponse extends ApiResponse<{ templates: Template[] }> { }

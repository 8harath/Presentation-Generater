/**
 * PowerPoint template definitions
 * Defines styling, colors, and layouts for each template
 */

import type { Template, TemplateType, SlideLayout } from '@/lib/types/presentation';

/**
 * Minimal template - clean, professional, lots of white space
 */
export const minimalTemplate: Template = {
  name: 'minimal',
  displayName: 'Minimal',
  description: 'Clean and modern with plenty of whitespace',
  colors: {
    primary: '#1F2937', // Dark gray
    accent: '#3B82F6', // Blue
    background: '#FFFFFF', // White
    text: '#1F2937', // Dark gray
  },
  fonts: {
    title: 'Calibri',
    body: 'Calibri',
  },
};

/**
 * Professional template - corporate, bold, structured
 */
export const professionalTemplate: Template = {
  name: 'professional',
  displayName: 'Professional',
  description: 'Corporate design with strong visual hierarchy',
  colors: {
    primary: '#003366', // Navy blue
    accent: '#FF6B35', // Orange
    background: '#F8F9FA', // Light gray
    text: '#222222', // Almost black
  },
  fonts: {
    title: 'Arial',
    body: 'Arial',
  },
};

/**
 * Creative template - vibrant, modern, engaging
 */
export const creativeTemplate: Template = {
  name: 'creative',
  displayName: 'Creative',
  description: 'Vibrant and engaging for creative topics',
  colors: {
    primary: '#7C3AED', // Purple
    accent: '#EC4899', // Pink
    background: '#FAFAFA', // Off-white
    text: '#1E293B', // Dark slate
  },
  fonts: {
    title: 'Trebuchet MS',
    body: 'Trebuchet MS',
  },
};

/**
 * Get template by name
 */
export function getTemplate(templateName: TemplateType): Template {
  switch (templateName) {
    case 'minimal':
      return minimalTemplate;
    case 'professional':
      return professionalTemplate;
    case 'creative':
      return creativeTemplate;
    default:
      return minimalTemplate;
  }
}

/**
 * All available templates
 */
export const AVAILABLE_TEMPLATES: Template[] = [
  minimalTemplate,
  professionalTemplate,
  creativeTemplate,
];

/**
 * Define slide layouts for each template
 */
export function getSlideLayouts(templateName: TemplateType) {
  const template = getTemplate(templateName);

  const baseLayout: Omit<SlideLayout, 'type'> = {
    titleFontSize: 44,
    bodyFontSize: 18,
    marginTop: 0.5,
    marginLeft: 0.75,
    marginRight: 0.75,
    marginBottom: 0.5,
  };

  return {
    title: {
      type: 'title' as const,
      titleFontSize: 54,
      bodyFontSize: 20,
      marginTop: 2,
      marginLeft: 1,
      marginRight: 1,
      marginBottom: 1,
      imagePosition: 'center' as const,
      imageWidth: 9,
      imageHeight: 5,
    },
    content: {
      type: 'content' as const,
      ...baseLayout,
      imagePosition: 'right' as const,
      imageWidth: 4,
      imageHeight: 4,
    },
    summary: {
      type: 'summary' as const,
      titleFontSize: 44,
      bodyFontSize: 18,
      marginTop: 1,
      marginLeft: 1,
      marginRight: 1,
      marginBottom: 1,
      imagePosition: 'center' as const,
      imageWidth: 8,
      imageHeight: 4.5,
    },
  };
}

/**
 * RGB color converter
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Get all templates info for API response
 */
export function getTemplatesInfo() {
  return AVAILABLE_TEMPLATES.map((t) => ({
    name: t.name,
    displayName: t.displayName,
    description: t.description,
  }));
}

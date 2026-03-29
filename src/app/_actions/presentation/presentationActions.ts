"use server";

// Presentation persistence is handled client-side via localStorage.
// These server actions are kept as no-op stubs for compatibility.

import { type PlateSlide } from "@/components/presentation/utils/parser";

type PresentationContent = {
  slides: PlateSlide[];
  config?: Record<string, unknown>;
};

export async function createPresentation({
  title,
}: {
  content: PresentationContent;
  title: string;
  theme?: string;
  outline?: string[];
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
}) {
  return {
    success: true,
    message: "Presentation session created",
    presentation: {
      id: `session-${Date.now()}`,
      title: title || "Untitled Presentation",
    },
  };
}

export async function createEmptyPresentation(
  title: string,
  _theme = "mystique",
  _language = "en-US",
) {
  return createPresentation({
    content: { slides: [] },
    title,
  });
}

export async function updatePresentation(_: {
  id: string;
  content?: PresentationContent;
  title?: string;
  theme?: string;
  prompt?: string;
  outline?: string[];
  searchResults?: Array<{ query: string; results: unknown[] }>;
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
  thumbnailUrl?: string;
}) {
  return { success: true, message: "Saved via localStorage" };
}

export async function updatePresentationTitle(_id: string, _title: string) {
  return { success: true, message: "Saved via localStorage" };
}

export async function deletePresentation(_id: string) {
  return { success: true, message: "Deleted via localStorage" };
}

export async function deletePresentations(_ids: string[]) {
  return { success: true, message: "Deleted via localStorage", partialSuccess: false };
}

export async function getPresentation(_id: string) {
  return { success: false, message: "Use localStorage" };
}

export async function getPresentationContent(_id: string) {
  return { success: false, message: "Use localStorage" };
}

export async function updatePresentationTheme(_id: string, _theme: string) {
  return { success: true, message: "Saved via localStorage" };
}

export async function duplicatePresentation(_id: string, _newTitle?: string) {
  return { success: false, message: "Use localStorage" };
}

export async function listPresentations() {
  return { success: true, presentations: [] };
}

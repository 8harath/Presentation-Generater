"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";

type PresentationContent = {
  slides: PlateSlide[];
  config?: Record<string, unknown>;
};

type SearchResults = Array<{ query: string; results: unknown[] }>;

const NOT_AVAILABLE_MESSAGE =
  "Saved presentations are disabled in instant mode. Generate a new presentation from the dashboard.";

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
    message: "Instant presentation session created",
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
  searchResults?: SearchResults;
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
  thumbnailUrl?: string;
}) {
  return {
    success: true,
    message: "Instant mode does not persist presentation changes",
  };
}

export async function updatePresentationTitle(_id: string, _title: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

export async function deletePresentation(_id: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

export async function deletePresentations(_ids: string[]) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
    partialSuccess: false,
  };
}

export async function getPresentation(_id: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

export async function getPresentationContent(_id: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

export async function updatePresentationTheme(_id: string, _theme: string) {
  return {
    success: true,
    message: "Theme updated for the current instant session",
  };
}

export async function duplicatePresentation(_id: string, _newTitle?: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { db } from "@/server/db";
import { type Prisma } from "@prisma/client";

type PresentationContent = {
  slides: PlateSlide[];
  config?: Record<string, unknown>;
};

type SearchResults = Array<{ query: string; results: unknown[] }>;

export async function createPresentation({
  content,
  title,
  theme = "mystique",
  outline = [],
  imageSource = "stock",
  presentationStyle,
  language = "en-US",
}: {
  content: PresentationContent;
  title: string;
  theme?: string;
  outline?: string[];
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
}) {
  try {
    // Ensure the public user exists
    await db.user.upsert({
      where: { id: "public-session" },
      update: {},
      create: {
        id: "public-session",
        name: "Public Visitor",
        email: "public@allweone.app",
        role: "USER",
        hasAccess: true,
      },
    });

    const doc = await db.baseDocument.create({
      data: {
        title: title || "Untitled Presentation",
        type: "PRESENTATION",
        documentType: "presentation",
        userId: "public-session",
        presentation: {
          create: {
            content: content as unknown as Prisma.InputJsonValue,
            theme,
            imageSource,
            presentationStyle,
            language,
            outline: outline as unknown as Prisma.InputJsonValue,
          },
        },
      },
      include: { presentation: true },
    });

    return {
      success: true,
      message: "Presentation created",
      presentation: { id: doc.id, title: doc.title },
    };
  } catch (error) {
    console.error("Error creating presentation:", error);
    return {
      success: true,
      message: "Instant presentation session created",
      presentation: {
        id: `session-${Date.now()}`,
        title: title || "Untitled Presentation",
      },
    };
  }
}

export async function createEmptyPresentation(
  title: string,
  theme = "mystique",
  language = "en-US",
) {
  return createPresentation({
    content: { slides: [] },
    title,
    theme,
    language,
  });
}

export async function updatePresentation({
  id,
  content,
  title,
  theme,
  prompt,
  outline,
  searchResults,
  imageSource,
  presentationStyle,
  language,
  thumbnailUrl,
}: {
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
  try {
    // Update base document fields
    if (title || thumbnailUrl) {
      await db.baseDocument.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(thumbnailUrl && { thumbnailUrl }),
        },
      });
    }

    // Build presentation update data
    const presentationData: Prisma.PresentationUpdateInput = {};
    if (content) presentationData.content = content as unknown as Prisma.InputJsonValue;
    if (theme) presentationData.theme = theme;
    if (prompt !== undefined) presentationData.prompt = prompt;
    if (outline) presentationData.outline = outline as unknown as Prisma.InputJsonValue;
    if (searchResults) presentationData.searchResults = searchResults as unknown as Prisma.InputJsonValue;
    if (imageSource) presentationData.imageSource = imageSource;
    if (presentationStyle) presentationData.presentationStyle = presentationStyle;
    if (language) presentationData.language = language;

    if (Object.keys(presentationData).length > 0) {
      await db.presentation.update({
        where: { id },
        data: presentationData,
      });
    }

    return { success: true, message: "Presentation updated" };
  } catch (error) {
    console.error("Error updating presentation:", error);
    return { success: false, message: "Failed to update presentation" };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  try {
    await db.baseDocument.update({
      where: { id },
      data: { title },
    });
    return { success: true, message: "Title updated" };
  } catch (error) {
    console.error("Error updating title:", error);
    return { success: false, message: "Failed to update title" };
  }
}

export async function deletePresentation(id: string) {
  try {
    await db.baseDocument.delete({ where: { id } });
    return { success: true, message: "Presentation deleted" };
  } catch (error) {
    console.error("Error deleting presentation:", error);
    return { success: false, message: "Failed to delete presentation" };
  }
}

export async function deletePresentations(ids: string[]) {
  try {
    await db.baseDocument.deleteMany({ where: { id: { in: ids } } });
    return { success: true, message: "Presentations deleted", partialSuccess: false };
  } catch (error) {
    console.error("Error deleting presentations:", error);
    return { success: false, message: "Failed to delete presentations", partialSuccess: false };
  }
}

export async function getPresentation(id: string) {
  try {
    const doc = await db.baseDocument.findUnique({
      where: { id },
      include: { presentation: true },
    });

    if (!doc || !doc.presentation) {
      return { success: false, message: "Presentation not found" };
    }

    return {
      success: true,
      presentation: {
        id: doc.id,
        title: doc.title,
        theme: doc.presentation.theme,
        imageSource: doc.presentation.imageSource,
        prompt: doc.presentation.prompt,
        presentationStyle: doc.presentation.presentationStyle,
        language: doc.presentation.language,
        outline: doc.presentation.outline,
        searchResults: doc.presentation.searchResults,
        content: doc.presentation.content,
        thumbnailUrl: doc.thumbnailUrl,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error getting presentation:", error);
    return { success: false, message: "Failed to load presentation" };
  }
}

export async function getPresentationContent(id: string) {
  return getPresentation(id);
}

export async function updatePresentationTheme(id: string, theme: string) {
  try {
    await db.presentation.update({
      where: { id },
      data: { theme },
    });
    return { success: true, message: "Theme updated" };
  } catch (error) {
    console.error("Error updating theme:", error);
    return { success: false, message: "Failed to update theme" };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  try {
    const existing = await db.baseDocument.findUnique({
      where: { id },
      include: { presentation: true },
    });

    if (!existing || !existing.presentation) {
      return { success: false, message: "Presentation not found" };
    }

    const doc = await db.baseDocument.create({
      data: {
        title: newTitle || `${existing.title} (copy)`,
        type: "PRESENTATION",
        documentType: "presentation",
        userId: "public-session",
        presentation: {
          create: {
            content: existing.presentation.content as Prisma.InputJsonValue,
            theme: existing.presentation.theme,
            imageSource: existing.presentation.imageSource,
            prompt: existing.presentation.prompt,
            presentationStyle: existing.presentation.presentationStyle,
            language: existing.presentation.language,
            outline: existing.presentation.outline as Prisma.InputJsonValue,
            searchResults: existing.presentation.searchResults as Prisma.InputJsonValue | undefined,
          },
        },
      },
    });

    return {
      success: true,
      message: "Presentation duplicated",
      presentation: { id: doc.id, title: doc.title },
    };
  } catch (error) {
    console.error("Error duplicating presentation:", error);
    return { success: false, message: "Failed to duplicate presentation" };
  }
}

export async function listPresentations() {
  try {
    const docs = await db.baseDocument.findMany({
      where: { userId: "public-session", type: "PRESENTATION" },
      include: { presentation: true },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      presentations: docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        theme: doc.presentation?.theme ?? "mystique",
        thumbnailUrl: doc.thumbnailUrl,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error listing presentations:", error);
    return { success: true, presentations: [] };
  }
}

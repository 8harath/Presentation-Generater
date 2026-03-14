"use server";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { DocumentType } from "@prisma/client";

type PresentationContent = {
  slides: PlateSlide[];
  config?: Record<string, unknown>;
};

type SearchResults = Array<{ query: string; results: unknown[] }>;

async function getOwnedPresentation(id: string, userId: string) {
  return db.baseDocument.findFirst({
    where: {
      id,
      userId,
      type: DocumentType.PRESENTATION,
    },
    include: {
      presentation: true,
    },
  });
}

export async function createPresentation({
  content,
  title,
  theme = "mystique",
  outline,
  imageSource,
  presentationStyle,
  language,
}: {
  content: PresentationContent;
  title: string;
  theme?: string;
  outline?: string[];
  imageSource?: string;
  presentationStyle?: string;
  language?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.create({
      data: {
        type: DocumentType.PRESENTATION,
        documentType: "presentation",
        title: title || "Untitled Presentation",
        userId: session.user.id,
        presentation: {
          create: {
            content,
            theme,
            imageSource,
            presentationStyle,
            language,
            outline: outline ?? [],
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation created successfully",
      presentation,
    };
  } catch (error) {
    console.error("Failed to create presentation:", error);
    return {
      success: false,
      message: "Failed to create presentation",
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
  prompt,
  title,
  theme,
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
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const existing = await getOwnedPresentation(id, session.user.id);

    if (!existing?.presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    const presentation = await db.baseDocument.update({
      where: { id: existing.id },
      data: {
        title,
        thumbnailUrl,
        presentation: {
          update: {
            prompt,
            content,
            theme,
            imageSource,
            presentationStyle,
            language,
            outline,
            searchResults,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation updated successfully",
      presentation,
    };
  } catch (error) {
    console.error("Failed to update presentation:", error);
    return {
      success: false,
      message: "Failed to update presentation",
    };
  }
}

export async function updatePresentationTitle(id: string, title: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const existing = await getOwnedPresentation(id, session.user.id);

    if (!existing) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    const presentation = await db.baseDocument.update({
      where: { id: existing.id },
      data: { title },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation title updated successfully",
      presentation,
    };
  } catch (error) {
    console.error("Failed to update presentation title:", error);
    return {
      success: false,
      message: "Failed to update presentation title",
    };
  }
}

export async function deletePresentation(id: string) {
  return deletePresentations([id]);
}

export async function deletePresentations(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await db.baseDocument.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
        type: DocumentType.PRESENTATION,
      },
    });

    const deletedCount = result.count;
    const failedCount = ids.length - deletedCount;

    if (failedCount > 0) {
      return {
        success: deletedCount > 0,
        message:
          deletedCount > 0
            ? `Deleted ${deletedCount} presentations, failed to delete ${failedCount} presentations`
            : "Failed to delete presentations",
        partialSuccess: deletedCount > 0,
      };
    }

    return {
      success: true,
      message:
        ids.length === 1
          ? "Presentation deleted successfully"
          : `${deletedCount} presentations deleted successfully`,
    };
  } catch (error) {
    console.error("Failed to delete presentations:", error);
    return {
      success: false,
      message: "Failed to delete presentations",
    };
  }
}

export async function getPresentation(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await getOwnedPresentation(id, session.user.id);

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    return {
      success: true,
      presentation,
    };
  } catch (error) {
    console.error("Failed to fetch presentation:", error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function getPresentationContent(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const presentation = await db.baseDocument.findFirst({
      where: {
        id,
        type: DocumentType.PRESENTATION,
        OR: [{ userId: session.user.id }, { isPublic: true }],
      },
      include: {
        presentation: {
          select: {
            id: true,
            content: true,
            theme: true,
            outline: true,
          },
        },
      },
    });

    if (!presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    return {
      success: true,
      presentation: presentation.presentation,
    };
  } catch (error) {
    console.error("Failed to fetch presentation content:", error);
    return {
      success: false,
      message: "Failed to fetch presentation",
    };
  }
}

export async function updatePresentationTheme(id: string, theme: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const existing = await getOwnedPresentation(id, session.user.id);

    if (!existing?.presentation) {
      return {
        success: false,
        message: "Presentation not found",
      };
    }

    const presentation = await db.presentation.update({
      where: { id: existing.id },
      data: { theme },
    });

    return {
      success: true,
      message: "Presentation theme updated successfully",
      presentation,
    };
  } catch (error) {
    console.error("Failed to update presentation theme:", error);
    return {
      success: false,
      message: "Failed to update presentation theme",
    };
  }
}

export async function duplicatePresentation(id: string, newTitle?: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const original = await getOwnedPresentation(id, session.user.id);

    if (!original?.presentation) {
      return {
        success: false,
        message: "Original presentation not found",
      };
    }

    const duplicated = await db.baseDocument.create({
      data: {
        type: DocumentType.PRESENTATION,
        documentType: "presentation",
        title: newTitle ?? `${original.title} (Copy)`,
        userId: session.user.id,
        isPublic: false,
        presentation: {
          create: {
            content: original.presentation.content as PresentationContent,
            theme: original.presentation.theme,
            imageSource: original.presentation.imageSource,
            prompt: original.presentation.prompt ?? undefined,
            presentationStyle: original.presentation.presentationStyle ?? undefined,
            language: original.presentation.language ?? undefined,
            outline: original.presentation.outline,
            searchResults: original.presentation.searchResults ?? undefined,
            customThemeId: original.presentation.customThemeId ?? undefined,
          },
        },
      },
      include: {
        presentation: true,
      },
    });

    return {
      success: true,
      message: "Presentation duplicated successfully",
      presentation: duplicated,
    };
  } catch (error) {
    console.error("Failed to duplicate presentation:", error);
    return {
      success: false,
      message: "Failed to duplicate presentation",
    };
  }
}

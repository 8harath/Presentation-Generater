"use server";

import { db } from "@/server/db";

export async function getSharedPresentation(id: string) {
  try {
    const doc = await db.baseDocument.findUnique({
      where: { id, isPublic: true },
      include: { presentation: true },
    });

    if (!doc || !doc.presentation) {
      return { success: false, message: "Presentation not found or not public" };
    }

    return {
      success: true,
      presentation: {
        id: doc.id,
        title: doc.title,
        theme: doc.presentation.theme,
        content: doc.presentation.content,
        language: doc.presentation.language,
        outline: doc.presentation.outline,
      },
    };
  } catch (error) {
    console.error("Error getting shared presentation:", error);
    return { success: false, message: "Failed to load shared presentation" };
  }
}

export async function togglePresentationPublicStatus(
  id: string,
  isPublic: boolean,
) {
  try {
    await db.baseDocument.update({
      where: { id },
      data: { isPublic },
    });
    return { success: true, message: isPublic ? "Presentation is now public" : "Presentation is now private" };
  } catch (error) {
    console.error("Error toggling public status:", error);
    return { success: false, message: "Failed to update sharing status" };
  }
}

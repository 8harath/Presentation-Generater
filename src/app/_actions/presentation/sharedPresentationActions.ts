"use server";

// Sharing is handled client-side via localStorage.

export async function getSharedPresentation(_id: string) {
  return { success: false, message: "Use localStorage" };
}

export async function togglePresentationPublicStatus(
  _id: string,
  _isPublic: boolean,
) {
  return { success: true, message: "Updated via localStorage" };
}

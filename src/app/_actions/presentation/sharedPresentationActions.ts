"use server";

const NOT_AVAILABLE_MESSAGE =
  "Sharing is unavailable in instant mode because presentations are not stored on the server.";

export async function getSharedPresentation(_id: string) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

export async function togglePresentationPublicStatus(
  _id: string,
  _isPublic: boolean,
) {
  return {
    success: false,
    message: NOT_AVAILABLE_MESSAGE,
  };
}

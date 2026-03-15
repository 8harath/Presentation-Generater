"use server";

export async function exportPresentation(
  _presentationId: string,
  _fileName?: string,
  _theme?: Partial<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    heading: string;
    muted: string;
  }>,
) {
  return {
    success: false,
    error:
      "Export is unavailable in instant mode because presentations are not stored on the server.",
  };
}

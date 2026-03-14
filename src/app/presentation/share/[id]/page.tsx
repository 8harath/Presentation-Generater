import { getSharedPresentation } from "@/app/_actions/presentation/sharedPresentationActions";
import { SharedPresentationView } from "@/components/presentation/presentation-page/SharedPresentationView";
import { type ThemeProperties } from "@/lib/presentation/themes";
import { type PlateSlide } from "@/components/presentation/utils/parser";
import { notFound } from "next/navigation";

export default async function SharedPresentationPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getSharedPresentation(params.id);

  if (!result.success || !result.presentation?.presentation) {
    notFound();
  }

  const presentationContent = result.presentation.presentation.content as {
    slides?: unknown[];
    config?: Record<string, unknown>;
  };

  return (
    <SharedPresentationView
      presentationId={result.presentation.id}
      title={result.presentation.title}
      authorName={result.presentation.user?.name}
      slides={(presentationContent.slides ?? []) as PlateSlide[]}
      theme={result.presentation.presentation.theme}
      customThemeData={
        (result.presentation.presentation.customTheme?.themeData as
          | ThemeProperties
          | undefined) ?? null
      }
      config={presentationContent.config}
    />
  );
}

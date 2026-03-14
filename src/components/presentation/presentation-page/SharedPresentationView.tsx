"use client";

import { useEffect } from "react";

import { type ThemeProperties, themes } from "@/lib/presentation/themes";
import { usePresentationState } from "@/states/presentation-state";
import PresentationEditorStaticView from "../editor/presentation-editor-static";
import { type PlateSlide } from "../utils/parser";
import { PresentationLayout } from "./PresentationLayout";

interface SharedPresentationViewProps {
  presentationId: string;
  title: string;
  authorName?: string | null;
  slides: PlateSlide[];
  theme: string;
  customThemeData?: ThemeProperties | null;
  config?: Record<string, unknown>;
}

export function SharedPresentationView({
  presentationId,
  title,
  authorName,
  slides,
  theme,
  customThemeData,
  config,
}: SharedPresentationViewProps) {
  const {
    setConfig,
    setCurrentPresentation,
    setCurrentSlideIndex,
    setIsPresenting,
    setOutline,
    setSlides,
    setTheme,
  } = usePresentationState();

  useEffect(() => {
    setCurrentPresentation(presentationId, title);
    setSlides(slides);
    setOutline([]);
    setTheme(theme, customThemeData ?? null);
    setConfig(config ?? {});
    setCurrentSlideIndex(0);
    setIsPresenting(false);
  }, [
    config,
    customThemeData,
    presentationId,
    setConfig,
    setCurrentPresentation,
    setCurrentSlideIndex,
    setIsPresenting,
    setOutline,
    setSlides,
    setTheme,
    slides,
    theme,
    title,
  ]);

  const themeData =
    customThemeData ??
    (theme in themes ? themes[theme as keyof typeof themes] : undefined);

  return (
    <PresentationLayout isShared themeData={themeData}>
      <div className="mx-auto flex w-full max-w-[90%] flex-col gap-8 px-6 pb-20 pt-16">
        <section className="rounded-2xl border bg-background/80 p-6 shadow-sm backdrop-blur-sm">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {authorName ? `Shared by ${authorName}` : "Shared presentation"}
          </p>
        </section>

        <div className="flex flex-col gap-8">
          {slides.map((slide, index) => (
            <section
              key={slide.id}
              className="rounded-2xl border bg-background/50 p-2 shadow-sm"
            >
              <PresentationEditorStaticView
                initialContent={slide}
                className="min-h-[300px] rounded-xl border bg-background"
                id={`shared-slide-${index}`}
              />
            </section>
          ))}
        </div>
      </div>
    </PresentationLayout>
  );
}

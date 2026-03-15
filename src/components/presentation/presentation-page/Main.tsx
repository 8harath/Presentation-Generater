"use client";

import { type PlateSlide } from "@/components/presentation/utils/parser";
import {
  setThemeVariables,
  type ThemeProperties,
  type Themes,
  themes,
} from "@/lib/presentation/themes";
import { usePresentationState } from "@/states/presentation-state";
import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "./Loading";
import { PresentationLayout } from "./PresentationLayout";
import { PresentationSlidesView } from "./PresentationSlidesView";

function normalizeOutline(outline: unknown): string[] {
  if (!Array.isArray(outline)) {
    return [];
  }

  return outline.filter((item): item is string => typeof item === "string");
}

export default function PresentationPage() {
  const params = useParams();
  const id = params.id as string;
  const { resolvedTheme } = useTheme();
  const setCurrentPresentation = usePresentationState(
    (s) => s.setCurrentPresentation,
  );
  const setPresentationInput = usePresentationState(
    (s) => s.setPresentationInput,
  );
  const setOutline = usePresentationState((s) => s.setOutline);
  const setSlides = usePresentationState((s) => s.setSlides);
  const setThumbnailUrl = usePresentationState((s) => s.setThumbnailUrl);
  const isGeneratingPresentation = usePresentationState(
    (s) => s.isGeneratingPresentation,
  );
  const setTheme = usePresentationState((s) => s.setTheme);
  const setImageModel = usePresentationState((s) => s.setImageModel);
  const setImageSource = usePresentationState((s) => s.setImageSource);
  const setPresentationStyle = usePresentationState(
    (s) => s.setPresentationStyle,
  );
  const currentSlideIndex = usePresentationState((s) => s.currentSlideIndex);
  const setLanguage = usePresentationState((s) => s.setLanguage);
  const theme = usePresentationState((s) => s.theme);
  const currentPresentationId = usePresentationState((s) => s.currentPresentationId);
  const currentPresentationTitle = usePresentationState((s) => s.currentPresentationTitle);
  const presentationInput = usePresentationState((s) => s.presentationInput);
  const outline = usePresentationState((s) => s.outline);
  const slides = usePresentationState((s) => s.slides);
  const config = usePresentationState((s) => s.config);

  useEffect(() => {
    if (currentPresentationId !== id) {
      return;
    }

    if (currentPresentationTitle) {
      setCurrentPresentation(currentPresentationId, currentPresentationTitle);
      setPresentationInput(presentationInput || currentPresentationTitle);
    }
    if (outline.length > 0) {
      setOutline(normalizeOutline(outline));
    }
    if (slides.length > 0) {
      setSlides(slides as PlateSlide[]);
    }
    if (config.backgroundOverride !== undefined) {
      const { setConfig } = usePresentationState.getState();
      setConfig(config);
    }
    if (!(String(theme) in themes)) {
      setTheme("mystique" as Themes);
    }
  }, [
    config,
    currentPresentationId,
    currentPresentationTitle,
    id,
    outline,
    presentationInput,
    setCurrentPresentation,
    setOutline,
    setPresentationInput,
    setSlides,
    setTheme,
    slides,
    theme,
  ]);

  // Set theme variables when theme changes
  useEffect(() => {
    if (theme && resolvedTheme) {
      const state = usePresentationState.getState();
      // Check if we have custom theme data
      if (state.customThemeData) {
        setThemeVariables(state.customThemeData, resolvedTheme === "dark");
      }
      // Otherwise try to use a predefined theme
      else if (typeof theme === "string" && theme in themes) {
        const currentTheme = themes[theme as keyof typeof themes];
        if (currentTheme) {
          setThemeVariables(currentTheme, resolvedTheme === "dark");
        }
      }
    }
  }, [theme, resolvedTheme]);

  // Get the current theme data
  const currentThemeData = (() => {
    const state = usePresentationState.getState();
    if (state.customThemeData) {
      return state.customThemeData;
    }
    if (typeof theme === "string" && theme in themes) {
      return themes[theme as keyof typeof themes];
    }
    return null;
  })();

  if (currentPresentationId !== id) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3">
        <h2 className="text-2xl font-semibold">No active presentation session</h2>
        <p className="text-center text-muted-foreground">
          Instant mode does not save presentations. Start a new one from the dashboard.
        </p>
      </div>
    );
  }

  return (
    <PresentationLayout
      isLoading={false}
      themeData={currentThemeData ?? undefined}
    >
      <div className="mx-auto max-w-[90%] space-y-8 pt-16">
        <div className="space-y-8">
          <PresentationSlidesView
            isGeneratingPresentation={isGeneratingPresentation}
          />
        </div>
      </div>
    </PresentationLayout>
  );
}

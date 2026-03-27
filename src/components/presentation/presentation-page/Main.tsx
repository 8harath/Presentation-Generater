"use client";

import { getPresentation } from "@/app/_actions/presentation/presentationActions";
import { type PlateSlide } from "@/components/presentation/utils/parser";
import {
  setThemeVariables,
  type ThemeProperties,
  type Themes,
  themes,
} from "@/lib/presentation/themes";
import { usePresentationState } from "@/states/presentation-state";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const id = params.id as string;
  const { resolvedTheme } = useTheme();
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  // Load from DB if the presentation isn't in Zustand state
  useEffect(() => {
    if (currentPresentationId === id) return;

    async function loadFromDb() {
      setIsLoadingFromDb(true);
      setLoadError(null);
      try {
        const result = await getPresentation(id);
        if (result.success && result.presentation) {
          const p = result.presentation;
          setCurrentPresentation(id, p.title);
          setPresentationInput(p.prompt || p.title);
          setOutline(normalizeOutline(p.outline));
          if (p.theme && p.theme in themes) {
            setTheme(p.theme as Themes);
          }
          if (p.language) setLanguage(p.language);
          if (p.presentationStyle) setPresentationStyle(p.presentationStyle);
          if (p.imageSource) setImageSource(p.imageSource as "ai" | "stock");
          if (p.thumbnailUrl) setThumbnailUrl(p.thumbnailUrl);

          // Load slides from content
          const content = p.content as { slides?: PlateSlide[]; config?: Record<string, unknown> } | null;
          if (content?.slides && content.slides.length > 0) {
            setSlides(content.slides);
          }
          if (content?.config) {
            usePresentationState.getState().setConfig(content.config);
          }
        } else {
          setLoadError("Presentation not found");
        }
      } catch {
        setLoadError("Failed to load presentation");
      } finally {
        setIsLoadingFromDb(false);
      }
    }

    loadFromDb();
  }, [id, currentPresentationId]);

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

  if (isLoadingFromDb) {
    return <LoadingState />;
  }

  if (loadError && currentPresentationId !== id) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3">
        <h2 className="text-2xl font-semibold">Presentation not found</h2>
        <p className="text-center text-muted-foreground">{loadError}</p>
        <button
          type="button"
          className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => router.push("/presentation")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (currentPresentationId !== id) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center gap-3">
        <h2 className="text-2xl font-semibold">No active presentation session</h2>
        <p className="text-center text-muted-foreground">
          Start a new one from the dashboard.
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

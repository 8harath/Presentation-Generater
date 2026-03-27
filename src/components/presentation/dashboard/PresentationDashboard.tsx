"use client";

import {
  createPresentation,
  deletePresentation,
  listPresentations,
} from "@/app/_actions/presentation/presentationActions";
import { Button } from "@/components/ui/button";
import { usePresentationState } from "@/states/presentation-state";
import { Trash2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PresentationControls } from "./PresentationControls";
import { PresentationExamples } from "./PresentationExamples";
import { PresentationHeader } from "./PresentationHeader";
import { PresentationInput } from "./PresentationInput";

interface SavedPresentation {
  id: string;
  title: string;
  theme: string;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function PresentationDashboard({
  sidebarSide,
}: {
  sidebarSide?: "left" | "right";
}) {
  const router = useRouter();
  const [savedPresentations, setSavedPresentations] = useState<SavedPresentation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const {
    presentationInput,
    isGeneratingOutline,
    setCurrentPresentation,
    setIsGeneratingOutline,
    language,
    theme,
    setShouldStartOutlineGeneration,
  } = usePresentationState();

  useEffect(() => {
    setCurrentPresentation("", "");
    setIsGeneratingOutline(false);
    setShouldStartOutlineGeneration(false);
    loadPresentations();

    // Refresh list when tab regains focus (e.g. after navigating back)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadPresentations();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const loadPresentations = async () => {
    setLoadingList(true);
    try {
      const result = await listPresentations();
      if (result.success) {
        setSavedPresentations(result.presentations);
      }
    } catch (error) {
      console.error("Failed to load presentations:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const handleGenerate = async () => {
    if (!presentationInput.trim()) {
      toast.error("Please enter a topic for your presentation");
      return;
    }

    setIsGeneratingOutline(true);

    try {
      const result = await createPresentation({
        content: { slides: [] },
        title: presentationInput.substring(0, 100) || "Untitled Presentation",
        theme: String(theme),
        language,
      });

      if (result.success && result.presentation) {
        setCurrentPresentation(result.presentation.id, result.presentation.title);
        router.push(`/presentation/generate/${result.presentation.id}`);
      } else {
        throw new Error("Failed to create presentation");
      }
    } catch (error) {
      setIsGeneratingOutline(false);
      console.error("Error starting presentation:", error);
      toast.error("Failed to start presentation generation");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePresentation(id);
    if (result.success) {
      setSavedPresentations((prev) => prev.filter((p) => p.id !== id));
      toast.success("Presentation deleted");
    } else {
      toast.error("Failed to delete presentation");
    }
  };

  return (
    <div className="notebook-section relative h-full w-full">
      <div className="mx-auto max-w-4xl space-y-12 px-6 py-12">
        <PresentationHeader />

        <div className="space-y-8">
          <PresentationInput handleGenerate={handleGenerate} />
          <PresentationControls />

          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleGenerate}
                disabled={!presentationInput.trim() || isGeneratingOutline}
                variant={isGeneratingOutline ? "loading" : "default"}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Generate Presentation
              </Button>
            </div>
          </div>
        </div>

        <PresentationExamples />

        {/* Saved Presentations */}
        {!loadingList && savedPresentations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Presentations</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedPresentations.map((pres) => (
                <div
                  key={pres.id}
                  className="group relative cursor-pointer rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                  onClick={() => router.push(`/presentation/${pres.id}`)}
                >
                  <h3 className="line-clamp-2 font-medium">{pres.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(pres.updatedAt).toLocaleDateString()}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-xs">
                    {pres.theme}
                  </span>
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pres.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

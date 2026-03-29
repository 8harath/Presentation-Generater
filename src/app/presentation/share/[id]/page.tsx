"use client";

import { SharedPresentationClient } from "./SharedPresentationClient";
import { presentationStorage } from "@/lib/presentation-storage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SharedPresentationPage() {
  const params = useParams();
  const id = params.id as string;
  const [presentation, setPresentation] = useState<{
    title: string;
    theme: string;
    slides: unknown[];
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = presentationStorage.get(id);
    if (stored && stored.isPublic) {
      setPresentation({
        title: stored.title,
        theme: stored.theme,
        slides: stored.content?.slides ?? [],
      });
    } else {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-semibold">Presentation not found</h1>
        <p className="max-w-xl text-muted-foreground">
          This presentation doesn&apos;t exist or isn&apos;t publicly shared.
        </p>
        <Link
          href="/presentation"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-all duration-150 hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!presentation) {
    return null;
  }

  return (
    <SharedPresentationClient
      title={presentation.title}
      theme={presentation.theme}
      slides={presentation.slides}
    />
  );
}

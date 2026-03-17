"use client";

import { convertPlateJSToPPTX } from "@/components/presentation/utils/exportToPPT";
import { themes } from "@/lib/presentation/themes";
import { usePresentationState } from "@/states/presentation-state";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const slides = usePresentationState((s) => s.slides);
  const currentPresentationTitle = usePresentationState(
    (s) => s.currentPresentationTitle,
  );
  const customThemeData = usePresentationState((s) => s.customThemeData);
  const theme = usePresentationState((s) => s.theme);
  const { resolvedTheme } = useTheme();

  const activeTheme =
    customThemeData ??
    (typeof theme === "string" && theme in themes ? themes[theme] : null);

  const themeColors = activeTheme
    ? resolvedTheme === "dark"
      ? activeTheme.colors.dark
      : activeTheme.colors.light
    : undefined;

  const getFileName = () => {
    const baseName = (currentPresentationTitle || "presentation")
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, "-");

    return `${baseName || "presentation"}.pptx`;
  };

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error("There are no slides to export yet.");
      return;
    }

    try {
      setIsExporting(true);
      const arrayBuffer = await convertPlateJSToPPTX(
        { slides },
        themeColors,
      );
      const blob = new Blob([arrayBuffer], {
        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("PPT export started.");
    } catch (error) {
      console.error("Failed to export presentation:", error);
      toast.error("Failed to export PPT. Check the console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={() => void handleExport()}
      disabled={isExporting}
    >
      <Download className="mr-1 h-4 w-4" />
      {isExporting ? "Exporting..." : "Export"}
    </Button>
  );
}

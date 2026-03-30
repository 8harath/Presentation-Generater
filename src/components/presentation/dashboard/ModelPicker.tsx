"use client";

import { DEFAULT_MODEL, MODEL_DISPLAY_NAME } from "@/lib/ai-constants";
import { Bot } from "lucide-react";

export function ModelPicker({
  shouldShowLabel = true,
}: {
  shouldShowLabel?: boolean;
}) {
  return (
    <div>
      {shouldShowLabel && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Text Model
        </label>
      )}
      <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3 text-sm">
        <Bot className="h-4 w-4 flex-shrink-0" />
        <div className="min-w-0">
          <div className="truncate font-medium">{MODEL_DISPLAY_NAME}</div>
          <div className="truncate text-xs text-muted-foreground">{DEFAULT_MODEL}</div>
        </div>
      </div>
    </div>
  );
}

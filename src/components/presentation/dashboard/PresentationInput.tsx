"use client";

import { usePresentationState } from "@/states/presentation-state";
import { Keyboard, Send } from "lucide-react";
import { useRef, useState } from "react";
import { WebSearchToggle } from "./WebSearchToggle";
import { VirtualKeyboard, isNonEnglishLanguage } from "./VirtualKeyboard";

export function PresentationInput({
  handleGenerate,
}: {
  handleGenerate: () => void;
}) {
  const { presentationInput, setPresentationInput, isGeneratingOutline, language } =
    usePresentationState();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const insertAtCursor = (char: string) => {
    const el = textareaRef.current;
    if (!el) {
      setPresentationInput(presentationInput + char);
      return;
    }
    const start = el.selectionStart ?? presentationInput.length;
    const end = el.selectionEnd ?? presentationInput.length;
    const next = presentationInput.slice(0, start) + char + presentationInput.slice(end);
    setPresentationInput(next);
    // Restore cursor after React re-render
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const handleBackspace = () => {
    const el = textareaRef.current;
    if (!el) {
      setPresentationInput(presentationInput.slice(0, -1));
      return;
    }
    const start = el.selectionStart ?? presentationInput.length;
    const end = el.selectionEnd ?? presentationInput.length;
    let next: string;
    let newPos: number;
    if (start !== end) {
      next = presentationInput.slice(0, start) + presentationInput.slice(end);
      newPos = start;
    } else if (start > 0) {
      next = presentationInput.slice(0, start - 1) + presentationInput.slice(start);
      newPos = start - 1;
    } else {
      return;
    }
    setPresentationInput(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  };

  const handleSpace = () => insertAtCursor(" ");

  const showKeyboardButton = isNonEnglishLanguage(language);

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={presentationInput}
          onChange={(e) => setPresentationInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="e.g. The impact of artificial intelligence on healthcare in 2025..."
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3.5 pb-14 text-base text-foreground placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40"
        />

        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WebSearchToggle />
            {showKeyboardButton && (
              <button
                type="button"
                onClick={() => setShowKeyboard((v) => !v)}
                title="Toggle virtual keyboard"
                className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all ${
                  showKeyboard
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Keyboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keyboard</span>
              </button>
            )}
            <span className="text-xs text-muted-foreground/50">
              {presentationInput.length > 0 && `${presentationInput.length} chars`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
              Ctrl+Enter
            </kbd>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!presentationInput.trim() || isGeneratingOutline}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showKeyboard && isNonEnglishLanguage(language) && (
        <VirtualKeyboard
          language={language}
          onChar={insertAtCursor}
          onBackspace={handleBackspace}
          onSpace={handleSpace}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}

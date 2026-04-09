"use client";

import { X } from "lucide-react";
import { useState } from "react";

type LanguageLayout = {
  name: string;
  groups: { label: string; chars: string[] }[];
};

const LAYOUTS: Record<string, LanguageLayout> = {
  hi: {
    name: "Hindi",
    groups: [
      {
        label: "Vowels",
        chars: ["अ","आ","इ","ई","उ","ऊ","ए","ऐ","ओ","औ","ऋ","अं","अः"],
      },
      {
        label: "Consonants",
        chars: ["क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","ळ","क्ष","त्र","ज्ञ"],
      },
      {
        label: "Diacritics",
        chars: ["ा","ि","ी","ु","ू","े","ै","ो","ौ","ं","ः","्","ँ","़"],
      },
    ],
  },
  mr: {
    name: "Marathi",
    groups: [
      {
        label: "Vowels",
        chars: ["अ","आ","इ","ई","उ","ऊ","ए","ऐ","ओ","औ","ऋ","अं","अः"],
      },
      {
        label: "Consonants",
        chars: ["क","ख","ग","घ","ङ","च","छ","ज","झ","ञ","ट","ठ","ड","ढ","ण","त","थ","द","ध","न","प","फ","ब","भ","म","य","र","ल","व","श","ष","स","ह","ळ","क्ष","त्र","ज्ञ"],
      },
      {
        label: "Diacritics",
        chars: ["ा","ि","ी","ु","ू","े","ै","ो","ौ","ं","ः","्","ँ"],
      },
    ],
  },
  bn: {
    name: "Bengali",
    groups: [
      {
        label: "Vowels",
        chars: ["অ","আ","ই","ঈ","উ","ঊ","ঋ","এ","ঐ","ও","ঔ"],
      },
      {
        label: "Consonants",
        chars: ["ক","খ","গ","ঘ","ঙ","চ","ছ","জ","ঝ","ঞ","ট","ঠ","ড","ঢ","ণ","ত","থ","দ","ধ","ন","প","ফ","ব","ভ","ম","য","র","ল","শ","ষ","স","হ","ড়","ঢ়","য়","ৎ"],
      },
      {
        label: "Diacritics",
        chars: ["া","ি","ী","ু","ূ","ৃ","ে","ৈ","ো","ৌ","ং","ঃ","্","ঁ"],
      },
    ],
  },
  as: {
    name: "Assamese",
    groups: [
      {
        label: "Vowels",
        chars: ["অ","আ","ই","ঈ","উ","ঊ","ঋ","এ","ঐ","ও","ঔ"],
      },
      {
        label: "Consonants",
        chars: ["ক","খ","গ","ঘ","ঙ","চ","ছ","জ","ঝ","ঞ","ট","ঠ","ড","ঢ","ণ","ত","থ","দ","ধ","ন","প","ফ","ব","ভ","ম","য","ৰ","ল","ৱ","শ","ষ","স","হ","ক্ষ"],
      },
      {
        label: "Diacritics",
        chars: ["া","ি","ী","ু","ূ","ৃ","ে","ৈ","ো","ৌ","ং","ঃ","্","ঁ"],
      },
    ],
  },
  ta: {
    name: "Tamil",
    groups: [
      {
        label: "Vowels",
        chars: ["அ","ஆ","இ","ஈ","உ","ஊ","எ","ஏ","ஐ","ஒ","ஓ","ஔ","ஃ"],
      },
      {
        label: "Consonants",
        chars: ["க","ங","ச","ஞ","ட","ண","த","ந","ப","ம","ய","ர","ல","வ","ழ","ள","ற","ன","ஶ","ஜ","ஷ","ஸ","ஹ"],
      },
      {
        label: "Diacritics",
        chars: ["ா","ி","ீ","ு","ூ","ெ","ே","ை","ொ","ோ","ௌ","்","ஂ"],
      },
    ],
  },
  te: {
    name: "Telugu",
    groups: [
      {
        label: "Vowels",
        chars: ["అ","ఆ","ఇ","ఈ","ఉ","ఊ","ఋ","ఎ","ఏ","ఐ","ఒ","ఓ","ఔ"],
      },
      {
        label: "Consonants",
        chars: ["క","ఖ","గ","ఘ","ఙ","చ","ఛ","జ","ఝ","ఞ","ట","ఠ","డ","ఢ","ణ","త","థ","ద","ధ","న","ప","ఫ","బ","భ","మ","య","ర","ల","వ","శ","ష","స","హ","ళ","క్ష","త్ర"],
      },
      {
        label: "Diacritics",
        chars: ["ా","ి","ీ","ు","ూ","ృ","ె","ే","ై","ొ","ో","ౌ","ం","ః","్"],
      },
    ],
  },
};

const ENGLISH_LANGS = new Set(["en-IN", "en-US"]);

interface VirtualKeyboardProps {
  language: string;
  onChar: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClose: () => void;
}

export function VirtualKeyboard({
  language,
  onChar,
  onBackspace,
  onSpace,
  onClose,
}: VirtualKeyboardProps) {
  const layout = LAYOUTS[language];
  const [activeGroup, setActiveGroup] = useState(0);

  if (!layout) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 py-2 bg-muted/30">
        <span className="text-xs font-semibold text-foreground">{layout.name} Keyboard</span>
        <div className="flex items-center gap-1">
          {layout.groups.map((g, i) => (
            <button
              key={g.label}
              type="button"
              onClick={() => setActiveGroup(i)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                activeGroup === i
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {g.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="ml-1 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close keyboard"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5 max-h-40 overflow-y-auto">
        <div className="flex flex-wrap gap-1">
          {layout.groups[activeGroup]?.chars.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onChar(char)}
              className="flex min-w-[2.25rem] items-center justify-center rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-md active:scale-95"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 bg-muted/10">
        <button
          type="button"
          onClick={onSpace}
          className="flex-1 rounded-lg border border-border bg-background py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
        >
          Space
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition-all hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
        >
          ⌫ Backspace
        </button>
      </div>
    </div>
  );
}

export function isNonEnglishLanguage(language: string): boolean {
  return !ENGLISH_LANGS.has(language);
}

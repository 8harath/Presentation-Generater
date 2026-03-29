import { type PlateSlide } from "@/components/presentation/utils/parser";

const STORAGE_KEY = "allweone_presentations";

export interface StoredPresentation {
  id: string;
  title: string;
  theme: string;
  content: { slides: PlateSlide[]; config?: Record<string, unknown> };
  outline: string[];
  searchResults?: Array<{ query: string; results: unknown[] }>;
  prompt?: string;
  imageSource: string;
  presentationStyle?: string;
  language: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

function getAll(): StoredPresentation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPresentation[]) : [];
  } catch {
    return [];
  }
}

function saveAll(presentations: StoredPresentation[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export const presentationStorage = {
  list(): StoredPresentation[] {
    return getAll().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  },

  get(id: string): StoredPresentation | null {
    return getAll().find((p) => p.id === id) ?? null;
  },

  create(data: Omit<StoredPresentation, "id" | "createdAt" | "updatedAt" | "isPublic">): StoredPresentation {
    const now = new Date().toISOString();
    const presentation: StoredPresentation = {
      ...data,
      id: `pres-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };
    const all = getAll();
    all.push(presentation);
    saveAll(all);
    return presentation;
  },

  update(id: string, data: Partial<Omit<StoredPresentation, "id" | "createdAt">>): boolean {
    const all = getAll();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    const existing = all[idx]!;
    all[idx] = { ...existing, ...data, id: existing.id, createdAt: existing.createdAt, updatedAt: new Date().toISOString() };
    saveAll(all);
    return true;
  },

  delete(id: string): boolean {
    const all = getAll();
    const filtered = all.filter((p) => p.id !== id);
    if (filtered.length === all.length) return false;
    saveAll(filtered);
    return true;
  },

  togglePublic(id: string): boolean {
    const all = getAll();
    const pres = all.find((p) => p.id === id);
    if (!pres) return false;
    pres.isPublic = !pres.isPublic;
    pres.updatedAt = new Date().toISOString();
    saveAll(all);
    return true;
  },
};

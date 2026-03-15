"use server";
import "server-only";

export type PresentationDocument = {
  id: string;
  title: string;
  updatedAt: Date;
  thumbnailUrl?: string | null;
};

export async function fetchPresentations(_page = 0) {
  return {
    items: [] as PresentationDocument[],
    hasMore: false,
  };
}

export async function fetchPublicPresentations(_page = 0) {
  return {
    items: [] as PresentationDocument[],
    hasMore: false,
  };
}

export async function fetchUserPresentations(_userId: string, _page = 0) {
  return {
    items: [] as PresentationDocument[],
    hasMore: false,
  };
}

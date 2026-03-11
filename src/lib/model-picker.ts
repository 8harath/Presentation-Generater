import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { type LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

/**
 * Centralized model picker function for all presentation generation routes
 * Supports Gemini (default), OpenAI, Ollama, and LM Studio models
 */
export function modelPicker(
  modelProvider: string,
  modelId?: string,
): LanguageModelV1 {
  if (modelProvider === "ollama" && modelId) {
    // Use Ollama AI provider
    const ollama = createOllama();
    return ollama(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "lmstudio" && modelId) {
    // Use LM Studio with OpenAI compatible provider
    const lmstudio = createOpenAI({
      name: "lmstudio",
      baseURL: "http://localhost:1234/v1",
      apiKey: "lmstudio",
    });
    return lmstudio(modelId) as unknown as LanguageModelV1;
  }

  if (modelProvider === "openai") {
    // Use OpenAI if explicitly selected
    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY ?? "",
    });
    return openai(modelId ?? "gpt-4o-mini") as unknown as LanguageModelV1;
  }

  // Default: Gemini (gemini or any other/unrecognized provider)
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY ?? "",
  });
  return google(modelId ?? "gemini-2.0-flash") as unknown as LanguageModelV1;
}

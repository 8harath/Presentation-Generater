import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import { DEFAULT_MODEL } from "./ai-constants";

export { DEFAULT_MODEL };

const groq = createOpenAI({
  name: "groq",
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export function modelPicker(modelId?: string) {
  return groq(modelId ?? DEFAULT_MODEL);
}

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 15_000;

interface GenerateImageParams {
  prompt: string;
  referenceImageUrls: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractRetryDelay(error: unknown): number | null {
  const msg = error instanceof Error ? error.message : String(error);
  const match = msg.match(/retry in (\d+(?:\.\d+)?)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) : null;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch reference image: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return { data: base64, mimeType: contentType };
}

export async function generateImage({ prompt, referenceImageUrls }: GenerateImageParams): Promise<Buffer> {
  const parts: any[] = [{ text: prompt }];

  for (const url of referenceImageUrls) {
    const { data, mimeType } = await fetchImageAsBase64(url);
    parts.push({
      inlineData: { data, mimeType },
    });
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: parts,
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error("Gemini returned no candidates");
      }

      for (const part of candidates[0].content!.parts!) {
        if (part.inlineData) {
          return Buffer.from(part.inlineData.data!, "base64");
        }
      }

      throw new Error("Gemini response contained no image data");
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || "");
      const isRateLimit = err?.status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
      const isZeroQuota = msg.includes("limit: 0") || msg.includes("quota limit: 0") || msg.includes("quota, please check your plan");

      // Don't retry if limit is 0 (Free Tier does not permit image generation) or max retries reached
      if (!isRateLimit || isZeroQuota || attempt === MAX_RETRIES) {
        throw err;
      }

      const retryDelay = extractRetryDelay(err) || BASE_RETRY_DELAY_MS * (attempt + 1);
      console.log(`Rate limited (attempt ${attempt + 1}/${MAX_RETRIES}), retrying in ${Math.round(retryDelay / 1000)}s...`);
      await sleep(retryDelay);
    }

  }

  throw lastError;
}

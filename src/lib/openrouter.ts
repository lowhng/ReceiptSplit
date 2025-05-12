/**
 * OpenRouter API client for OCR and text extraction
 */

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
}

export interface OpenRouterModel {
  id: string;
  name: string;
  isPremium: boolean;
}

export const openRouterModels: OpenRouterModel[] = [
  {
    id: "meta-llama/llama-4-maverick:free",
    name: "Llama 4 Maverick (Free)",
    isPremium: false,
  },
  {
    id: "meta-llama/llama-4-scout:free",
    name: "Llama 4 Scout (Free)",
    isPremium: false,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    isPremium: false,
  },
  {
    id: "google/gemini-2.5-flash-preview",
    name: "Gemini 2.5 Flash (Premium)",
    isPremium: true,
  },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (Premium)", isPremium: true },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash 001 (Premium)",
    isPremium: true,
  },
];

export interface ExtractedItem {
  name: string;
  price: number;
}

export async function extractItemsFromReceipt(
  imageBase64: string,
  modelId: string = "meta-llama/llama-4-maverick:free",
): Promise<ExtractedItem[]> {
  try {
    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
          "HTTP-Referer":
            typeof window !== "undefined"
              ? window.location.origin
              : "https://receipt-splitter.vercel.app",
          "X-Title": "Receipt Splitter App",
        },
        cache: "no-store",
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: 'Extract all items and their prices from this receipt image. Return ONLY a JSON array with objects that have "name" and "price" properties. The price should be a number, not a string. If there is a discount applied, use the discounted price. Do not include tax as an item. Do not include any explanations or other text.',
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    // Parse the response content as JSON
    try {
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);

      // Check if the response has the expected format (array of items)
      if (Array.isArray(parsedContent.items)) {
        return parsedContent.items;
      } else if (Array.isArray(parsedContent)) {
        return parsedContent;
      } else if (typeof parsedContent === "object" && parsedContent !== null) {
        // Handle case where the response might be a single object instead of an array
        return [parsedContent];
      } else {
        console.error("Unexpected response format:", parsedContent);
        return [];
      }
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error extracting items from receipt:", error);
    return [];
  }
}

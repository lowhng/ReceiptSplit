import { NextRequest, NextResponse } from "next/server";
import { extractItemsFromReceipt } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { imageData, modelId } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "Missing image data" },
        { status: 400 },
      );
    }

    const items = await extractItemsFromReceipt(imageData, modelId);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process receipt" },
      { status: 500 },
    );
  }
}

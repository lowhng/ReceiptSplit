import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const PICA_SECRET_KEY = process.env.PICA_SECRET_KEY;
    const PICA_SUPABASE_CONNECTION_KEY =
      process.env.PICA_SUPABASE_CONNECTION_KEY;
    const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";
    const PROJECT_REF = process.env.SUPABASE_PROJECT_ID;

    if (!PICA_SECRET_KEY || !PICA_SUPABASE_CONNECTION_KEY || !PROJECT_REF) {
      return NextResponse.json(
        { error: "Missing required environment variables" },
        { status: 500 },
      );
    }

    // SQL query to get receipts and their items
    const query = `
      WITH user_receipts AS (
        SELECT * FROM receipts WHERE user_id = '${userId}'
      ),
      receipt_items AS (
        SELECT ri.* FROM receipt_items ri
        JOIN user_receipts ur ON ri.receipt_id = ur.id
      )
      SELECT
        ur.*,
        COALESCE(json_agg(ri.*) FILTER (WHERE ri.id IS NOT NULL), '[]'::json) AS items
      FROM user_receipts ur
      LEFT JOIN receipt_items ri ON ri.receipt_id = ur.id
      GROUP BY ur.id;
    `;

    const response = await fetch(
      `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY,
          "x-pica-action-id": ACTION_ID,
        },
        body: JSON.stringify({ query }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to load receipts: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform the data to match the SavedReceipt format expected by the frontend
    const formattedReceipts = data.map((receipt: any) => {
      // Format items to match the expected structure
      const formattedItems = receipt.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        assignedTo: item.assigned_to,
        splitPercentage: item.split_percentage,
      }));

      return {
        id: receipt.id,
        name: receipt.name,
        date: receipt.date,
        receiptImage: receipt.receipt_image,
        items: formattedItems,
        friendCount: receipt.friend_count,
        friendInitials: receipt.friend_initials,
        currency: receipt.currency,
        currencySymbol: receipt.currency_symbol,
      };
    });

    console.log(
      `✅ API: Returning ${formattedReceipts.length} formatted receipts`,
    );
    return NextResponse.json(formattedReceipts);
  } catch (error) {
    console.error("Error loading receipts:", error);
    return NextResponse.json(
      { error: "Failed to load receipts" },
      { status: 500 },
    );
  }
}

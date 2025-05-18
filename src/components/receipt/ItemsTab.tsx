"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ItemList from "@/components/receipt/ItemList";
import { ReceiptItem } from "@/hooks/useReceiptState";

interface ItemsTabProps {
  receiptImage: string | null;
  items: ReceiptItem[];
  friendCount: number;
  friendInitials: string[];
  currencySymbol: string;
  onItemAssign: (
    itemId: string,
    assignedTo:
      | "mine"
      | "friend1"
      | "friend2"
      | "friend3"
      | "friend4"
      | "shared"
      | null,
  ) => void;
  onSplitPercentageChange: (
    itemId: string,
    percentages: Record<string, number>,
  ) => void;
  onGoToSummary: () => void;
}

export default function ItemsTab({
  receiptImage,
  items,
  friendCount,
  friendInitials,
  currencySymbol,
  onItemAssign,
  onSplitPercentageChange,
  onGoToSummary,
}: ItemsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Items</CardTitle>
        <CardDescription>
          Tap on items to assign them to you, your friend, or mark as shared
        </CardDescription>
      </CardHeader>
      <CardContent>
        {receiptImage ? (
          <ItemList
            receiptImage={receiptImage}
            items={items}
            friendCount={friendCount}
            friendInitials={friendInitials}
            currencySymbol={currencySymbol}
            onItemAssign={onItemAssign}
            onSplitPercentageChange={onSplitPercentageChange}
            onGoToSummary={onGoToSummary}
          />
        ) : (
          <div className="text-center py-8">
            <p>Please capture a receipt first</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

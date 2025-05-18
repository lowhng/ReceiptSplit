"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Download, Image, Save, FolderOpen } from "lucide-react";
import SplitSummary from "@/components/receipt/SplitSummary";
import { useToast } from "@/components/ui/use-toast";
import { ReceiptItem } from "@/hooks/useReceiptState";

interface SummaryTabProps {
  myItems: ReceiptItem[];
  friendItems: Array<ReceiptItem[]>;
  sharedItems: any[];
  friendCount: number;
  friendInitials: string[];
  currencySymbol: string;
  taxAmount: number;
  setTaxAmount: (value: number) => void;
  tipAmount: number;
  setTipAmount: (value: number) => void;
  includeTax: boolean;
  setIncludeTax: (value: boolean) => void;
  includeTip: boolean;
  setIncludeTip: (value: boolean) => void;
  tipPercentage: number;
  setTipPercentage: (value: number) => void;
  onSaveReceiptClick: () => void;
  onLoadReceiptClick: () => void;
}

export default function SummaryTab({
  myItems,
  friendItems,
  sharedItems,
  friendCount,
  friendInitials,
  currencySymbol,
  taxAmount,
  setTaxAmount,
  tipAmount,
  setTipAmount,
  includeTax,
  setIncludeTax,
  includeTip,
  setIncludeTip,
  tipPercentage,
  setTipPercentage,
  onSaveReceiptClick,
  onLoadReceiptClick,
}: SummaryTabProps) {
  const { toast } = useToast();

  const handleShareClick = () => {
    if (navigator.share) {
      const myTotal =
        myItems.reduce((sum, item) => sum + item.price, 0) +
        sharedItems.reduce((sum, item) => sum + item.mine, 0);

      // Calculate each friend's total
      const friendSubtotals = friendItems.map((items, index) => {
        const friendId = `friend${index + 1}`;
        return {
          id: friendId,
          subtotal:
            items.reduce((sum, item) => sum + item.price, 0) +
            sharedItems.reduce(
              (sum, item) =>
                sum + Number(item[friendId as keyof typeof item] ?? 0),
              0,
            ),
        };
      });

      // Format the text for sharing
      let shareText = `My total: ${myTotal.toFixed(2)}\n`;
      friendSubtotals.forEach((friend, index) => {
        shareText += `Friend ${index + 1}'s total: ${friend.subtotal.toFixed(
          2,
        )}\n`;
      });

      navigator
        .share({
          title: "Receipt Split Summary",
          text: shareText,
        })
        .catch((err) => {
          toast({
            title: "Sharing failed",
            description: "Could not share the summary",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support the Web Share API",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const myTotal =
      myItems.reduce((sum, item) => sum + item.price, 0) +
      sharedItems.reduce((sum, item) => sum + item.mine, 0);

    // Calculate each friend's total
    const friendSubtotals = friendItems.map((items, index) => {
      const friendId = `friend${index + 1}`;
      return {
        id: friendId,
        subtotal:
          items.reduce((sum, item) => sum + item.price, 0) +
          sharedItems.reduce(
            (sum, item) =>
              sum + Number(item[friendId as keyof typeof item] ?? 0),
            0,
          ),
      };
    });

    // Create CSV content with proper escaping for special characters
    const allItems = [...myItems, ...friendItems.flat(), ...sharedItems];
    const itemRows = allItems
      .map((item) => {
        const assignedTo = item.assignedTo;
        let displayValue: string = assignedTo || "";

        if (assignedTo === "shared") {
          let shareText = "Shared (You: ";
          shareText += `${(
            item.splitPercentage?.mine || Math.round(100 / (friendCount + 1))
          ).toFixed(1)}%`;

          for (let i = 1; i <= friendCount; i++) {
            const friendId = `friend${i}`;
            shareText += `, F${i}: ${(
              item.splitPercentage?.[friendId] ||
              Math.round(100 / (friendCount + 1))
            ).toFixed(1)}%`;
          }

          shareText += ")";
          displayValue = shareText;
        }

        // Escape quotes in item names
        const escapedName = item.name.replace(/"/g, '""');
        return `"${escapedName}",${item.price},"${displayValue || "Unassigned"}"`;
      })
      .join("\n");

    // Build the summary section
    let summaryRows = `Summary:\nYour Total,${myTotal.toFixed(2)}\n`;
    friendSubtotals.forEach((friend, index) => {
      summaryRows += `Friend ${index + 1}'s Total,${friend.subtotal.toFixed(
        2,
      )}\n`;
    });

    const csvContent = `Item,Price,Assigned To\n${itemRows}\n\n${summaryRows}`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "receipt-split.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "Receipt split data exported as CSV",
    });
  };

  const handleExportImage = () => {
    const summaryElement = document.getElementById("split-summary");
    if (summaryElement) {
      toast({
        title: "Generating image",
        description: "Creating your receipt image...",
      });

      // Import html-to-image only when needed
      import("html-to-image")
        .then((htmlToImage) =>
          htmlToImage.toPng(summaryElement, {
            quality: 0.95,
            backgroundColor: "#ffffff",
          }),
        )
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = "receipt-split.png";
          link.href = dataUrl;
          link.click();

          toast({
            title: "Export successful",
            description: "Receipt split image downloaded",
          });
        })
        .catch((error) => {
          console.error("Error generating image:", error);
          toast({
            title: "Export failed",
            description: "Could not generate image",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "Export failed",
        description: "Could not find summary element",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Split Summary</CardTitle>
        <CardDescription>
          Review the final split with tax and tip adjustments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div id="split-summary">
            <SplitSummary
              myItems={myItems}
              friendItems={friendItems}
              sharedItems={sharedItems}
              friendCount={friendCount}
              friendInitials={friendInitials}
              currencySymbol={currencySymbol}
              taxAmount={taxAmount}
              setTaxAmount={setTaxAmount}
              tipAmount={tipAmount}
              setTipAmount={setTipAmount}
              includeTax={includeTax}
              setIncludeTax={setIncludeTax}
              includeTip={includeTip}
              setIncludeTip={setIncludeTip}
              tipPercentage={tipPercentage}
              setTipPercentage={setTipPercentage}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-4 pt-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              onClick={handleShareClick}
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" /> Share
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              onClick={onSaveReceiptClick}
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4" /> Save Receipt
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              onClick={onLoadReceiptClick}
            >
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Load Receipt
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              onClick={handleExportCSV}
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" /> Export CSV
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              onClick={handleExportImage}
            >
              <Image className="h-3 w-3 sm:h-4 sm:w-4" /> Export Image
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReceiptCapture from "@/components/receipt/ReceiptCapture";
import ItemList from "@/components/receipt/ItemList";
import SplitSummary from "@/components/receipt/SplitSummary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExtractedItem,
  openRouterModels,
  OpenRouterModel,
} from "@/lib/openrouter";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Share2, Download, Image } from "lucide-react";
import dynamic from "next/dynamic";

import { useRef } from "react";

// We'll use direct import for html-to-image and handle it client-side only
// No need for dynamic import as we're using it only in client-side event handlers

export default function Home() {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("capture");
  const [selectedModel, setSelectedModel] = useState<string>(
    "meta-llama/llama-4-maverick:free",
  );
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  const [items, setItems] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      assignedTo: "mine" | "friend" | "shared" | null;
      splitPercentage?: { mine: number; friend: number };
    }>
  >([]);
  const { toast } = useToast();

  const handleReceiptCaptured = async (imageData: string) => {
    setReceiptImage(imageData);
    setIsProcessing(true);

    try {
      // Call OpenRouter API through our API route with absolute URL
      const response = await fetch(`${window.location.origin}/api/openrouter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData, modelId: selectedModel }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const extractedItems = data.items;

      if (extractedItems && extractedItems.length > 0) {
        // Transform extracted items to the format expected by ItemList
        const formattedItems = extractedItems.map(
          (item: ExtractedItem, index: number) => ({
            id: `item-${index}`,
            name: item.name,
            price: item.price,
            assignedTo: null,
          }),
        );

        setItems(formattedItems);
        toast({
          title: "Receipt processed",
          description: `Found ${formattedItems.length} items on your receipt`,
        });
      } else {
        // If no items were extracted, show a message
        toast({
          title: "Processing issue",
          description: "Couldn't extract any items from the receipt.",
          variant: "destructive",
        });

        // Initialize with empty array
        setItems([]);
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast({
        title: "Error",
        description: "Failed to process receipt. Please try again.",
        variant: "destructive",
      });

      // Initialize with empty array
      setItems([]);
    } finally {
      setIsProcessing(false);
      setActiveTab("items");
    }
  };

  const handleItemAssign = (
    itemId: string,
    assignedTo: "mine" | "friend" | "shared" | null,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, assignedTo } : item,
      ),
    );
  };

  const handleSplitPercentageChange = (
    itemId: string,
    percentages: { mine: number; friend: number },
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, splitPercentage: percentages } : item,
      ),
    );
  };

  // Prepare data for SplitSummary
  const myItems = items.filter((item) => item.assignedTo === "mine");
  const friendItems = items.filter((item) => item.assignedTo === "friend");
  const sharedItems = items
    .filter((item) => item.assignedTo === "shared")
    .map((item) => ({
      name: item.name,
      price: item.price,
      myShare: item.splitPercentage
        ? (item.price * item.splitPercentage.mine) / 100
        : item.price / 2,
      friendShare: item.splitPercentage
        ? (item.price * item.splitPercentage.friend) / 100
        : item.price / 2,
    }));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-3 sm:p-4 md:p-8">
      <header className="w-full max-w-4xl mb-4 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
          Receipt Splitter
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Scan receipts and split bills with friends easily
        </p>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-4 sm:gap-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 sm:mb-6 w-full">
            <TabsTrigger
              value="capture"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              Capture Receipt
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              Assign Items
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="text-xs sm:text-sm px-1 sm:px-3"
            >
              Split Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Capture Receipt</CardTitle>
                <CardDescription>
                  Take a photo of your receipt or upload one from your gallery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="premium"
                        checked={isPremiumEnabled}
                        onCheckedChange={(checked) =>
                          setIsPremiumEnabled(checked === true)
                        }
                      />
                      <Label htmlFor="premium" className="text-xs sm:text-sm">
                        Enable Premium Models
                      </Label>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label
                        htmlFor="model-select"
                        className="text-xs sm:text-sm"
                      >
                        Select Model
                      </Label>
                      <Select
                        value={selectedModel}
                        onValueChange={setSelectedModel}
                      >
                        <SelectTrigger
                          id="model-select"
                          className="w-full text-xs sm:text-sm h-8 sm:h-10"
                        >
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {openRouterModels
                            .filter(
                              (model) => !model.isPremium || isPremiumEnabled,
                            )
                            .map((model) => (
                              <SelectItem
                                key={model.id}
                                value={model.id}
                                className="text-xs sm:text-sm"
                              >
                                {model.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <ReceiptCapture
                    onReceiptCaptured={handleReceiptCaptured}
                    isProcessing={isProcessing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Items</CardTitle>
                <CardDescription>
                  Tap on items to assign them to you, your friend, or mark as
                  shared
                </CardDescription>
              </CardHeader>
              <CardContent>
                {receiptImage ? (
                  <ItemList
                    receiptImage={receiptImage}
                    items={items}
                    onItemAssign={handleItemAssign}
                    onSplitPercentageChange={handleSplitPercentageChange}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p>Please capture a receipt first</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
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
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-2 sm:space-x-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      onClick={() => {
                        if (navigator.share) {
                          const myTotal =
                            myItems.reduce((sum, item) => sum + item.price, 0) +
                            sharedItems.reduce(
                              (sum, item) => sum + item.myShare,
                              0,
                            );
                          const friendTotal =
                            friendItems.reduce(
                              (sum, item) => sum + item.price,
                              0,
                            ) +
                            sharedItems.reduce(
                              (sum, item) => sum + item.friendShare,
                              0,
                            );

                          navigator
                            .share({
                              title: "Receipt Split Summary",
                              text: `My total: ${myTotal.toFixed(2)}\nFriend's total: ${friendTotal.toFixed(2)}`,
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
                            description:
                              "Your browser doesn't support the Web Share API",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" /> Share
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      onClick={() => {
                        const myTotal =
                          myItems.reduce((sum, item) => sum + item.price, 0) +
                          sharedItems.reduce(
                            (sum, item) => sum + item.myShare,
                            0,
                          );
                        const friendTotal =
                          friendItems.reduce(
                            (sum, item) => sum + item.price,
                            0,
                          ) +
                          sharedItems.reduce(
                            (sum, item) => sum + item.friendShare,
                            0,
                          );

                        // Create CSV content with proper escaping for special characters
                        const itemRows = items
                          .map((item) => {
                            const assignedTo = item.assignedTo;
                            const displayValue =
                              assignedTo === "shared"
                                ? `Shared (You: ${item.splitPercentage?.mine || 50}%, Friend: ${item.splitPercentage?.friend || 50}%)`
                                : assignedTo;
                            // Escape quotes in item names
                            const escapedName = item.name.replace(/"/g, '""');
                            return `"${escapedName}",${item.price},"${displayValue || "Unassigned"}"`;
                          })
                          .join("\n");

                        const csvContent = `Item,Price,Assigned To\n${itemRows}\n\nSummary:\nYour Total,${myTotal.toFixed(2)}\nFriend's Total,${friendTotal.toFixed(2)}`;

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
                      }}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" /> Export CSV
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      onClick={() => {
                        const summaryElement =
                          document.getElementById("split-summary");
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
                      }}
                    >
                      <Image className="h-3 w-3 sm:h-4 sm:w-4" /> Export Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
          <p>Receipt Splitter App &copy; {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}

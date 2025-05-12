"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
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
import { ExtractedItem, openRouterModels } from "@/lib/openrouter";
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
import {
  Share2,
  Download,
  Image,
  Save,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// We'll use direct import for html-to-image and handle it client-side only
// No need for dynamic import as we're using it only in client-side event handlers

interface SavedReceipt {
  id: string;
  name: string;
  date: string;
  receiptImage: string | null;
  items: Array<{
    id: string;
    name: string;
    price: number;
    assignedTo:
      | "mine"
      | "friend1"
      | "friend2"
      | "friend3"
      | "friend4"
      | "shared"
      | null;
    splitPercentage?: Record<string, number>;
  }>;
  friendCount: number;
  friendInitials: string[];
  currency: string;
  currencySymbol: string;
}

export default function Home() {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("capture");
  // Model is automatically selected based on premium status
  const [isPremiumEnabled, setIsPremiumEnabled] = useState(false);
  const [friendCount, setFriendCount] = useState<number>(1);
  const [friendInitials, setFriendInitials] = useState<string[]>([
    "F1",
    "F2",
    "F3",
    "F4",
  ]);
  const [currency, setCurrency] = useState<string>("USD");
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [items, setItems] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      assignedTo:
        | "mine"
        | "friend1"
        | "friend2"
        | "friend3"
        | "friend4"
        | "shared"
        | null;
      splitPercentage?: Record<string, number>;
    }>
  >([]);
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const { toast } = useToast();

  // Detect user's location and set default currency
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.currency) {
          setCurrency(data.currency);
          // Set currency symbol based on currency code
          const symbols: Record<string, string> = {
            USD: "$",
            EUR: "€",
            GBP: "£",
            JPY: "¥",
            NZD: "$",
            AUD: "$",
            CAD: "$",
            CHF: "CHF",
            CNY: "¥",
            INR: "₹",
          };
          setCurrencySymbol(symbols[data.currency] || "$");
        }
      } catch (error) {
        console.error("Error detecting user currency:", error);
        // Default to USD if detection fails
        setCurrency("USD");
        setCurrencySymbol("$");
      }
    };

    detectUserCurrency();
    loadSavedReceipts();
  }, []);

  // Load saved receipts from local storage
  const loadSavedReceipts = () => {
    if (typeof window !== "undefined") {
      const savedReceiptsData = localStorage.getItem("resplit-saved-receipts");
      if (savedReceiptsData) {
        try {
          const parsedData = JSON.parse(savedReceiptsData);
          setSavedReceipts(parsedData);
        } catch (error) {
          console.error("Error parsing saved receipts:", error);
          setSavedReceipts([]);
        }
      }
    }
  };

  // Save current receipt to local storage
  const saveCurrentReceipt = () => {
    if (!items.length) {
      toast({
        title: "Nothing to save",
        description: "Please scan a receipt first",
        variant: "destructive",
      });
      return;
    }

    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    if (!receiptName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this receipt",
        variant: "destructive",
      });
      return;
    }

    const newReceipt: SavedReceipt = {
      id: `receipt-${Date.now()}`,
      name: receiptName,
      date: new Date().toISOString(),
      receiptImage,
      items,
      friendCount,
      friendInitials,
      currency,
      currencySymbol,
    };

    const updatedReceipts = [...savedReceipts, newReceipt];
    setSavedReceipts(updatedReceipts);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "resplit-saved-receipts",
        JSON.stringify(updatedReceipts),
      );
    }

    toast({
      title: "Receipt saved",
      description: `"${receiptName}" has been saved to your device`,
    });

    setSaveDialogOpen(false);
    setReceiptName("");
  };

  // Load a saved receipt
  const loadReceipt = (receipt: SavedReceipt) => {
    setReceiptImage(receipt.receiptImage);
    setItems(receipt.items);
    setFriendCount(receipt.friendCount);
    setFriendInitials(receipt.friendInitials);
    setCurrency(receipt.currency);
    setCurrencySymbol(receipt.currencySymbol);

    setLoadDialogOpen(false);
    setActiveTab("items");

    toast({
      title: "Receipt loaded",
      description: `"${receipt.name}" has been loaded`,
    });
  };

  // Delete a saved receipt
  const deleteReceipt = (id: string) => {
    const updatedReceipts = savedReceipts.filter(
      (receipt) => receipt.id !== id,
    );
    setSavedReceipts(updatedReceipts);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "resplit-saved-receipts",
        JSON.stringify(updatedReceipts),
      );
    }

    toast({
      title: "Receipt deleted",
      description: "The receipt has been removed from your device",
    });
  };

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
        body: JSON.stringify({
          imageData,
          modelId: isPremiumEnabled
            ? "google/gemini-2.5-flash-preview"
            : "meta-llama/llama-4-maverick:free",
        }),
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
    assignedTo:
      | "mine"
      | "friend1"
      | "friend2"
      | "friend3"
      | "friend4"
      | "shared"
      | null,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          // If item is marked as shared, create equal split percentages
          if (assignedTo === "shared") {
            const equalShare = 100 / (friendCount + 1);
            const percentages: Record<string, number> = { mine: equalShare };
            for (let i = 1; i <= friendCount; i++) {
              percentages[`friend${i}`] = equalShare;
            }
            return { ...item, assignedTo, splitPercentage: percentages };
          }
          return { ...item, assignedTo };
        }
        return item;
      }),
    );
  };

  const handleSplitPercentageChange = (
    itemId: string,
    percentages: Record<string, number>,
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, splitPercentage: percentages } : item,
      ),
    );
  };

  // Prepare data for SplitSummary
  const myItems = items.filter((item) => item.assignedTo === "mine");

  // Create an array of friend items for each friend
  const friendItems = Array.from({ length: friendCount }, (_, i) => {
    const friendId = `friend${i + 1}`;
    return items.filter((item) => item.assignedTo === friendId);
  });

  const sharedItems = items
    .filter((item) => item.assignedTo === "shared")
    .map((item) => {
      const shares: Record<string, number> = {
        // Initialize with required properties to satisfy TypeScript
        mine: 0,
        friend1: 0,
      };

      if (item.splitPercentage) {
        // Use the defined split percentages
        shares.mine = (item.price * (item.splitPercentage.mine || 0)) / 100;

        // Add each friend's share
        for (let i = 1; i <= friendCount; i++) {
          const friendId = `friend${i}`;
          shares[friendId] =
            (item.price * (item.splitPercentage[friendId] || 0)) / 100;
        }
      } else {
        // Equal split if no percentages defined
        const equalShare = item.price / (friendCount + 1);
        shares.mine = equalShare;

        for (let i = 1; i <= friendCount; i++) {
          shares[`friend${i}`] = equalShare;
        }
      }

      // Always ensure friend1 exists with a value, even if friendCount is 0
      if (!shares.friend1) {
        shares.friend1 = 0;
      }

      return {
        name: item.name,
        price: item.price,
        mine: shares.mine,
        friend1: shares.friend1, // Explicitly include friend1 to satisfy TypeScript
        ...shares,
      };
    });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center sm:p-4 md:p-8 py-9 w-full">
      <header className="w-full max-w-5xl mb-4 sm:mb-8 text-center mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2">
          ReSplit
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Scan receipts and split bills with friends easily
        </p>
      </header>
      <main className="w-full max-w-5xl flex flex-col gap-4 sm:gap-8 mx-auto">
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-x-3 gap-y-2">
                    <div className="flex items-center gap-x-px sm:mt-0 sm:mb-0 mb-2">
                      <Checkbox
                        id="premium"
                        checked={isPremiumEnabled}
                        onCheckedChange={(checked) =>
                          setIsPremiumEnabled(checked === true)
                        }
                      />
                      <Label
                        htmlFor="premium"
                        className="text-xs sm:text-sm ml-2"
                      >
                        Enable Premium Models
                      </Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto gap-x-1.5 py-1 sm:ml-auto"
                      onClick={() => setLoadDialogOpen(true)}
                    >
                      <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Load
                      Receipt
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                      <Label
                        htmlFor="friend-count"
                        className="text-xs sm:text-sm"
                      >
                        How many friends are you splitting with?
                      </Label>
                      <Select
                        value={friendCount.toString()}
                        onValueChange={(value) => {
                          const count = parseInt(value);
                          setFriendCount(count);
                        }}
                      >
                        <SelectTrigger
                          id="friend-count"
                          className="w-full text-xs sm:text-sm h-9"
                        >
                          <SelectValue placeholder="Select number of friends" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 friend</SelectItem>
                          <SelectItem value="2">2 friends</SelectItem>
                          <SelectItem value="3">3 friends</SelectItem>
                          <SelectItem value="4">4 friends</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {friendCount > 1 && (
                      <div className="space-y-2 mt-3">
                        <Label className="text-xs sm:text-sm">
                          Enter your friends' initials (max 5 chars)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.from({ length: friendCount }).map((_, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <Label
                                  htmlFor={`friend-${i + 1}`}
                                  className="text-xs"
                                >
                                  Friend {i + 1}
                                </Label>
                              </div>
                              <Input
                                id={`friend-${i + 1}`}
                                value={friendInitials[i]}
                                onChange={(e) => {
                                  const newInitials = [...friendInitials];
                                  newInitials[i] = e.target.value.slice(0, 5);
                                  setFriendInitials(newInitials);
                                }}
                                placeholder={`F${i + 1}`}
                                className="text-xs h-9"
                                inputMode="text"
                                style={{ fontSize: "16px" }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <ReceiptCapture
                      onReceiptCaptured={handleReceiptCaptured}
                      isProcessing={isProcessing}
                    />
                  </div>
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
                    friendCount={friendCount}
                    friendInitials={friendInitials}
                    currencySymbol={currencySymbol}
                    onItemAssign={handleItemAssign}
                    onSplitPercentageChange={handleSplitPercentageChange}
                    onGoToSummary={() => setActiveTab("summary")}
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
                      friendCount={friendCount}
                      friendInitials={friendInitials}
                      currencySymbol={currencySymbol}
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
                              (sum, item) => sum + item.mine,
                              0,
                            );

                          // Calculate each friend's total
                          const friendSubtotals = friendItems.map(
                            (items, index) => {
                              const friendId = `friend${index + 1}`;
                              return {
                                id: friendId,
                                subtotal:
                                  items.reduce(
                                    (sum, item) => sum + item.price,
                                    0,
                                  ) +
                                  sharedItems.reduce(
                                    (sum, item) =>
                                      sum +
                                      Number(
                                        item[friendId as keyof typeof item] ??
                                          0,
                                      ),
                                    0,
                                  ),
                              };
                            },
                          );

                          // Format the text for sharing
                          let shareText = `My total: ${myTotal.toFixed(2)}\n`;
                          friendSubtotals.forEach((friend, index) => {
                            shareText += `Friend ${index + 1}'s total: ${friend.subtotal.toFixed(2)}\n`;
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
                      onClick={saveCurrentReceipt}
                    >
                      <Save className="h-3 w-3 sm:h-4 sm:w-4" /> Save Receipt
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      onClick={() => setLoadDialogOpen(true)}
                    >
                      <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Load
                      Receipt
                    </Button>

                    <Button
                      variant="outline"
                      className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                      onClick={() => {
                        const myTotal =
                          myItems.reduce((sum, item) => sum + item.price, 0) +
                          sharedItems.reduce((sum, item) => sum + item.mine, 0);

                        // Calculate each friend's total
                        const friendSubtotals = friendItems.map(
                          (items, index) => {
                            const friendId = `friend${index + 1}`;
                            return {
                              id: friendId,
                              subtotal:
                                items.reduce(
                                  (sum, item) => sum + item.price,
                                  0,
                                ) +
                                sharedItems.reduce(
                                  (sum, item) =>
                                    sum +
                                    Number(
                                      item[friendId as keyof typeof item] ?? 0,
                                    ),
                                  0,
                                ),
                            };
                          },
                        );

                        // Create CSV content with proper escaping for special characters
                        const itemRows = items
                          .map((item) => {
                            const assignedTo = item.assignedTo;
                            let displayValue: string = assignedTo || "";

                            if (assignedTo === "shared") {
                              let shareText = "Shared (You: ";
                              shareText += `${item.splitPercentage?.mine || Math.round(100 / (friendCount + 1))}%`;

                              for (let i = 1; i <= friendCount; i++) {
                                const friendId = `friend${i}`;
                                shareText += `, F${i}: ${item.splitPercentage?.[friendId] || Math.round(100 / (friendCount + 1))}%`;
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
                          summaryRows += `Friend ${index + 1}'s Total,${friend.subtotal.toFixed(2)}\n`;
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
          <div className="flex justify-center items-center mb-2">
            <Select
              value={currency}
              onValueChange={(value) => {
                setCurrency(value);
                // Set currency symbol based on currency code
                const symbols: Record<string, string> = {
                  USD: "$",
                  EUR: "€",
                  GBP: "£",
                  JPY: "¥",
                  NZD: "$",
                  AUD: "$",
                  CAD: "$",
                  CHF: "CHF",
                  CNY: "¥",
                  INR: "₹",
                  SGD: "$",
                  MYR: "RM",
                };
                setCurrencySymbol(symbols[value] || "$");
              }}
            >
              <SelectTrigger className="w-24 h-7 text-xs">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
                <SelectItem value="NZD">NZD ($)</SelectItem>
                <SelectItem value="AUD">AUD ($)</SelectItem>
                <SelectItem value="CAD">CAD ($)</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
                <SelectItem value="CNY">CNY (¥)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="SGD">SGD ($)</SelectItem>
                <SelectItem value="MYR">MYR (RM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p>ReSplit App &copy; {new Date().getFullYear()}</p>
          <p>Another product made with 💖 by Wei Hong</p>
        </div>
      </main>
      {/* Save Receipt Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Save Receipt</DialogTitle>
            <DialogDescription>
              Enter a name to save this receipt for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="receipt-name" className="text-sm mb-2 block">
              Receipt Name
            </Label>
            <Input
              id="receipt-name"
              value={receiptName}
              onChange={(e) => setReceiptName(e.target.value)}
              placeholder="e.g., Dinner with friends"
              className="w-full"
              style={{ fontSize: "16px" }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Load Receipt Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Saved Receipts</DialogTitle>
            <DialogDescription>Select a receipt to load</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {savedReceipts.length > 0 ? (
              <div className="space-y-3">
                {savedReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="p-3 border rounded-md flex justify-between items-center hover:bg-accent cursor-pointer"
                    onClick={() => loadReceipt(receipt)}
                  >
                    <div>
                      <h3 className="font-medium">{receipt.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(receipt.date).toLocaleDateString()} •{" "}
                        {receipt.items.length} items
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReceipt(receipt.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No saved receipts found
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ExtractedItem } from "@/lib/openrouter";

export interface SavedReceipt {
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

export interface ReceiptItem {
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
}

export function useReceiptState() {
  const [user, setUser] = useState<any>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("capture");
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
  const [taxAmount, setTaxAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [includeTax, setIncludeTax] = useState(false);
  const [includeTip, setIncludeTip] = useState(false);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [saveLocationDialogOpen, setSaveLocationDialogOpen] = useState(false);
  const [saveToSupabase, setSaveToSupabase] = useState(false);
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

    // Fetch current user
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
        // Load saved receipts after user is fetched, only if user id exists
        if (data?.user?.id) {
          await loadCloudReceipts(data.user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
        // Still load local receipts if user fetch fails
        loadSavedReceipts();
      }
    };

    fetchUser();
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

  // Load saved receipts from Cloud Storage
  const loadCloudReceipts = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data: receipts, error } = await supabase
        .from("receipts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      // Load receipt items for each
      const fullReceipts: SavedReceipt[] = await Promise.all(
        receipts.map(async (receipt: any) => {
          const { data: items } = await supabase
            .from("receipt_items")
            .select("*")
            .eq("receipt_id", receipt.id);

          return {
            id: receipt.id,
            name: receipt.name,
            date: receipt.date,
            receiptImage: receipt.receipt_image,
            items: (items ?? []).map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.price,
              assignedTo: item.assigned_to,
              splitPercentage: item.split_percentage,
            })),
            friendCount: receipt.friend_count,
            friendInitials: receipt.friend_initials,
            currency: receipt.currency,
            currencySymbol: receipt.currency_symbol,
          };
        }),
      );

      setSavedReceipts(fullReceipts);
    } catch (err) {
      console.error(
        "Failed to load from Supabase, falling back to local:",
        err,
      );
      loadSavedReceipts();
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

  const handleSaveConfirm = async () => {
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

    try {
      if (user && saveToSupabase) {
        const supabase = createClient();
        const { data: receiptData, error } = await supabase
          .from("receipts")
          .insert([
            {
              user_id: user.id,
              name: newReceipt.name,
              date: newReceipt.date,
              receipt_image: newReceipt.receiptImage,
              friend_count: newReceipt.friendCount,
              friend_initials: newReceipt.friendInitials,
              currency: newReceipt.currency,
              currency_symbol: newReceipt.currencySymbol,
              tax_amount: taxAmount,
              tip_amount: tipAmount,
              include_tax: includeTax,
              include_tip: includeTip,
              tip_percentage: tipPercentage,
            },
          ])
          .select();

        // Now insert each item with a reference to the receipt
        if (receiptData && receiptData.length > 0) {
          const receiptId = receiptData[0].id;

          // Insert each item
          for (const item of newReceipt.items) {
            await supabase.from("receipt_items").insert({
              receipt_id: receiptId,
              name: item.name,
              price: item.price,
              assigned_to: item.assignedTo,
              split_percentage: item.splitPercentage || null,
            });
          }
        }

        if (error) throw error;

        toast({
          title: "Receipt saved to cloud",
          description: `"${receiptName}" is now available across devices"`,
        });
      } else {
        const updatedReceipts = [...savedReceipts, newReceipt];
        setSavedReceipts(updatedReceipts);

        if (typeof window !== "undefined") {
          localStorage.setItem(
            "resplit-saved-receipts",
            JSON.stringify(updatedReceipts),
          );
        }

        toast({
          title: "Receipt saved locally",
          description: `"${receiptName}" has been saved to your device"`,
        });
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
      toast({
        title: "Save failed",
        description: "Something went wrong while saving the receipt",
        variant: "destructive",
      });
    } finally {
      setSaveDialogOpen(false);
      setReceiptName("");
    }
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
  const deleteReceipt = async (id: string) => {
    try {
      // Check if this receipt exists in Supabase
      if (user) {
        const supabase = createClient();
        const { data } = await supabase
          .from("receipts")
          .select("id")
          .eq("id", id)
          .single();

        // If it exists in Supabase, delete it there
        if (data) {
          const { error } = await supabase
            .from("receipts")
            .delete()
            .eq("id", id);

          if (error) throw error;
        }
      }

      // Update local state
      const updatedReceipts = savedReceipts.filter(
        (receipt) => receipt.id !== id,
      );
      setSavedReceipts(updatedReceipts);

      // Update local storage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "resplit-saved-receipts",
          JSON.stringify(updatedReceipts),
        );
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description: "Failed to delete receipt. Please try again.",
        variant: "destructive",
      });
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

  return {
    // State
    user,
    receiptImage,
    isProcessing,
    activeTab,
    isPremiumEnabled,
    friendCount,
    friendInitials,
    currency,
    currencySymbol,
    taxAmount,
    tipAmount,
    includeTax,
    includeTip,
    tipPercentage,
    items,
    savedReceipts,
    saveDialogOpen,
    loadDialogOpen,
    saveLocationDialogOpen,
    saveToSupabase,
    receiptName,
    myItems,
    friendItems,
    sharedItems,

    // Setters
    setUser,
    setReceiptImage,
    setIsProcessing,
    setActiveTab,
    setIsPremiumEnabled,
    setFriendCount,
    setFriendInitials,
    setCurrency,
    setCurrencySymbol,
    setTaxAmount,
    setTipAmount,
    setIncludeTax,
    setIncludeTip,
    setTipPercentage,
    setItems,
    setSavedReceipts,
    setSaveDialogOpen,
    setLoadDialogOpen,
    setSaveLocationDialogOpen,
    setSaveToSupabase,
    setReceiptName,

    // Methods
    loadSavedReceipts,
    loadCloudReceipts,
    saveCurrentReceipt,
    handleSaveConfirm,
    loadReceipt,
    deleteReceipt,
    handleReceiptCaptured,
    handleItemAssign,
    handleSplitPercentageChange,
  };
}

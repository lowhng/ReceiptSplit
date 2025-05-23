"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { User, DollarSign, Users, Percent } from "lucide-react";

interface Item {
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

interface ItemListProps {
  items?: Item[];
  receiptImage?: string | null;
  friendCount?: number;
  friendInitials?: string[];
  currencySymbol?: string;
  onItemAssign?: (
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
  onSplitPercentageChange?: (
    itemId: string,
    percentages: Record<string, number>,
  ) => void;
  onGoToSummary?: () => void;
}

const ItemList = ({
  items = [
    { id: "1", name: "Burger", price: 12.99, assignedTo: null },
    { id: "2", name: "Fries", price: 4.99, assignedTo: null },
    { id: "3", name: "Soda", price: 2.49, assignedTo: null },
    { id: "4", name: "Dessert", price: 7.99, assignedTo: null },
  ],
  receiptImage = null,
  friendCount = 1,
  friendInitials = ["F1", "F2", "F3", "F4"],
  currencySymbol = "$",
  onItemAssign = () => {},
  onSplitPercentageChange = () => {},
  onGoToSummary = () => {},
}: ItemListProps) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [customSplitDialogOpen, setCustomSplitDialogOpen] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<
    Record<string, boolean>
  >({});
  const [splitPercentages, setSplitPercentages] = useState<
    Record<string, number>
  >({});

  const handleAssign = (
    item: Item,
    assignedTo:
      | "mine"
      | "friend1"
      | "friend2"
      | "friend3"
      | "friend4"
      | "shared"
      | null,
  ) => {
    // If the item is already assigned to this option, unassign it (set to null)
    const newAssignment = item.assignedTo === assignedTo ? null : assignedTo;
    onItemAssign(item.id, newAssignment);

    // Only proceed if we're assigning to shared (not unassigning)
    if (newAssignment === "shared") {
      setSelectedItem(item);

      if (friendCount === 1) {
        // For single friend, open the simple split dialog
        setSplitPercentages({ mine: 50, friend1: 50 });
        setSplitDialogOpen(true);
      } else if (friendCount > 1) {
        // For multiple friends, open the custom split dialog
        // Initialize selected friends (all unchecked by default)
        const initialSelectedFriends: Record<string, boolean> = {};
        for (let i = 1; i <= friendCount; i++) {
          initialSelectedFriends[`friend${i}`] = false;
        }
        setSelectedFriends(initialSelectedFriends);
        setCustomSplitDialogOpen(true);
      }
    }
  };

   // Returns the background/border color for checkboxes in the custom split dialog
  const getCheckboxColor = (id: string) => {
    switch (id) {
      case "mine":
        return "bg-blue-100 border-blue-300";
      case "friend1":
        return "bg-green-100 border-green-300";
      case "friend2":
        return "bg-yellow-100 border-yellow-300";
      case "friend3":
        return "bg-pink-100 border-pink-300";
      case "friend4":
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-white";
    }
  };

  const handleSplitConfirm = () => {
 
    if (selectedItem) {
      onSplitPercentageChange(selectedItem.id, splitPercentages);
      setSplitDialogOpen(false);
    }
  };

  const getAssignmentColor = (
    assignedTo:
      | "mine"
      | "friend1"
      | "friend2"
      | "friend3"
      | "friend4"
      | "shared"
      | null,
  ) => {
    switch (assignedTo) {
      case "mine":
        return "bg-blue-100 border-blue-300";
      case "friend1":
        return "bg-green-100 border-green-300";
      case "friend2":
        return "bg-yellow-100 border-yellow-300";
      case "friend3":
        return "bg-pink-100 border-pink-300";
      case "friend4":
        return "bg-orange-100 border-orange-300";
      case "shared":
        return "bg-purple-100 border-purple-300";
      default:
        return "bg-white";
    }
  };

  const handleSliderChange = (friendId: string, value: number) => {
    // Calculate remaining percentage
    const total = Object.values(splitPercentages).reduce(
      (sum, val) => sum + val,
      0,
    );
    const difference = value - (splitPercentages[friendId] || 0);
    const remaining = 100 - total - difference;

    // Distribute remaining percentage among other friends
    const otherFriends = Object.keys(splitPercentages).filter(
      (id) => id !== friendId,
    );
    const perFriendAdjustment = remaining / otherFriends.length;

    const newPercentages = { ...splitPercentages };
    newPercentages[friendId] = value;

    otherFriends.forEach((id) => {
      newPercentages[id] = perFriendAdjustment;
    });

    setSplitPercentages(newPercentages);
  };

  // Handles confirming the custom split dialog
  const handleCustomSplitConfirm = () => {
    if (selectedItem) {
      const activeFriends = Object.keys(selectedFriends).filter(
        (key) => selectedFriends[key],
      );
      const totalPeople = activeFriends.length;
      const equalShare = 100 / totalPeople;

      const percentages: Record<string, number> = {};
      activeFriends.forEach((id) => {
        percentages[id] = equalShare;
      });

      onSplitPercentageChange(selectedItem.id, percentages);
    }
    setCustomSplitDialogOpen(false);
  };

  return (
    <div className="w-full bg-background">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-base">Receipt Items</h2>
        <Badge variant="outline" className="ml-2">
          {items.length} items
        </Badge>
      </div>
      <div className="space-y-4">
        {receiptImage && (
          <div className="mb-4 p-2 border rounded-md">
            <img
              src={receiptImage}
              alt="Receipt"
              className="w-full max-h-48 object-contain mx-auto"
            />
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 sm:p-4 border rounded-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${getAssignmentColor(item.assignedTo)}`}
          >
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center">
                {currencySymbol}
                {item.price.toFixed(2)}
              </p>
              {item.assignedTo === "shared" && item.splitPercentage && (
                <div className="mt-1 text-xs flex items-center">
                  <span>
                    {Object.entries(item.splitPercentage)
                      .filter(([, value]) => value > 0)
                      .map(([key, value], index) => {
                        const label =
                          key === "mine"
                            ? "You"
                            : friendInitials[parseInt(key.replace("friend", "")) - 1] ||
                              key.replace("friend", "F");
                        return (
                          <span key={key}>
                            {index > 0 && " | "}
                            {label}:{" "}{Number(value).toFixed(1)}%
                          </span>
                        );
                      })}
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:gap-1 w-full sm:w-auto">
              <Button
                size="sm"
                variant={item.assignedTo === "mine" ? "default" : "outline"}
                onClick={() => handleAssign(item, "mine")}
                className="text-xs px-1 sm:px-2"
              >
                <User className="h-3 w-3 mr-1" /> Mine
              </Button>

              {/* Generate buttons for each friend */}
              {Array.from({ length: friendCount }, (_, i) => {
                const friendId = `friend${i + 1}` as
                  | "friend1"
                  | "friend2"
                  | "friend3"
                  | "friend4";
                return (
                  <Button
                    key={friendId}
                    size="sm"
                    variant={
                      item.assignedTo === friendId ? "default" : "outline"
                    }
                    onClick={() => handleAssign(item, friendId)}
                    className="text-xs px-1 sm:px-2"
                  >
                    <User className="h-3 w-3 mr-1" />{" "}
                    {friendInitials[i] || `F${i + 1}`}
                  </Button>
                );
              })}

              <Button
                size="sm"
                variant={item.assignedTo === "shared" ? "default" : "outline"}
                onClick={() => handleAssign(item, "shared")}
                className="text-xs px-1 sm:px-2"
              >
                <Users className="h-3 w-3 mr-1" /> Shared
              </Button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No items found. Please scan a receipt first.
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => onGoToSummary()}
              className="w-full sm:w-auto"
            >
              Go to Split Summary
            </Button>
          </div>
        )}
      </div>
      {/* Only show split dialog when there's 1 friend */}
      {friendCount === 1 && (
        <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[95vw]">
            <DialogHeader>
              <DialogTitle className="text-center">
                Split Item: {selectedItem?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-2 space-y-1 sm:space-y-0">
                    <Label className="text-sm">
                      Your percentage: {splitPercentages.mine || 50}%
                    </Label>
                    <Label className="text-sm">
                      {friendInitials[0] || "Friend"}'s percentage:{" "}
                      {splitPercentages.friend1 || 50}%
                    </Label>
                  </div>
                  <Slider
                    value={[splitPercentages.mine || 50]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => {
                      setSplitPercentages({
                        mine: value[0],
                        friend1: 100 - value[0],
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  <div className="p-3 sm:p-4 border rounded-md text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your share
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {currencySymbol}
                      {selectedItem
                        ? (
                            (selectedItem.price *
                              (splitPercentages.mine || 50)) /
                            100
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-md text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {friendInitials[0] || "Friend"}'s share
                    </p>
                    <p className="text-base sm:text-lg font-bold">
                      {currencySymbol}
                      {selectedItem
                        ? (
                            (selectedItem.price *
                              (splitPercentages.friend1 || 50)) /
                            100
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSplitPercentages({ mine: 50, friend1: 50 })
                    }
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    Reset to 50/50
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSplitPercentages({ mine: 100, friend1: 0 })
                    }
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    I'll pay
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSplitPercentages({ mine: 0, friend1: 100 })
                    }
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    {friendInitials[0] || "Friend"} pays
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSplitDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSplitConfirm}>Confirm Split</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Custom split dialog for multiple friends */}
      <Dialog
        open={customSplitDialogOpen}
        onOpenChange={setCustomSplitDialogOpen}
      >
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Share Item: {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Select which friends to share this item with
              </p>
              <div className="grid grid-cols-1 gap-2">
                <div
                  className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer ${
                    selectedFriends["mine"] ? getCheckboxColor("mine") : ""
                  }`}
                  onClick={() =>
                    setSelectedFriends((prev) => ({
                      ...prev,
                      mine: !prev.mine,
                    }))
                  }
                >
                  <Checkbox
                    id="share-mine"
                    checked={selectedFriends["mine"] ?? false}
                    onCheckedChange={(checked) =>
                      setSelectedFriends((prev) => ({
                        ...prev,
                        mine: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="share-mine" className="flex-1 cursor-pointer">
                    Myself
                  </Label>
                </div>
                {Array.from({ length: friendCount }, (_, i) => {
                  const friendId = `friend${i + 1}`;
                  return (
                    <div
                      key={friendId}
                      className={`flex items-center space-x-2 p-2 border rounded-md cursor-pointer ${
                        selectedFriends[friendId] ? getCheckboxColor(friendId) : ""
                      }`}
                      onClick={() =>
                        setSelectedFriends((prev) => ({
                          ...prev,
                          [friendId]: !prev[friendId],
                        }))
                      }
                    >
                      <Checkbox
                        id={`share-${friendId}`}
                        checked={selectedFriends[friendId] ?? false}
                        onCheckedChange={(checked) =>
                          setSelectedFriends((prev) => ({
                            ...prev,
                            [friendId]: checked === true,
                          }))
                        }
                      />
                      <Label htmlFor={`share-${friendId}`} className="flex-1 cursor-pointer">
                        {friendInitials[i] || `Friend ${i + 1}`}
                      </Label>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border rounded-md text-center">
                <p className="text-xs text-muted-foreground">
                  Item will be split equally between you and selected friends
                </p>
                <p className="text-sm font-medium mt-1">
                  {selectedItem?.name} - {currencySymbol}
                  {selectedItem?.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCustomSplitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCustomSplitConfirm}>Confirm Sharing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemList;

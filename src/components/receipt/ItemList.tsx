"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  assignedTo: "mine" | "friend" | "shared" | null;
  splitPercentage?: { mine: number; friend: number };
}

interface ItemListProps {
  items?: Item[];
  receiptImage?: string | null;
  onItemAssign?: (
    itemId: string,
    assignedTo: "mine" | "friend" | "shared" | null,
  ) => void;
  onSplitPercentageChange?: (
    itemId: string,
    percentages: { mine: number; friend: number },
  ) => void;
}

const ItemList = ({
  items = [
    { id: "1", name: "Burger", price: 12.99, assignedTo: null },
    { id: "2", name: "Fries", price: 4.99, assignedTo: null },
    { id: "3", name: "Soda", price: 2.49, assignedTo: null },
    { id: "4", name: "Dessert", price: 7.99, assignedTo: null },
  ],
  receiptImage = null,
  onItemAssign = () => {},
  onSplitPercentageChange = () => {},
}: ItemListProps) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [splitPercentage, setSplitPercentage] = useState(50);

  const handleAssign = (
    item: Item,
    assignedTo: "mine" | "friend" | "shared" | null,
  ) => {
    onItemAssign(item.id, assignedTo);

    if (assignedTo === "shared") {
      setSelectedItem(item);
      setSplitDialogOpen(true);
    }
  };

  const handleSplitConfirm = () => {
    if (selectedItem) {
      onSplitPercentageChange(selectedItem.id, {
        mine: splitPercentage,
        friend: 100 - splitPercentage,
      });
      setSplitDialogOpen(false);
    }
  };

  const getAssignmentColor = (
    assignedTo: "mine" | "friend" | "shared" | null,
  ) => {
    switch (assignedTo) {
      case "mine":
        return "bg-blue-100 border-blue-300";
      case "friend":
        return "bg-green-100 border-green-300";
      case "shared":
        return "bg-purple-100 border-purple-300";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="w-full bg-background p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Receipt Items</span>
            <Badge variant="outline" className="ml-2">
              {items.length} items
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    <DollarSign className="h-3 w-3 mr-1" />
                    {item.price.toFixed(2)}
                  </p>
                  {item.assignedTo === "shared" && item.splitPercentage && (
                    <div className="mt-1 text-xs flex items-center">
                      <Percent className="h-3 w-3 mr-1" />
                      <span>
                        You: {item.splitPercentage.mine}% | Friend:{" "}
                        {item.splitPercentage.friend}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1 sm:flex sm:space-x-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant={item.assignedTo === "mine" ? "default" : "outline"}
                    onClick={() => handleAssign(item, "mine")}
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Mine
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      item.assignedTo === "friend" ? "default" : "outline"
                    }
                    onClick={() => handleAssign(item, "friend")}
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Friend's
                  </Button>
                  <Button
                    size="sm"
                    variant={
                      item.assignedTo === "shared" ? "default" : "outline"
                    }
                    onClick={() => handleAssign(item, "shared")}
                    className="text-xs sm:text-sm px-1 sm:px-3"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Shared
                  </Button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items found. Please scan a receipt first.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                    Your percentage: {splitPercentage}%
                  </Label>
                  <Label className="text-sm">
                    Friend's percentage: {100 - splitPercentage}%
                  </Label>
                </div>
                <Slider
                  value={[splitPercentage]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setSplitPercentage(value[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="p-3 sm:p-4 border rounded-md text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your share
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    $
                    {selectedItem
                      ? ((selectedItem.price * splitPercentage) / 100).toFixed(
                          2,
                        )
                      : "0.00"}
                  </p>
                </div>
                <div className="p-3 sm:p-4 border rounded-md text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Friend's share
                  </p>
                  <p className="text-base sm:text-lg font-bold">
                    $
                    {selectedItem
                      ? (
                          (selectedItem.price * (100 - splitPercentage)) /
                          100
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:flex sm:justify-between">
                <Button
                  variant="outline"
                  onClick={() => setSplitPercentage(50)}
                  className="text-xs sm:text-sm px-1 sm:px-3"
                >
                  Reset to 50/50
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSplitPercentage(100)}
                  className="text-xs sm:text-sm px-1 sm:px-3"
                >
                  I'll pay
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSplitPercentage(0)}
                  className="text-xs sm:text-sm px-1 sm:px-3"
                >
                  Friend pays
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSplitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSplitConfirm}>Confirm Split</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemList;

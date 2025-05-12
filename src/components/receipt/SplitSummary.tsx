"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SharedItem {
  name: string;
  price: number;
  mine: number;
  [key: `friend${number}`]: number;
}

interface SplitSummaryProps {
  myItems?: Array<{ name: string; price: number }>;
  friendItems?: Array<Array<{ name: string; price: number }>>;
  sharedItems?: SharedItem[];
  friendCount?: number;
  friendInitials?: string[];
  currencySymbol?: string;
}

const SplitSummary = ({
  myItems = [
    { name: "Burger", price: 12.99 },
    { name: "Fries", price: 4.99 },
  ],
  friendItems = [
    [
      { name: "Salad", price: 9.99 },
      { name: "Soda", price: 2.99 },
    ],
  ],
  sharedItems = [
    { name: "Appetizer", price: 8.99, mine: 4.5, friend1: 4.49 },
    { name: "Dessert", price: 7.99, mine: 4.0, friend1: 3.99 },
  ],
  friendCount = 1,
  friendInitials = ["F1"],
  currencySymbol = "$",
}: SplitSummaryProps) => {
  const [includeTax, setIncludeTax] = useState(false);
  const [includeTip, setIncludeTip] = useState(false);
  const [taxAmount, setTaxAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercentage, setTipPercentage] = useState(0);

  const mySubtotal =
    myItems.reduce((sum, item) => sum + item.price, 0) +
    sharedItems.reduce((sum, item) => sum + (Number(item.mine) || 0), 0);

  const friendSubtotals = friendItems.map((items, index) => {
    const friendId = `friend${index + 1}` as keyof SharedItem;
    return {
      id: friendId,
      subtotal:
        items.reduce((sum, item) => sum + item.price, 0) +
        sharedItems.reduce((sum, item) => sum + (item[friendId] ?? 0), 0),
    };
  });

  const totalBeforeTaxAndTip =
    mySubtotal +
    friendSubtotals.reduce((sum, friend) => sum + friend.subtotal, 0);

  const myTaxProportion =
    includeTax && totalBeforeTaxAndTip > 0
      ? (mySubtotal / totalBeforeTaxAndTip) * taxAmount
      : 0;

  const myTipProportion =
    includeTip && totalBeforeTaxAndTip > 0
      ? (mySubtotal / totalBeforeTaxAndTip) * tipAmount
      : 0;

  const friendProportions = friendSubtotals.map((friend) => {
    const taxProportion =
      includeTax && totalBeforeTaxAndTip > 0
        ? (friend.subtotal / totalBeforeTaxAndTip) * taxAmount
        : 0;

    const tipProportion =
      includeTip && totalBeforeTaxAndTip > 0
        ? (friend.subtotal / totalBeforeTaxAndTip) * tipAmount
        : 0;

    return {
      ...friend,
      taxProportion,
      tipProportion,
      total: friend.subtotal + taxProportion + tipProportion,
    };
  });

  const myTotal = mySubtotal + myTaxProportion + myTipProportion;
  const grandTotal =
    myTotal + friendProportions.reduce((sum, friend) => sum + friend.total, 0);

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTaxAmount(value);
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTipAmount(value);
    if (totalBeforeTaxAndTip > 0) {
      setTipPercentage(Math.round((value / totalBeforeTaxAndTip) * 100));
    }
  };

  const handleTipPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = parseFloat(e.target.value) || 0;
    setTipPercentage(percentage);
    const newTipAmount = (percentage / 100) * totalBeforeTaxAndTip;
    setTipAmount(parseFloat(newTipAmount.toFixed(2)));
  };

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-card">
      <CardHeader className="px-3 py-4 sm:px-6 sm:py-6">
        <CardTitle className="text-lg sm:text-xl font-bold text-center">
          Split Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="font-medium text-primary text-sm sm:text-base">
              Your Items
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Subtotal: {formatCurrency(mySubtotal)}
            </p>
          </div>
          <div>
            {friendSubtotals.map((friend, index) => (
              <div key={friend.id} className="space-y-1 sm:space-y-2 mb-2">
                <h3
                  className={`font-medium text-sm sm:text-base ${index === 0 ? "text-blue-500" : index === 1 ? "text-yellow-500" : index === 2 ? "text-pink-500" : "text-orange-500"}`}
                >
                  {friendInitials[index] || `Friend ${index + 1}`}'s Items
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(friend.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-medium text-sm sm:text-base">Adjustments</h3>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeTax"
                checked={includeTax}
                onChange={(e) => setIncludeTax(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="includeTax" className="text-xs sm:text-sm">
                Include Tax
              </Label>
            </div>

            <div className="flex items-center gap-2 sm:ml-6">
              <input
                type="checkbox"
                id="includeTip"
                checked={includeTip}
                onChange={(e) => setIncludeTip(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="includeTip" className="text-xs sm:text-sm">
                Include Tip
              </Label>
            </div>
          </div>

          {includeTax && (
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="tax" className="text-xs sm:text-sm">
                Tax Amount
              </Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={taxAmount}
                onChange={handleTaxChange}
                className="text-sm h-8 sm:h-10"
              />
            </div>
          )}

          {includeTip && (
            <>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="tip" className="text-xs sm:text-sm">
                  Tip Amount
                </Label>
                <Input
                  id="tip"
                  type="number"
                  step="0.01"
                  min="0"
                  value={tipAmount}
                  onChange={handleTipChange}
                  className="text-sm h-8 sm:h-10"
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="tipPercentage" className="text-xs sm:text-sm">
                  Tip Percentage
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tipPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={tipPercentage}
                    onChange={handleTipPercentageChange}
                    className="text-sm h-8 sm:h-10"
                  />
                  <span className="text-xs sm:text-sm">%</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1">
            <h3 className="font-medium text-primary text-sm sm:text-base">
              Your Total
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Items: {formatCurrency(mySubtotal)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tax: {formatCurrency(myTaxProportion)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tip: {formatCurrency(myTipProportion)}
            </p>
            <p className="font-bold text-sm sm:text-base">
              {formatCurrency(myTotal)}
            </p>
          </div>
          <div>
            {friendProportions.map((friend, index) => (
              <div key={friend.id} className="space-y-1 mb-3">
                <h3
                  className={`font-medium text-sm sm:text-base ${index === 0 ? "text-blue-500" : index === 1 ? "text-yellow-500" : index === 2 ? "text-pink-500" : "text-orange-500"}`}
                >
                  {friendInitials[index] || `Friend ${index + 1}`}'s Total
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Items: {formatCurrency(friend.subtotal)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tax: {formatCurrency(friend.taxProportion)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tip: {formatCurrency(friend.tipProportion)}
                </p>
                <p className="font-bold text-sm sm:text-base">
                  {formatCurrency(friend.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 sm:mt-4 pt-2 border-t">
          <p className="text-center font-bold text-sm sm:text-base">
            Grand Total: {formatCurrency(grandTotal)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SplitSummary;

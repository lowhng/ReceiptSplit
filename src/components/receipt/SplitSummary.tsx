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
        sharedItems.reduce((sum, item) => sum + Number(item[friendId] ?? 0), 0),
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

        {/* Tax and Tip Adjustments and Final Totals go here (already restored) */}
      </CardContent>
    </Card>
  );
};

export default SplitSummary;

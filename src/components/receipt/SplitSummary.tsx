"use client";

import { useState } from "react";
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
  taxAmount?: number;
  setTaxAmount?: (value: number) => void;
  tipAmount?: number;
  setTipAmount?: (value: number) => void;
  includeTax?: boolean;
  setIncludeTax?: (value: boolean) => void;
  includeTip?: boolean;
  setIncludeTip?: (value: boolean) => void;
  tipPercentage?: number;
  setTipPercentage?: (value: number) => void;
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
  taxAmount = 0,
  setTaxAmount = () => {},
  tipAmount = 0,
  setTipAmount = () => {},
  includeTax = false,
  setIncludeTax = () => {},
  includeTip = false,
  setIncludeTip = () => {},
  tipPercentage = 0,
  setTipPercentage = () => {},
}: SplitSummaryProps) => {
  // States are now passed as props from the parent component

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
    // Remove leading zeros and handle empty input
    let inputValue = e.target.value;
    if (inputValue === "") {
      setTaxAmount(0);
      return;
    }

    // Remove leading zeros but keep decimal part
    if (inputValue.includes(".")) {
      const [intPart, decimalPart] = inputValue.split(".");
      inputValue = (parseInt(intPart, 10) || 0) + "." + decimalPart;
    } else {
      inputValue = (parseInt(inputValue, 10) || 0).toString();
    }

    const value = parseFloat(inputValue);
    setTaxAmount(value);
  };

  const handleTipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove leading zeros and handle empty input
    let inputValue = e.target.value;
    if (inputValue === "") {
      setTipAmount(0);
      if (totalBeforeTaxAndTip > 0) {
        setTipPercentage(0);
      }
      return;
    }

    // Remove leading zeros but keep decimal part
    if (inputValue.includes(".")) {
      const [intPart, decimalPart] = inputValue.split(".");
      inputValue = (parseInt(intPart, 10) || 0) + "." + decimalPart;
    } else {
      inputValue = (parseInt(inputValue, 10) || 0).toString();
    }

    const value = parseFloat(inputValue);
    setTipAmount(value);
    if (totalBeforeTaxAndTip > 0) {
      setTipPercentage(Math.round((value / totalBeforeTaxAndTip) * 100));
    }
  };

  const handleTipPercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    // Remove leading zeros and handle empty input
    let inputValue = e.target.value;
    if (inputValue === "") {
      setTipPercentage(0);
      setTipAmount(0);
      return;
    }

    // Remove leading zeros but keep decimal part
    if (inputValue.includes(".")) {
      const [intPart, decimalPart] = inputValue.split(".");
      inputValue = (parseInt(intPart, 10) || 0) + "." + decimalPart;
    } else {
      inputValue = (parseInt(inputValue, 10) || 0).toString();
    }

    const percentage = parseFloat(inputValue);
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
        {/* Original layout preserved including adjustments and final total */}

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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount === 0 ? "" : taxAmount}
                  onChange={handleTaxChange}
                  className="text-sm h-8 sm:h-10"
                  inputMode="decimal"
                  style={{
                    fontSize: "16px",
                    paddingLeft: `calc(${currencySymbol.length * 0.6}rem + 1.5rem)`,
                  }}
                />
              </div>
            </div>
          )}

          {includeTip && (
            <>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="tip" className="text-xs sm:text-sm">
                  Tip Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="tip"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tipAmount === 0 ? "" : tipAmount}
                    onChange={handleTipChange}
                    className="text-sm h-8 sm:h-10"
                    inputMode="decimal"
                    style={{
                      fontSize: "16px",
                      paddingLeft: `calc(${currencySymbol.length * 0.6}rem + 1.5rem)`,
                    }}
                  />
                </div>
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
                    value={tipPercentage === 0 ? "" : tipPercentage}
                    onChange={handleTipPercentageChange}
                    className="text-sm h-8 sm:h-10"
                    inputMode="decimal"
                    style={{ fontSize: "16px" }}
                  />
                  <span className="text-xs sm:text-sm">%</span>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-md p-3 bg-blue-100 border-blue-300">
            <div className="flex justify-between items-start space-x-2">
              <div className="space-y-1">
                <h3 className="font-medium text-sm sm:text-base text-muted-foreground">
                  Your Total
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Items: {formatCurrency(mySubtotal)}
                </p>
                {myTaxProportion > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tax: {formatCurrency(myTaxProportion)}
                  </p>
                )}
                {myTipProportion > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Tip: {formatCurrency(myTipProportion)}
                  </p>
                )}
              </div>
              <div className="font-bold text-sm sm:text-base whitespace-nowrap">
                {formatCurrency(myTotal)}
              </div>
            </div>
          </div>

          {friendProportions.map((friend, index) => (
            <div
              key={friend.id}
              className={`rounded-md p-3 ${
                index === 0
                  ? "bg-green-50 border border-green-200"
                  : index === 1
                  ? "bg-yellow-50 border border-yellow-200"
                  : index === 2
                  ? "bg-pink-50 border border-pink-200"
                  : "bg-orange-50 border border-orange-200"
              }`}
            >
              <div className="flex justify-between items-start space-x-2">
                <div className="space-y-1">
                  <h3
                    className={`font-medium text-sm sm:text-base ${
                      index === 0
                        ? "text-green-500"
                        : index === 1
                        ? "text-yellow-500"
                        : index === 2
                        ? "text-pink-500"
                        : "text-orange-500"
                    }`}
                  >
                    {friendInitials[index] || `Friend ${index + 1}`}'s Total
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Items: {formatCurrency(friend.subtotal)}
                  </p>
                  {friend.taxProportion > 0 && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Tax: {formatCurrency(friend.taxProportion)}
                    </p>
                  )}
                  {friend.tipProportion > 0 && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Tip: {formatCurrency(friend.tipProportion)}
                    </p>
                  )}
                </div>
                <div className="font-bold text-sm sm:text-base whitespace-nowrap">
                  {formatCurrency(friend.total)}
                </div>
              </div>
            </div>
          ))}
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

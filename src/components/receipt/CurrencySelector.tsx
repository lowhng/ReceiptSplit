"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySelectorProps {
  currency: string;
  setCurrency: (value: string) => void;
  setCurrencySymbol: (value: string) => void;
}

export default function CurrencySelector({
  currency,
  setCurrency,
  setCurrencySymbol,
}: CurrencySelectorProps) {
  return (
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
      <SelectTrigger className="w-auto min-w-24 h-7 text-xs whitespace-nowrap">
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
  );
}

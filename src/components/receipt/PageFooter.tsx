"use client";

import CurrencySelector from "@/components/receipt/CurrencySelector";

interface PageFooterProps {
  currency: string;
  setCurrency: (value: string) => void;
  setCurrencySymbol: (value: string) => void;
}

export default function PageFooter({
  currency,
  setCurrency,
  setCurrencySymbol,
}: PageFooterProps) {
  return (
    <div className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
      <div className="flex justify-center items-center mb-2">
        <CurrencySelector
          currency={currency}
          setCurrency={setCurrency}
          setCurrencySymbol={setCurrencySymbol}
        />
      </div>
      <p>ReSplit App &copy; {new Date().getFullYear()}</p>
      <p>Another product made with 💖 by Wei Hong</p>
    </div>
  );
}

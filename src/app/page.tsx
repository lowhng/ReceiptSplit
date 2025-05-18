"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReceiptState } from "@/hooks/useReceiptState";

// Import components
import PageHeader from "@/components/receipt/PageHeader";
import PageFooter from "@/components/receipt/PageFooter";
import CaptureTab from "@/components/receipt/CaptureTab";
import ItemsTab from "@/components/receipt/ItemsTab";
import SummaryTab from "@/components/receipt/SummaryTab";
import SaveLocationDialog from "@/components/receipt/SaveLocationDialog";
import SaveReceiptDialog from "@/components/receipt/SaveReceiptDialog";
import LoadReceiptDialog from "@/components/receipt/LoadReceiptDialog";

export default function Home() {
  const receiptState = useReceiptState();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center sm:p-4 md:p-8 py-9 w-full">
      <PageHeader user={receiptState.user} />

      <main className="w-full max-w-5xl flex flex-col gap-4 sm:gap-8 mx-auto">
        <Tabs
          value={receiptState.activeTab}
          onValueChange={receiptState.setActiveTab}
          className="w-full"
        >
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
            <CaptureTab
              isPremiumEnabled={receiptState.isPremiumEnabled}
              setIsPremiumEnabled={receiptState.setIsPremiumEnabled}
              friendCount={receiptState.friendCount}
              setFriendCount={receiptState.setFriendCount}
              friendInitials={receiptState.friendInitials}
              setFriendInitials={receiptState.setFriendInitials}
              isProcessing={receiptState.isProcessing}
              onReceiptCaptured={receiptState.handleReceiptCaptured}
              onLoadReceiptClick={() => receiptState.setLoadDialogOpen(true)}
            />
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <ItemsTab
              receiptImage={receiptState.receiptImage}
              items={receiptState.items}
              friendCount={receiptState.friendCount}
              friendInitials={receiptState.friendInitials}
              currencySymbol={receiptState.currencySymbol}
              onItemAssign={receiptState.handleItemAssign}
              onSplitPercentageChange={receiptState.handleSplitPercentageChange}
              onGoToSummary={() => receiptState.setActiveTab("summary")}
            />
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <SummaryTab
              myItems={receiptState.myItems}
              friendItems={receiptState.friendItems}
              sharedItems={receiptState.sharedItems}
              friendCount={receiptState.friendCount}
              friendInitials={receiptState.friendInitials}
              currencySymbol={receiptState.currencySymbol}
              taxAmount={receiptState.taxAmount}
              setTaxAmount={receiptState.setTaxAmount}
              tipAmount={receiptState.tipAmount}
              setTipAmount={receiptState.setTipAmount}
              includeTax={receiptState.includeTax}
              setIncludeTax={receiptState.setIncludeTax}
              includeTip={receiptState.includeTip}
              setIncludeTip={receiptState.setIncludeTip}
              tipPercentage={receiptState.tipPercentage}
              setTipPercentage={receiptState.setTipPercentage}
              onSaveReceiptClick={receiptState.saveCurrentReceipt}
              onLoadReceiptClick={() => {
                console.log("🔄 Load Receipt button clicked (summary tab)");
                receiptState.loadSavedReceipts();
                receiptState.setLoadDialogOpen(true);
              }}
            />
          </TabsContent>
        </Tabs>

        <PageFooter
          currency={receiptState.currency}
          setCurrency={receiptState.setCurrency}
          setCurrencySymbol={receiptState.setCurrencySymbol}
        />
      </main>

      {/* Save Location Dialog - shown first if user is logged in */}
      <SaveLocationDialog
        open={receiptState.saveLocationDialogOpen}
        onOpenChange={receiptState.setSaveLocationDialogOpen}
        saveToSupabase={receiptState.saveToSupabase}
        setSaveToSupabase={receiptState.setSaveToSupabase}
        onNext={() => receiptState.setSaveDialogOpen(true)}
      />

      {/* Save Receipt Dialog */}
      <SaveReceiptDialog
        open={receiptState.saveDialogOpen}
        onOpenChange={receiptState.setSaveDialogOpen}
        receiptName={receiptState.receiptName}
        setReceiptName={receiptState.setReceiptName}
        saveToSupabase={receiptState.saveToSupabase}
        setSaveToSupabase={receiptState.setSaveToSupabase}
        onSave={receiptState.handleSaveConfirm}
        user={receiptState.user}
      />

      {/* Load Receipt Dialog */}
      <LoadReceiptDialog
        open={receiptState.loadDialogOpen}
        onOpenChange={receiptState.setLoadDialogOpen}
        savedReceipts={receiptState.savedReceipts}
        onLoadReceipt={receiptState.loadReceipt}
        onDeleteReceipt={receiptState.deleteReceipt}
      />
    </div>
  );
}

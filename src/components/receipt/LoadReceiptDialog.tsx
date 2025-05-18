"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { SavedReceipt } from "@/hooks/useReceiptState";

interface LoadReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  savedReceipts: SavedReceipt[];
  onLoadReceipt: (receipt: SavedReceipt) => void;
  onDeleteReceipt: (id: string) => void;
}

export default function LoadReceiptDialog({
  open,
  onOpenChange,
  savedReceipts,
  onLoadReceipt,
  onDeleteReceipt,
}: LoadReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  onClick={() => onLoadReceipt(receipt)}
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
                      onDeleteReceipt(receipt.id);
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

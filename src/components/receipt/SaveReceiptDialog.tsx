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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptName: string;
  setReceiptName: (value: string) => void;
  saveToSupabase: boolean;
  setSaveToSupabase: (value: boolean) => void;
  onSave: () => void;
  user: any;
}

export default function SaveReceiptDialog({
  open,
  onOpenChange,
  receiptName,
  setReceiptName,
  saveToSupabase,
  setSaveToSupabase,
  onSave,
  user,
}: SaveReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Save Receipt</DialogTitle>
          <DialogDescription>
            Enter a name to save this receipt for later use.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="receipt-name" className="text-sm mb-2 block">
            Receipt Name
          </Label>
          <Input
            id="receipt-name"
            value={receiptName}
            onChange={(e) => setReceiptName(e.target.value)}
            placeholder="e.g., Dinner with friends"
            className="w-full"
            style={{ fontSize: "16px" }}
          />
        </div>
        {user && (
          <div className="pb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Choose where to save:
            </p>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="radio"
                id="save-cloud"
                name="save-location"
                checked={saveToSupabase}
                onChange={() => setSaveToSupabase(true)}
                className="h-4 w-4"
              />
              <Label htmlFor="save-cloud" className="text-sm">
                Save to cloud (access from any device)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="save-local"
                name="save-location"
                checked={!saveToSupabase}
                onChange={() => setSaveToSupabase(false)}
                className="h-4 w-4"
              />
              <Label htmlFor="save-local" className="text-sm">
                Save locally (only on this device)
              </Label>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            {user && saveToSupabase ? "Save to Cloud" : "Save Locally"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

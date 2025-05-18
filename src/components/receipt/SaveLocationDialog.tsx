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
import { Label } from "@/components/ui/label";

interface SaveLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saveToSupabase: boolean;
  setSaveToSupabase: (value: boolean) => void;
  onNext: () => void;
}

export default function SaveLocationDialog({
  open,
  onOpenChange,
  saveToSupabase,
  setSaveToSupabase,
  onNext,
}: SaveLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Save Location</DialogTitle>
          <DialogDescription>
            Choose where to save your receipt
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onNext();
            }}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

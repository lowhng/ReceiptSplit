"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ReceiptCapture from "@/components/receipt/ReceiptCapture";

interface CaptureTabProps {
  isPremiumEnabled: boolean;
  setIsPremiumEnabled: (value: boolean) => void;
  friendCount: number;
  setFriendCount: (value: number) => void;
  friendInitials: string[];
  setFriendInitials: (value: string[]) => void;
  isProcessing: boolean;
  onReceiptCaptured: (imageData: string) => void;
  onLoadReceiptClick: () => void;
}

export default function CaptureTab({
  isPremiumEnabled,
  setIsPremiumEnabled,
  friendCount,
  setFriendCount,
  friendInitials,
  setFriendInitials,
  isProcessing,
  onReceiptCaptured,
  onLoadReceiptClick,
}: CaptureTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capture Receipt</CardTitle>
        <CardDescription>
          Take a photo of your receipt or upload one from your gallery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-x-3 gap-y-2">
            <div className="flex items-center gap-x-px sm:mt-0 sm:mb-0 mb-2">
              <Checkbox
                id="premium"
                checked={isPremiumEnabled}
                onCheckedChange={(checked) =>
                  setIsPremiumEnabled(checked === true)
                }
              />
              <Label htmlFor="premium" className="text-xs sm:text-sm ml-2">
                Enable Premium Models
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto gap-x-1.5 py-1 sm:ml-auto"
              onClick={onLoadReceiptClick}
            >
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" /> Load Receipt
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="friend-count" className="text-xs sm:text-sm">
                How many friends are you splitting with?
              </Label>
              <Select
                value={friendCount.toString()}
                onValueChange={(value) => {
                  const count = parseInt(value);
                  setFriendCount(count);
                }}
              >
                <SelectTrigger
                  id="friend-count"
                  className="w-full text-xs sm:text-sm h-9"
                >
                  <SelectValue placeholder="Select number of friends" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 friend</SelectItem>
                  <SelectItem value="2">2 friends</SelectItem>
                  <SelectItem value="3">3 friends</SelectItem>
                  <SelectItem value="4">4 friends</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {friendCount > 1 && (
              <div className="space-y-2 mt-3">
                <Label className="text-xs sm:text-sm">
                  Enter your friends' initials (max 5 chars)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: friendCount }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`friend-${i + 1}`} className="text-xs">
                          Friend {i + 1}
                        </Label>
                      </div>
                      <Input
                        id={`friend-${i + 1}`}
                        value={friendInitials[i]}
                        onChange={(e) => {
                          const newInitials = [...friendInitials];
                          newInitials[i] = e.target.value.slice(0, 5);
                          setFriendInitials(newInitials);
                        }}
                        placeholder={`F${i + 1}`}
                        className="text-xs h-9"
                        inputMode="text"
                        style={{ fontSize: "16px" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ReceiptCapture
              onReceiptCaptured={onReceiptCaptured}
              isProcessing={isProcessing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

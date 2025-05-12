"use client";

import React, { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ReceiptCaptureProps {
  onReceiptCaptured?: (imageData: string) => void;
  isProcessing?: boolean;
}

const ReceiptCapture = ({
  onReceiptCaptured = () => {},
  isProcessing = false,
}: ReceiptCaptureProps) => {
  const [captureMethod, setCaptureMethod] = useState<
    "camera" | "upload" | null
  >(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Reference to file input element
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCameraCapture = () => {
    setCaptureMethod("camera");
    // Trigger file input with camera source
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };

  const handleGalleryUpload = () => {
    setCaptureMethod("upload");
    // Trigger file input for gallery
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setPreviewImage(imageData);
        onReceiptCaptured(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-background p-4 rounded-lg">
      <h2 className="text-lg sm:text-2xl font-bold text-center mb-3 sm:mb-6">
        Capture Receipt
      </h2>

      {isProcessing ? (
        <Card className="w-full p-4 sm:p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-3 sm:mb-4" />
          <p className="text-base sm:text-lg font-medium">
            Processing receipt...
          </p>
        </Card>
      ) : previewImage ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="relative w-full h-48 sm:h-64 overflow-hidden rounded-md border border-border">
            <img
              src={previewImage}
              alt="Receipt preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setPreviewImage(null);
                setCaptureMethod(null);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Capture Again
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Button
            onClick={handleCameraCapture}
            className="h-20 sm:h-32 flex flex-col items-center justify-center gap-2 py-2"
            variant="outline"
          >
            <Camera className="h-6 w-6 sm:h-10 sm:w-10" />
            <span className="text-xs sm:text-sm">Take Photo</span>
          </Button>

          <Button
            onClick={handleGalleryUpload}
            className="h-20 sm:h-32 flex flex-col items-center justify-center gap-2 py-2"
            variant="outline"
          >
            <Upload className="h-6 w-6 sm:h-10 sm:w-10" />
            <span className="text-xs sm:text-sm">Upload</span>
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <p className="text-xs sm:text-sm text-muted-foreground text-center mt-4 sm:mt-6">
        {captureMethod === "camera"
          ? "Position the receipt within the frame and take a clear photo"
          : captureMethod === "upload"
            ? "Select a clear image of your receipt from your gallery"
            : "Choose a method to capture your receipt"}
      </p>
    </div>
  );
};

export default ReceiptCapture;

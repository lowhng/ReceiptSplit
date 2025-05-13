"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if the app is running as a PWA
    const isRunningAsPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      (window.navigator as any).standalone === true; // For iOS

    // Check if the user is on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Check if the user has dismissed the prompt before
    const hasUserDismissedPrompt =
      localStorage.getItem("pwa-prompt-dismissed") === "true";

    // Detect iOS devices
    const isIOSDevice =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Only show the prompt if on mobile, not already installed, and not dismissed
    if (isMobile && !isRunningAsPWA && !hasUserDismissedPrompt) {
      setShowInstallPrompt(true);
    }

    // Listen for the beforeinstallprompt event (works on Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the browser install prompt
      await deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }

      // Clear the deferredPrompt as it can only be used once
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showInstallPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex items-center justify-between z-50 shadow-lg">
      <div className="flex-1 mr-4">
        <h3 className="font-medium text-sm">Add ReSplit to Home Screen</h3>
        <p className="text-xs text-muted-foreground">
          {isIOS
            ? "Tap the share icon and then 'Add to Home Screen'"
            : "Install this app for easier access"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isIOS && (
          <Button size="sm" onClick={handleInstallClick} className="text-xs">
            <Download className="h-3 w-3 mr-1" /> Install
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-xs"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

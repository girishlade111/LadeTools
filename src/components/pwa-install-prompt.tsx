import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Laptop, Sparkles } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed in standalone mode
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error navigator standalone is iOS Safari specific
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log("[PWA] LadeTools installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
        setIsInstalled(true);
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[PWA] Install prompt error:", err);
    }
  };

  // If already installed or dismissed by user in this session, hide
  if (isInstalled || isDismissed) {
    return null;
  }

  // If beforeinstallprompt hasn't fired yet or isn't supported, we can show an installable badge or fallback
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3.5 p-4 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-xl shadow-primary/5 text-card-foreground">
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Laptop className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-sm">
            <span>Install LadeTools</span>
            <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-medium">
              <Sparkles className="h-2.5 w-2.5" />
              PWA
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">
            Access developer tools offline with zero latency
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="default"
            className="h-8 gap-1.5 text-xs shadow-sm shadow-primary/25"
            onClick={deferredPrompt ? handleInstallClick : () => alert("To install, click the browser menu (⋮ or ⊕) and select 'Install LadeTools'")}
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PwaStatusBadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-border bg-background/50 font-medium">
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
        }`}
      />
      <span>{isOnline ? "Online (Cached Offline)" : "Offline Mode Active"}</span>
    </div>
  );
}

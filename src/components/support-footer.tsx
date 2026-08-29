import { useState, useEffect } from "react";
import { Coffee, Heart, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DONATION_URL = "https://github.com/sponsors/girishlade111";

interface SupportFooterProps {
  variant?: "footer" | "sidebar";
  className?: string;
}

export function SupportFooter({ variant = "footer", className = "" }: SupportFooterProps) {
  const [dismissed, setDismissed] = useState<boolean>(true); // Default true until mounted to avoid SSR flash

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("ladetools_donation_dismissed") === "true";
      setDismissed(isDismissed);
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDismissed(true);
    try {
      sessionStorage.setItem("ladetools_donation_dismissed", "true");
    } catch {
      //
    }
  };

  if (dismissed) {
    return null;
  }

  if (variant === "sidebar") {
    return (
      <div
        className={`mx-3 mb-3 p-3 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent relative group animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-5 w-5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 flex items-center justify-center transition-colors"
          title="Dismiss for this session"
          aria-label="Dismiss support banner"
        >
          <X className="h-3 w-3" />
        </button>

        <div className="space-y-2 pr-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Coffee className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Support LadeTools</span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Free & 100% client-side. Support ongoing development & new tools!
          </p>

          <a
            href={DONATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition-all shadow-sm group-hover:border-amber-500/50"
          >
            <Heart className="h-3 w-3 text-rose-400 fill-rose-400/40 shrink-0" />
            <span>Buy a Coffee</span>
            <ExternalLink className="h-2.5 w-2.5 text-amber-400/70 ml-0.5" />
          </a>
        </div>
      </div>
    );
  }

  // Default Persistent Footer Bar
  return (
    <footer
      className={`mt-12 pt-4 pb-6 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground animate-in fade-in duration-300 ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
          <Coffee className="h-3.5 w-3.5" />
        </div>
        <div>
          <span className="font-medium text-foreground">Enjoying LadeTools?</span>{" "}
          <span className="text-muted-foreground hidden sm:inline">
            100% free, private & offline developer toolbox.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/30 text-foreground font-medium text-xs transition-all shadow-sm hover:shadow"
        >
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/40 shrink-0" />
          <span>Support Development</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground ml-0.5" />
        </a>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
          title="Dismiss for this session"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </footer>
  );
}

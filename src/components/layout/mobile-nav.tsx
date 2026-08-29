import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";
import { Wrench, X, Database, LayoutGrid } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
  dbStatus?: string;
}

export function MobileNav({
  isOpen,
  onClose,
  activeToolId,
  onSelectTool,
  dbStatus = "IndexedDB Ready",
}: MobileNavProps) {
  const isHome = activeToolId === "home";

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-card border-r border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <button
            onClick={() => {
              onSelectTool("home");
              onClose();
            }}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight">LadeTools</span>
              <span className="block text-[10px] text-muted-foreground">Mobile Navigation</span>
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tools Nav List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Overview Link */}
          <button
            onClick={() => {
              onSelectTool("home");
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium transition-colors mb-2 ${
              isHome
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  isHome ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div>All Tools Overview</div>
                <div className="text-[10px] opacity-75">Home landing page & toolbox summary</div>
              </div>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                isHome ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              Home
            </span>
          </button>

          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Available Tools
          </div>

          {TOOLS_REGISTRY.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeToolId === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div>{tool.name}</div>
                    <div className="text-[10px] opacity-75 line-clamp-1">{tool.description}</div>
                  </div>
                </div>

                {tool.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                      isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span>{dbStatus}</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

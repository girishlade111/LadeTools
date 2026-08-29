import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { PwaStatusBadge } from "@/components/pwa-install-prompt";
import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";
import { Menu, Moon, Sun, Wrench, LayoutGrid } from "lucide-react";

interface HeaderProps {
  activeToolId: ToolId;
  onOpenMobileNav: () => void;
  onNavigateHome?: () => void;
}

export function Header({ activeToolId, onOpenMobileNav, onNavigateHome }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const isHome = activeToolId === "home";
  const activeTool = TOOLS_REGISTRY.find((t) => t.id === activeToolId);
  const Icon = isHome ? LayoutGrid : activeTool?.icon || Wrench;
  const toolName = isHome ? "All Tools Overview" : activeTool?.name || "LadeTools";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Active Tool Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 rounded-lg"
          onClick={onOpenMobileNav}
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Mobile Logo Fallback */}
        <button
          onClick={onNavigateHome}
          className="flex md:hidden items-center gap-2 text-left"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-base tracking-tight">LadeTools</span>
        </button>

        {/* Desktop Active Tool Breadcrumb */}
        <div className="hidden md:flex items-center gap-2.5 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-foreground">{toolName}</span>
          {!isHome && activeTool?.badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono uppercase text-muted-foreground font-semibold">
              {activeTool.badge}
            </span>
          )}
          {isHome && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono uppercase font-semibold">
              5 Client-Side Tools
            </span>
          )}
        </div>
      </div>

      {/* Right: Actions, Offline Badge & Dark Mode */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:block">
          <PwaStatusBadge />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={`Toggle Theme (Current: ${theme})`}
          className="h-9 w-9 rounded-full"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700 transition-transform rotate-0" />
          )}
        </Button>
      </div>
    </header>
  );
}

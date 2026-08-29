import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";
import { Wrench, Database, Sparkles, LayoutGrid } from "lucide-react";

interface SidebarProps {
  activeToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
  dbStatus?: string;
}

export function Sidebar({ activeToolId, onSelectTool, dbStatus = "IndexedDB Ready" }: SidebarProps) {
  const isHome = activeToolId === "home";

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <button
        onClick={() => onSelectTool("home")}
        className="h-16 flex items-center gap-3 px-6 border-b border-border text-left hover:bg-muted/40 transition-colors w-full"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs border border-primary/20">
          <Wrench className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-xl tracking-tight text-foreground">
              LadeTools
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            OFFLINE STUDIO
          </span>
        </div>
      </button>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Home / Overview Link */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectTool("home")}
            className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs transition-all duration-150 relative select-none ${
              isHome
                ? "bg-secondary text-primary font-semibold border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
                  isHome
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-primary"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </div>
              <span className="truncate">Overview</span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tight shrink-0 transition-colors ${
                isHome
                  ? "bg-primary/10 text-primary font-semibold"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              Home
            </span>
          </button>
        </div>

        <div className="space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Developer Tools</span>
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{TOOLS_REGISTRY.length}</span>
          </div>

          <nav className="space-y-1">
            {TOOLS_REGISTRY.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs transition-all duration-150 relative select-none ${
                    isActive
                      ? "bg-secondary text-primary font-semibold border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{tool.name}</span>
                  </div>

                  {tool.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tight shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3.5 border-t border-border bg-card space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Database className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{dbStatus}</span>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </aside>
  );
}

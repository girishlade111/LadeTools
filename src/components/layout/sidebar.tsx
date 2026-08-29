import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";
import { Wrench, Database, Sparkles } from "lucide-react";

interface SidebarProps {
  activeToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
  dbStatus?: string;
}

export function Sidebar({ activeToolId, onSelectTool, dbStatus = "IndexedDB Ready" }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-md shadow-primary/20">
          <Wrench className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              LadeTools
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
            Client-Side Toolbox
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center justify-between">
            <span>Developer Tools</span>
            <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">{TOOLS_REGISTRY.length}</span>
          </div>

          <nav className="space-y-1">
            {TOOLS_REGISTRY.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeToolId === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 relative select-none ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted/80 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate">{tool.name}</span>
                  </div>

                  {tool.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tight shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted/80 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
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
      <div className="p-4 border-t border-border/60 bg-muted/20 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Database className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">{dbStatus}</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}

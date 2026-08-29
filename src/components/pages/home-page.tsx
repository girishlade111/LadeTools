import { useState } from "react";
import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";
import {
  Wrench,
  ShieldCheck,
  Database,
  Zap,
  ArrowRight,
  Search,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface HomePageProps {
  onSelectTool: (id: ToolId) => void;
}

export function HomePage({ onSelectTool }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.shortName.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <div className="text-center space-y-5 pt-4 sm:pt-8 max-w-3xl mx-auto">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-primary/25 bg-secondary text-primary font-mono text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>100% Client-Side &bull; Zero Server Uploads</span>
        </div>

        {/* Main Heading & Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Developer Utilities Without Compromise
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
            Fast, privacy-first developer tools built for speed and security. Everything executes in your browser memory — nothing ever leaves your device.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">Private & Local</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">IndexedDB History</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card">
            <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-foreground">Real-Time Debounced</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card">
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">Offline PWA</span>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="pt-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. json, jwt, base64, regex, uuid)..."
              className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-card font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-border">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span>Available Developer Tools</span>
            </h2>
            <p className="text-xs text-muted-foreground font-sans">
              Select a tool below to begin converting, formatting, or generating payloads.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          </span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-dashed border-border bg-card text-muted-foreground space-y-2">
            <p className="text-xs font-mono">No tools found matching "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-mono font-semibold text-primary hover:underline"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="group p-5 rounded-lg border border-border bg-card hover:border-primary/60 text-left transition-all duration-150 shadow-xs hover:shadow-sm flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-150">
                        <Icon className="h-4 w-4" />
                      </div>

                      {tool.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono uppercase font-semibold bg-muted text-muted-foreground border border-border group-hover:border-primary/30 group-hover:text-primary transition-colors">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between font-mono text-xs border-t border-border">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      Ready offline
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Open Tool</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust & Architecture Showcase */}
      <div className="p-6 rounded-lg border border-border bg-card space-y-4 shadow-xs">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Built with Privacy by Architecture</span>
          </h3>
          <p className="text-xs text-muted-foreground font-sans">
            Why developers choose LadeTools for sensitive keys, JWT tokens, and customer data:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-md bg-secondary/50 border border-border space-y-1">
            <div className="font-serif font-bold text-sm text-foreground">Zero Network Transmission</div>
            <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
              Every JSON parse, regex match, base64 conversion, and token decode happens strictly in your browser JS engine.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-secondary/50 border border-border space-y-1">
            <div className="font-serif font-bold text-sm text-foreground">IndexedDB Persistence</div>
            <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
              Your history stays safely in your local browser sandbox via Dexie.js — never uploaded to any remote database.
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-secondary/50 border border-border space-y-1">
            <div className="font-serif font-bold text-sm text-foreground">No Telemetry or Ads</div>
            <p className="text-[11px] text-muted-foreground font-sans leading-relaxed">
              Pure client-side utilities with zero third-party trackers, analytics, or intrusive paywalls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

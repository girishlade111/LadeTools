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
      <div className="text-center space-y-6 pt-4 sm:pt-8 max-w-3xl mx-auto">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>100% Client-Side &bull; Zero Server Uploads</span>
        </div>

        {/* Main Heading & Tagline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Developer Utilities Without Compromise
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fast, privacy-first developer tools built for speed and security. Everything executes in your browser memory — nothing ever leaves your device.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60">
            <Lock className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-foreground">Private & Local</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60">
            <Database className="h-3.5 w-3.5 text-blue-500" />
            <span className="font-medium text-foreground">IndexedDB History</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-medium text-foreground">Real-Time Debounced</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60">
            <Smartphone className="h-3.5 w-3.5 text-purple-500" />
            <span className="font-medium text-foreground">Offline PWA</span>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. json, jwt, base64, regex, uuid)..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span>Available Developer Tools</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a tool below to begin converting, formatting, or generating payloads.
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"}
          </span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground space-y-2">
            <p className="text-xs">No tools found matching "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-semibold text-primary hover:underline"
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
                  className="group p-5 rounded-2xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 text-left transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  {/* Subtle top ambient glow */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>

                      {tool.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-semibold bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-primary border-t border-border/40">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Ready offline
                    </span>
                    <span className="flex items-center gap-1 text-xs text-primary group-hover:translate-x-0.5 transition-transform">
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
      <div className="p-6 rounded-2xl border border-border/80 bg-gradient-to-br from-card/80 via-card/40 to-transparent space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Built with Privacy by Architecture</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Why developers choose LadeTools for sensitive keys, JWT tokens, and customer data:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <div className="font-semibold text-foreground">Zero Network Transmission</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every JSON parse, regex match, base64 conversion, and token decode happens strictly in your browser JS engine.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <div className="font-semibold text-foreground">IndexedDB Persistence</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your history stays safely in your local browser sandbox via Dexie.js — never uploaded to any remote database.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <div className="font-semibold text-foreground">No Telemetry or Ads</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Pure client-side utilities with zero third-party trackers, analytics, or intrusive paywalls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

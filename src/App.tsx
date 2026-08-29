import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { TOOLS_REGISTRY } from "@/components/tools";
import {
  Wrench,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  PlusCircle,
  Trash2,
} from "lucide-react";

export function App() {
  const { theme, setTheme } = useTheme();
  const [clickCount, setClickCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");

  // Dexie query test to verify IndexedDB is live
  const historyItems = useLiveQuery(() => db.history.toArray(), []);

  useEffect(() => {
    // Test Dexie database connection
    db.open()
      .then(() => setDbStatus("IndexedDB Ready (Persistent)"))
      .catch((err) => setDbStatus(`DB Error: ${err.message}`));
  }, []);

  const handleTestDatabaseAction = async () => {
    await db.history.add({
      toolId: "test-tool",
      toolName: `Sample Run #${(historyItems?.length || 0) + 1}`,
      input: "Hello LadeTools",
      createdAt: new Date(),
    });
  };

  const handleClearHistory = async () => {
    await db.history.clear();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-md shadow-primary/20">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                LadeTools
              </span>
              <span className="ml-2 hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary sm:inline-block border border-primary/20">
                v0.1.0-alpha
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Toggle theme (Current: ${theme})`}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-400 transition-transform rotate-0 scale-100" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700 transition-transform rotate-0 scale-100" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex gap-1.5"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              Offline Ready
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-2 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Client-Side Only • Local Storage • Privacy-First</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Developer Utilities{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Without the Cloud
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
            Welcome to <strong className="text-foreground">LadeTools</strong> — a fast, private,
            and modular toolbox. No server roundtrips, no accounts, zero tracking. All processing
            runs in your browser and persists via IndexedDB.
          </p>
        </section>

        {/* Verification & Component Showcase Card */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Setup Verification & shadcn/ui Tests */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h2 className="font-semibold text-lg">Setup & UI Verification</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                Active
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Testing Tailwind CSS design tokens, Radix primitives, and shadcn/ui button variants:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="default"
                onClick={() => setClickCount((c) => c + 1)}
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                Default Button ({clickCount})
              </Button>

              <Button
                variant="secondary"
                onClick={() => setClickCount((c) => c + 1)}
              >
                Secondary
              </Button>

              <Button
                variant="outline"
                onClick={() => setClickCount((c) => c + 1)}
              >
                Outline
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setClickCount(0)}
              >
                Reset Count
              </Button>

              <Button variant="ghost" size="sm">
                Ghost Variant
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 border border-border/50 text-xs font-mono space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>Vite + React:</span>
                <span className="text-foreground font-semibold">18.3.1</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>TypeScript:</span>
                <span className="text-foreground font-semibold">Strict Mode Enabled</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tailwind CSS:</span>
                <span className="text-foreground font-semibold">Dark / Light HSL Tokens</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>shadcn/ui:</span>
                <span className="text-foreground font-semibold">Configured (components.json)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Dexie & IndexedDB Persistence Test */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Dexie IndexedDB Test</h2>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {dbStatus}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Local offline state management via <code className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">dexie-react-hooks</code>:
            </p>

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleTestDatabaseAction}
              >
                <PlusCircle className="h-4 w-4" />
                Write Item to DB
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleClearHistory}
                disabled={!historyItems || historyItems.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear Local DB
              </Button>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 border border-border/50 max-h-36 overflow-y-auto space-y-2">
              <div className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Persisted History Records ({historyItems?.length || 0}):</span>
              </div>
              {!historyItems || historyItems.length === 0 ? (
                <div className="text-xs text-muted-foreground italic py-2 text-center">
                  No records stored yet. Click "Write Item to DB" to test local persistence.
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {historyItems.map((item) => (
                    <li
                      key={item.id}
                      className="text-xs font-mono bg-background/80 px-2.5 py-1.5 rounded border border-border/60 flex justify-between items-center"
                    >
                      <span className="font-medium text-foreground">{item.toolName}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Modular Tools Showcase Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Available Tool Modules</h2>
              <p className="text-sm text-muted-foreground">
                Multi-tool architecture ready for upcoming developer utilities
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <Layers className="h-4 w-4 text-primary" />
              <span>/src/components/tools</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS_REGISTRY.map((tool) => (
              <div
                key={tool.id}
                className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-primary font-medium">
                  <span className="capitalize text-muted-foreground">{tool.category}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>
          LadeTools &bull; Offline-First Client-Side Developer Utilities &bull; Local IndexedDB Storage
        </p>
      </footer>
    </div>
  );
}

export default App;

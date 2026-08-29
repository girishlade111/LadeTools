import { useState, useEffect } from "react";
import {
  db,
  clearHistory,
  clearAllHistory,
  useJsonHistory,
  useBase64History,
  useJwtHistory,
  useRegexHistory,
  useUuidHistory,
  addJsonHistory,
  addBase64History,
  addJwtHistory,
  addRegexHistory,
  addUuidHistory,
  type HistoryTableName,
} from "@/db";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { TOOLS_REGISTRY } from "@/components/tools";
import { PwaInstallPrompt, PwaStatusBadge } from "@/components/pwa-install-prompt";
import {
  Wrench,
  Database,
  Moon,
  Sun,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  PlusCircle,
  Trash2,
  HardDriveDownload,
  Braces,
  Binary,
  KeyRound,
  FileCode2,
  Hash,
  Terminal,
} from "lucide-react";

export function App() {
  const { theme, setTheme } = useTheme();
  const [clickCount, setClickCount] = useState(0);
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [activeTableTab, setActiveTableTab] = useState<HistoryTableName>("jsonHistory");

  // Typed Dexie live query hooks
  const jsonHistory = useJsonHistory();
  const base64History = useBase64History();
  const jwtHistory = useJwtHistory();
  const regexHistory = useRegexHistory();
  const uuidHistory = useUuidHistory();

  useEffect(() => {
    // Verify Dexie database connection
    db.open()
      .then(() => setDbStatus("LadeToolsDB Ready (v1)"))
      .catch((err) => setDbStatus(`DB Error: ${err.message}`));
  }, []);

  const handleAddSampleData = async (tableName: HistoryTableName) => {
    const timestamp = new Date().toLocaleTimeString();
    switch (tableName) {
      case "jsonHistory":
        await addJsonHistory(
          JSON.stringify({ tool: "JSON Validator", status: "success", time: timestamp })
        );
        break;
      case "base64History":
        await addBase64History(
          `Hello LadeTools at ${timestamp}`,
          btoa(`Hello LadeTools at ${timestamp}`),
          "encode"
        );
        break;
      case "jwtHistory":
        await addJwtHistory(
          `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxhZGVUb29scyIsImlhdCI6MTUxNjIzOTAyMn0.sample-${Date.now().toString().slice(-4)}`
        );
        break;
      case "regexHistory":
        await addRegexHistory(
          "[a-zA-Z0-9_-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
          "gim",
          `test@example.com (Created at ${timestamp})`
        );
        break;
      case "uuidHistory":
        await addUuidHistory(crypto.randomUUID(), "uuid");
        break;
    }
  };

  const tableStats: {
    key: HistoryTableName;
    name: string;
    icon: typeof Braces;
    count: number;
    description: string;
  }[] = [
    {
      key: "jsonHistory",
      name: "JSON History",
      icon: Braces,
      count: jsonHistory?.length || 0,
      description: "Validated & formatted JSON payloads",
    },
    {
      key: "base64History",
      name: "Base64 History",
      icon: Binary,
      count: base64History?.length || 0,
      description: "Encoded / decoded text & data strings",
    },
    {
      key: "jwtHistory",
      name: "JWT History",
      icon: KeyRound,
      count: jwtHistory?.length || 0,
      description: "Decoded tokens & claims inspection",
    },
    {
      key: "regexHistory",
      name: "Regex History",
      icon: FileCode2,
      count: regexHistory?.length || 0,
      description: "Patterns, flags & test string matches",
    },
    {
      key: "uuidHistory",
      name: "UUID History",
      icon: Hash,
      count: uuidHistory?.length || 0,
      description: "Generated UUIDs & timestamps",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
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
                IndexedDB Persistent
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PwaStatusBadge />

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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 pt-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium mb-2 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Client-Side Only • Local Storage • Typed Dexie Schema</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Developer Utilities{" "}
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Without the Cloud
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-muted-foreground text-base sm:text-lg">
            Welcome to <strong className="text-foreground">LadeTools</strong> — local-first
            developer toolbox. Zero server roundtrips, offline PWA, and reactive data persistence
            via typed IndexedDB hooks.
          </p>
        </section>

        {/* Dexie Multi-Table Schema & Reactive Live Query Verification Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">
                  IndexedDB Schema & Live Query Hooks
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Reactive Dexie database with 5 tool history tables (max 20 entries, sorted by createdAt desc)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                {dbStatus}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 text-destructive hover:text-destructive"
                onClick={() => clearAllHistory()}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All Tables
              </Button>
            </div>
          </div>

          {/* Table Tab Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tableStats.map((item) => {
              const Icon = item.icon;
              const isActive = activeTableTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTableTab(item.key)}
                  className={`p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between gap-2 ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-foreground truncate">{item.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">{item.key}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Table Viewer & Mutation Panel */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground font-mono">
                    {activeTableTab}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    (Hook: <code className="text-primary font-mono">use{activeTableTab.charAt(0).toUpperCase() + activeTableTab.slice(1)}()</code>)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-increments <code className="bg-muted px-1 py-0.5 rounded font-mono">id</code>, indexed by{" "}
                  <code className="bg-muted px-1 py-0.5 rounded font-mono">createdAt</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5 text-xs shadow-sm"
                  onClick={() => handleAddSampleData(activeTableTab)}
                >
                  <PlusCircle className="h-4 w-4" />
                  Insert Test Row
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs text-destructive hover:text-destructive"
                  onClick={() => clearHistory(activeTableTab)}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Table
                </Button>
              </div>
            </div>

            {/* Render Active Table Records */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-muted-foreground flex justify-between">
                <span>Recent Records (Max 20, reactive via useLiveQuery):</span>
                <span>
                  Console Debugger: <code className="text-foreground font-mono">window.ladeToolsDB.{activeTableTab}</code>
                </span>
              </div>

              {/* JSON History Render */}
              {activeTableTab === "jsonHistory" && (
                <div className="space-y-2">
                  {!jsonHistory || jsonHistory.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
                      No records in jsonHistory. Click "Insert Test Row" or run in console:
                      <code className="block mt-1 font-mono text-primary">
                        window.ladeToolsDB.jsonHistory.add(&#123; input: '&#123;"test": true&#125;', createdAt: new Date() &#125;)
                      </code>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {jsonHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs font-mono flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-muted-foreground text-[10px]">ID: #{item.id}</span>
                            <div className="text-foreground truncate max-w-xl">{item.input}</div>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Base64 History Render */}
              {activeTableTab === "base64History" && (
                <div className="space-y-2">
                  {!base64History || base64History.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
                      No records in base64History. Click "Insert Test Row" or run in console.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {base64History.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs font-mono flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-[10px]">ID: #{item.id}</span>
                              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px] uppercase font-semibold">
                                {item.mode}
                              </span>
                            </div>
                            <div className="text-foreground truncate max-w-xl">
                              In: {item.input} &rarr; Out: {item.output}
                            </div>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* JWT History Render */}
              {activeTableTab === "jwtHistory" && (
                <div className="space-y-2">
                  {!jwtHistory || jwtHistory.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
                      No records in jwtHistory. Click "Insert Test Row" or run in console.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {jwtHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs font-mono flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-muted-foreground text-[10px]">ID: #{item.id}</span>
                            <div className="text-foreground truncate max-w-xl">{item.token}</div>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Regex History Render */}
              {activeTableTab === "regexHistory" && (
                <div className="space-y-2">
                  {!regexHistory || regexHistory.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
                      No records in regexHistory. Click "Insert Test Row" or run in console.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {regexHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs font-mono flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-[10px]">ID: #{item.id}</span>
                              <span className="text-primary font-semibold">
                                /{item.pattern}/{item.flags}
                              </span>
                            </div>
                            <div className="text-muted-foreground truncate max-w-xl">
                              Test String: <span className="text-foreground">{item.testString}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* UUID History Render */}
              {activeTableTab === "uuidHistory" && (
                <div className="space-y-2">
                  {!uuidHistory || uuidHistory.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-lg">
                      No records in uuidHistory. Click "Insert Test Row" or run in console.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {uuidHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs font-mono flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-[10px]">ID: #{item.id}</span>
                              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary text-[10px] uppercase font-semibold">
                                {item.type}
                              </span>
                            </div>
                            <div className="text-foreground font-semibold truncate max-w-xl">
                              {item.value}
                            </div>
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Console Test Helper Snippet */}
            <div className="p-3 rounded-lg bg-muted/70 border border-border/50 flex items-start gap-2.5 text-xs">
              <Terminal className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-muted-foreground space-y-1">
                <div>
                  <strong className="text-foreground">Browser Console Testing:</strong> Open DevTools Console (F12) and type:
                </div>
                <code className="text-primary font-mono block bg-background/60 p-1.5 rounded border border-border/40 overflow-x-auto">
                  await window.ladeToolsDB.jsonHistory.add(&#123; input: '&#123;"consoleTest": 123&#125;', createdAt: new Date() &#125;)
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* UI Setup & Component Verification Card */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">UI Component Tests</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                Active
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Testing shadcn/ui button variants and micro-animations:
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
            </div>
          </div>

          {/* Architecture Status */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg pb-2 border-b border-border/60">
              System Architecture
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Database:</span>
                <span className="text-foreground font-semibold">Dexie.js IndexedDB (v1)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Reactivity:</span>
                <span className="text-foreground font-semibold">useLiveQuery (5 Typed Hooks)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">PWA Offline Cache:</span>
                <span className="text-emerald-400 font-semibold">Active (Cache-First)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">TypeScript:</span>
                <span className="text-foreground font-semibold">Strict Mode (Zero Errors)</span>
              </div>
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

      {/* PWA Floating Install Banner */}
      <PwaInstallPrompt />

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
          <p>LadeTools &bull; Offline-First Client-Side Developer Utilities</p>
          <div className="flex items-center gap-1 text-muted-foreground">
            <HardDriveDownload className="h-3.5 w-3.5 text-primary" />
            <span>Installable Web App</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

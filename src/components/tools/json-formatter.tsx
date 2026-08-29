import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useJsonHistory, addJsonHistory, deleteHistoryItem, clearHistory } from "@/db";
import { Braces, Play, CheckCircle2, AlertCircle } from "lucide-react";

export function JsonFormatterTool() {
  const [input, setInput] = useState(`{\n  "title": "LadeTools",\n  "status": "ready",\n  "offline": true\n}`);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = useJsonHistory();

  const handleFormat = async () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
      await addJsonHistory(input);
    } catch (err: unknown) {
      setError((err as Error).message);
      setOutput("");
    }
  };

  const handleMinify = async () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
      await addJsonHistory(input);
    } catch (err: unknown) {
      setError((err as Error).message);
      setOutput("");
    }
  };

  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => {
      let preview = item.input;
      try {
        const parsed = JSON.parse(item.input);
        preview = JSON.stringify(parsed);
      } catch {
        // fallback
      }
      return {
        id: item.id,
        label: preview.length > 50 ? `${preview.slice(0, 47)}...` : preview,
        secondaryLabel: item.input,
        createdAt: item.createdAt,
      };
    });

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setInput(item.input);
    try {
      const parsed = JSON.parse(item.input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message);
      setOutput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">JSON Formatter & Validator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Format, validate, prettify, and minify JSON payloads in your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="JSON History"
            description="Recent formatted & validated JSON inputs"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("jsonHistory", id)}
            onClearAll={() => clearHistory("jsonHistory")}
          />

          <Button variant="outline" size="sm" onClick={() => setInput("")} disabled={!input}>
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={handleMinify} disabled={!input}>
            Minify
          </Button>
          <Button variant="default" size="sm" className="gap-1.5" onClick={handleFormat} disabled={!input}>
            <Play className="h-3.5 w-3.5" />
            Format JSON
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>JSON Input</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">{input.length} chars</span>
              <CopyButton text={input} label="Copy Input" size="sm" className="h-6 px-2 text-[11px]" />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="w-full h-96 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none selection:bg-primary/20"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <span>Formatted Output</span>
              {output && !error && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Valid
                </span>
              )}
            </span>
            <CopyButton
              text={output}
              label="Copy Output"
              size="sm"
              className="h-6 px-2 text-[11px]"
            />
          </div>
          <div className="relative">
            {error ? (
              <div className="w-full h-96 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs space-y-2 overflow-auto">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Invalid JSON Syntax</span>
                </div>
                <p className="text-destructive/90 whitespace-pre-wrap">{error}</p>
              </div>
            ) : (
              <textarea
                readOnly
                value={output}
                placeholder="Formatted JSON output will appear here..."
                className="w-full h-96 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

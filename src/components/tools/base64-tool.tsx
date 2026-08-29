import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useBase64History, addBase64History, deleteHistoryItem, clearHistory } from "@/db";
import { Binary, RefreshCw } from "lucide-react";

export function Base64Tool() {
  const [input, setInput] = useState("Hello LadeTools Developer!");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const history = useBase64History();

  const handleProcess = async () => {
    try {
      if (mode === "encode") {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
        setError(null);
        await addBase64History(input, encoded, "encode");
      } else {
        const decoded = decodeURIComponent(escape(atob(input)));
        setOutput(decoded);
        setError(null);
        await addBase64History(input, decoded, "decode");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
      setOutput("");
    }
  };

  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: item.input.length > 40 ? `${item.input.slice(0, 37)}...` : item.input,
      secondaryLabel: `Result: ${item.output.length > 50 ? `${item.output.slice(0, 47)}...` : item.output}`,
      badge: item.mode,
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setInput(item.input);
    setOutput(item.output);
    setMode(item.mode);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Base64 Encoder & Decoder</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Encode plain text to Base64 or decode Base64 strings instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="Base64 History"
            description="Recent encoded & decoded strings"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("base64History", id)}
            onClearAll={() => clearHistory("base64History")}
          />

          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              onClick={() => {
                setMode("encode");
                setOutput("");
                setError(null);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === "encode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode("decode");
                setOutput("");
                setError(null);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                mode === "decode" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Decode
            </button>
          </div>
          <Button variant="default" size="sm" className="gap-1.5" onClick={handleProcess} disabled={!input}>
            <RefreshCw className="h-3.5 w-3.5" />
            {mode === "encode" ? "Encode to Base64" : "Decode Base64"}
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{mode === "encode" ? "Plain Text Input" : "Base64 Input"}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px]">{input.length} chars</span>
              <CopyButton text={input} label="Copy Input" size="sm" className="h-6 px-2 text-[11px]" />
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Type text to encode..." : "Paste Base64 string to decode..."}
            className="w-full h-96 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{mode === "encode" ? "Base64 Output" : "Decoded Text"}</span>
            <CopyButton text={output} label="Copy Output" size="sm" className="h-6 px-2 text-[11px]" />
          </div>
          {error ? (
            <div className="w-full h-96 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder="Output will appear here..."
              className="w-full h-96 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}

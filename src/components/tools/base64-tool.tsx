import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBase64History, addBase64History } from "@/db";
import { Binary, Copy, Check, History, RefreshCw } from "lucide-react";

export function Base64Tool() {
  const [input, setInput] = useState("Hello LadeTools Developer!");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
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

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        <div className="flex items-center gap-2">
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
          <Button variant="default" size="sm" className="gap-1.5" onClick={handleProcess}>
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
            <span className="font-mono text-[11px]">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Type text to encode..." : "Paste Base64 string to decode..."}
            className="w-full h-80 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{mode === "encode" ? "Base64 Output" : "Decoded Text"}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs gap-1"
              onClick={handleCopy}
              disabled={!output}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          {error ? (
            <div className="w-full h-80 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder="Output will appear here..."
              className="w-full h-80 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          )}
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <History className="h-4 w-4 text-primary" />
            <span>Recent Base64 Runs ({history?.length || 0})</span>
          </div>
        </div>
        {history && history.length > 0 ? (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setInput(item.input);
                  setOutput(item.output);
                  setMode(item.mode);
                }}
                className="cursor-pointer p-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/70 text-xs font-mono flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase font-semibold">
                    {item.mode}
                  </span>
                  <span className="truncate max-w-sm text-foreground">{item.input}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">No past runs recorded yet.</p>
        )}
      </div>
    </div>
  );
}

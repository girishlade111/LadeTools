import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUuidHistory, addUuidHistory } from "@/db";
import { Hash, Sparkles, Copy, Check, History, Clock } from "lucide-react";

export function UuidGeneratorTool() {
  const [generatedItems, setGeneratedItems] = useState<string[]>([
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const history = useUuidHistory();

  const handleGenerateUuids = async (count = 5) => {
    const newUuids = Array.from({ length: count }, () => crypto.randomUUID());
    setGeneratedItems(newUuids);
    await addUuidHistory(newUuids[0], "uuid");
  };

  const handleGenerateTimestamp = async () => {
    const now = Date.now();
    const iso = new Date().toISOString();
    const list = [
      `Unix Epoch (ms): ${now}`,
      `Unix Epoch (sec): ${Math.floor(now / 1000)}`,
      `ISO 8601: ${iso}`,
      `UTC String: ${new Date().toUTCString()}`,
    ];
    setGeneratedItems(list);
    await addUuidHistory(`${now} (${iso})`, "timestamp");
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">UUID & Timestamp Generator</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate cryptographically secure UUIDs (v4) and convert Unix Epoch timestamps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleGenerateTimestamp}>
            <Clock className="h-3.5 w-3.5" />
            Current Timestamps
          </Button>
          <Button variant="default" size="sm" className="gap-1.5" onClick={() => handleGenerateUuids(5)}>
            <Sparkles className="h-3.5 w-3.5" />
            Generate UUIDs
          </Button>
        </div>
      </div>

      {/* Generated Outputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Generated Values</span>
          <span>Click any row to copy</span>
        </div>

        <div className="space-y-2">
          {generatedItems.map((val, idx) => (
            <div
              key={idx}
              onClick={() => handleCopy(val, idx)}
              className="group cursor-pointer p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all duration-150 flex items-center justify-between font-mono text-xs"
            >
              <span className="text-foreground font-medium select-all">{val}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1 opacity-80 group-hover:opacity-100"
              >
                {copiedIndex === idx ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <History className="h-4 w-4 text-primary" />
            <span>Recent UUID/Timestamp History ({history?.length || 0})</span>
          </div>
        </div>
        {history && history.length > 0 ? (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => handleCopy(item.value, 999)}
                className="cursor-pointer p-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/70 text-xs font-mono flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] uppercase font-semibold">
                    {item.type}
                  </span>
                  <span className="text-foreground truncate max-w-sm">{item.value}</span>
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

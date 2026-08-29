import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useUuidHistory, addUuidHistory, deleteHistoryItem, clearHistory } from "@/db";
import { Hash, Sparkles, Clock } from "lucide-react";

export function UuidGeneratorTool() {
  const [generatedItems, setGeneratedItems] = useState<string[]>([
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
  ]);
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

  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: item.value,
      badge: item.type,
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setGeneratedItems([item.value]);
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

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="UUID & Timestamp History"
            description="Recent generated UUIDs & timestamp conversions"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("uuidHistory", id)}
            onClearAll={() => clearHistory("uuidHistory")}
          />

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
          <span>Generated Values ({generatedItems.length})</span>
          <CopyButton
            text={generatedItems.join("\n")}
            label="Copy All Values"
            size="sm"
            className="h-6 px-2 text-[11px]"
          />
        </div>

        <div className="space-y-2">
          {generatedItems.map((val, idx) => (
            <div
              key={idx}
              className="group p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-150 flex items-center justify-between font-mono text-xs"
            >
              <span className="text-foreground font-medium select-all truncate max-w-xl">{val}</span>
              <CopyButton text={val} label="Copy" size="sm" className="h-7 px-2.5 text-xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useRegexHistory, addRegexHistory, deleteHistoryItem, clearHistory } from "@/db";
import { FileCode2, Play, AlertCircle } from "lucide-react";

export function RegexTesterTool() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
  const [flags, setFlags] = useState("gim");
  const [testString, setTestString] = useState("Contact us at support@ladetools.dev or admin@example.org for offline toolbox help.");
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const history = useRegexHistory();

  const handleTestRegex = async () => {
    try {
      const regex = new RegExp(pattern, flags);
      const matched = testString.match(regex);
      setMatches(matched ? Array.from(matched) : []);
      setError(null);
      await addRegexHistory(pattern, flags, testString);
    } catch (err: unknown) {
      setError((err as Error).message);
      setMatches([]);
    }
  };

  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: `/${item.pattern}/${item.flags}`,
      secondaryLabel: `Test: ${item.testString.length > 50 ? `${item.testString.slice(0, 47)}...` : item.testString}`,
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setPattern(item.pattern);
    setFlags(item.flags);
    setTestString(item.testString);

    try {
      const regex = new RegExp(item.pattern, item.flags);
      const matched = item.testString.match(regex);
      setMatches(matched ? Array.from(matched) : []);
      setError(null);
    } catch (err: unknown) {
      setError((err as Error).message);
      setMatches([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <FileCode2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regex Tester & Evaluator</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Test and evaluate Regular Expressions in real-time with customizable flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="Regex History"
            description="Recent regular expression patterns & test strings"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("regexHistory", id)}
            onClearAll={() => clearHistory("regexHistory")}
          />

          <Button variant="default" size="sm" className="gap-1.5" onClick={handleTestRegex} disabled={!pattern}>
            <Play className="h-3.5 w-3.5" />
            Test Expression
          </Button>
        </div>
      </div>

      {/* Pattern Input & Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Regular Expression Pattern</span>
            <CopyButton text={`/${pattern}/${flags}`} label="Copy Regex" size="sm" className="h-6 px-2 text-[11px]" />
          </div>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. ^[a-z0-9_-]+$"
            className="w-full h-10 px-3 rounded-lg border border-border bg-card font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Flags</label>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="gim"
            className="w-full h-10 px-3 rounded-lg border border-border bg-card font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Test String & Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Test String</span>
            <CopyButton text={testString} label="Copy Text" size="sm" className="h-6 px-2 text-[11px]" />
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type text to match against..."
            className="w-full h-80 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Match Results ({matches.length})</span>
            <CopyButton
              text={matches.join("\n")}
              label="Copy Matches"
              size="sm"
              className="h-6 px-2 text-[11px]"
              disabled={matches.length === 0}
            />
          </div>
          {error ? (
            <div className="w-full h-80 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Regex Syntax Error:</strong> {error}
              </div>
            </div>
          ) : (
            <div className="w-full h-80 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs space-y-2 overflow-y-auto">
              {matches.length === 0 ? (
                <div className="text-muted-foreground italic text-center py-16">
                  No matches found. Check your pattern or click "Test Expression".
                </div>
              ) : (
                matches.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg border border-border/50 bg-background/80 flex items-center justify-between"
                  >
                    <span className="text-foreground font-semibold">{m}</span>
                    <div className="flex items-center gap-2">
                      <CopyButton text={m} showIconOnly className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted" />
                      <span className="text-[10px] text-muted-foreground">#{idx + 1}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

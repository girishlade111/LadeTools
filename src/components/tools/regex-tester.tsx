import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useRegexHistory, addRegexHistory, deleteHistoryItem, clearHistory } from "@/db";
import {
  evaluateRegex,
  REGEX_PRESETS,
  type RegexEvaluationResult,
  type RegexPreset,
} from "@/lib/regex";
import {
  FileCode2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
  ListTree,
  Layers,
} from "lucide-react";

const DEFAULT_PRESET = REGEX_PRESETS[0]; // Email

export function RegexTesterTool() {
  const [pattern, setPattern] = useState<string>(DEFAULT_PRESET.pattern);
  const [flags, setFlags] = useState<string>(DEFAULT_PRESET.flags);
  const [testString, setTestString] = useState<string>(DEFAULT_PRESET.sampleText);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESET.id);

  const [evaluation, setEvaluation] = useState<RegexEvaluationResult>(() =>
    evaluateRegex(DEFAULT_PRESET.pattern, DEFAULT_PRESET.flags, DEFAULT_PRESET.sampleText)
  );

  const history = useRegexHistory();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(`${DEFAULT_PRESET.pattern}:::${DEFAULT_PRESET.flags}:::${DEFAULT_PRESET.sampleText}`);

  // Flag definitions
  const FLAG_OPTIONS = [
    { key: "g", name: "global", label: "Global", desc: "Don't return after first match (find all matches)" },
    { key: "i", name: "ignoreCase", label: "Case-insensitive", desc: "Case-insensitive search (match A and a)" },
    { key: "m", name: "multiline", label: "Multiline", desc: "^ and $ match the start/end of each line" },
    { key: "s", name: "dotAll", label: "dotAll (s)", desc: ". matches any character, including newline" },
    { key: "u", name: "unicode", label: "Unicode (u)", desc: "Treat pattern as a sequence of Unicode code points" },
  ];

  // Toggle individual flag
  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(new RegExp(flagChar, "g"), ""));
    } else {
      setFlags(flags + flagChar);
    }
  };

  // Process evaluation
  const runEvaluation = useCallback(
    (currentPattern: string, currentFlags: string, currentTestString: string) => {
      const res = evaluateRegex(currentPattern, currentFlags, currentTestString);
      setEvaluation(res);

      const combinedKey = `${currentPattern}:::${currentFlags}:::${currentTestString}`;
      if (
        res.isValid &&
        currentPattern.trim() &&
        currentTestString.trim() &&
        combinedKey !== lastSavedRef.current
      ) {
        lastSavedRef.current = combinedKey;
        addRegexHistory(currentPattern, currentFlags, currentTestString);
      }
    },
    []
  );

  // Debounced live evaluation (~300ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      runEvaluation(pattern, flags, testString);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [pattern, flags, testString, runEvaluation]);

  // Load preset
  const handleSelectPreset = (preset: RegexPreset) => {
    setSelectedPresetId(preset.id);
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setTestString(preset.sampleText);
    const res = evaluateRegex(preset.pattern, preset.flags, preset.sampleText);
    setEvaluation(res);
    lastSavedRef.current = `${preset.pattern}:::${preset.flags}:::${preset.sampleText}`;
  };

  // History Drawer items mapping
  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: `/${item.pattern}/${item.flags}`,
      secondaryLabel: `Test: ${item.testString.length > 50 ? `${item.testString.slice(0, 47)}...` : item.testString}`,
      badge: `${item.flags.length} flags`,
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setPattern(item.pattern);
    setFlags(item.flags);
    setTestString(item.testString);
    const res = evaluateRegex(item.pattern, item.flags, item.testString);
    setEvaluation(res);
    lastSavedRef.current = `${item.pattern}:::${item.flags}:::${item.testString}`;
  };

  // Safe React elements rendering for match highlights (No dangerouslySetInnerHTML / XSS safe)
  const highlightedTestNodes = useMemo(() => {
    if (!evaluation.isValid || evaluation.matches.length === 0 || !testString) {
      return <span>{testString}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    evaluation.matches.forEach((m, idx) => {
      // Unmatched leading substring
      if (m.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}`}>{testString.slice(lastIndex, m.startIndex)}</span>
        );
      }

      // Zero-length match (e.g. ^ or \b or a*)
      if (m.startIndex === m.endIndex) {
        elements.push(
          <span
            key={`zero-${idx}`}
            className="inline-block w-1 h-3.5 bg-amber-400 align-middle mx-0.5 rounded-sm animate-pulse"
            title={`Zero-width Match #${m.matchIndex} at index ${m.startIndex}`}
          />
        );
        lastIndex = m.startIndex;
      } else if (m.startIndex >= lastIndex) {
        // Normal match with alternating high-contrast highlight
        const matchContent = testString.slice(m.startIndex, m.endIndex);
        const isEven = idx % 2 === 0;

        elements.push(
          <mark
            key={`match-${idx}`}
            className={`rounded px-1 py-0.5 font-semibold transition-colors selection:bg-primary/30 ${
              isEven
                ? "bg-amber-500/20 text-amber-300 border-b-2 border-amber-500 shadow-sm"
                : "bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-500 shadow-sm"
            }`}
            title={`Match #${m.matchIndex} [${m.startIndex}..${m.endIndex}]${
              m.groups.length > 0
                ? ` • ${m.groups.length} group(s): ${m.groups.map((g) => (g.name ? `${g.name}: "${g.value}"` : `"${g.value}"`)).join(", ")}`
                : ""
            }`}
          >
            {matchContent}
          </mark>
        );
        lastIndex = m.endIndex;
      }
    });

    // Trailing unmatched text
    if (lastIndex < testString.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{testString.slice(lastIndex)}</span>
      );
    }

    return elements;
  }, [evaluation, testString]);

  // Formatted match summary text for clipboard copy
  const formattedMatchesCopyText = useMemo(() => {
    if (!evaluation.matches.length) return "";
    return evaluation.matches
      .map((m) => {
        let text = `Match ${m.matchIndex}: "${m.matchText}" [Index: ${m.startIndex}..${m.endIndex}]`;
        if (m.groups.length > 0) {
          const groupsText = m.groups
            .map((g) => `  Group ${g.index}${g.name ? ` (${g.name})` : ""}: "${g.value}"`)
            .join("\n");
          text += `\n${groupsText}`;
        }
        return text;
      })
      .join("\n\n");
  }, [evaluation.matches]);

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Regex Tester & Evaluator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Test and debug JavaScript Regular Expressions in real-time with live match highlighting and capture groups.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="Regex History"
            description="Recent regular expression patterns & test strings"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("regexHistory", id)}
            onClearAll={() => clearHistory("regexHistory")}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleSelectPreset(DEFAULT_PRESET)}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Sample
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPattern("");
              setTestString("");
              setEvaluation({ isValid: true, matches: [], totalMatches: 0, executionTimeMs: 0 });
            }}
            disabled={!pattern && !testString}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Preset Patterns Quick Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Popular Regex Presets</span>
          </div>
          <span className="text-[11px]">{REGEX_PRESETS.length} templates available</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {REGEX_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id && pattern === p.pattern;
            return (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card hover:bg-muted/70 text-foreground border-border"
                }`}
                title={p.description}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Regex Literal Input & Flags Bar */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-card/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <span>Regular Expression Literal</span>
            {evaluation.isValid && pattern && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Valid Pattern
              </span>
            )}
          </label>

          <CopyButton
            text={`/${pattern}/${flags}`}
            label="Copy Regex Literal"
            size="sm"
            className="h-6 px-2 text-[11px] self-start sm:self-auto"
          />
        </div>

        {/* Literal Syntax Input Row: / pattern / flags */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/60 transition-all">
          <span className="text-muted-foreground font-mono font-bold text-lg px-2 select-none">
            /
          </span>

          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern (e.g. [a-z0-9]+)..."
            className="flex-1 bg-transparent font-mono text-xs text-foreground focus:outline-none placeholder:text-muted-foreground/60 py-1"
            spellCheck={false}
          />

          <span className="text-muted-foreground font-mono font-bold text-lg px-2 select-none">
            /
          </span>

          {/* Quick Flags Interactive Chips */}
          <div className="flex items-center gap-1 shrink-0 pr-1">
            {FLAG_OPTIONS.map((f) => {
              const active = flags.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggleFlag(f.key)}
                  className={`h-7 px-2 rounded-md font-mono text-xs font-bold transition-all ${
                    active
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title={`${f.label} (${f.key}): ${f.desc}`}
                >
                  {f.key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flags Description Bar */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-0.5">
          <span className="font-semibold text-foreground/80">Active Flags:</span>
          {FLAG_OPTIONS.filter((f) => flags.includes(f.key)).length === 0 ? (
            <span className="italic">None (Single match, case-sensitive)</span>
          ) : (
            FLAG_OPTIONS.filter((f) => flags.includes(f.key)).map((f) => (
              <span key={f.key} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded font-mono">
                <span className="font-bold text-amber-400">{f.key}</span>
                <span className="text-muted-foreground">({f.label})</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Error Alert Box (if SyntaxError in RegExp) */}
      {!evaluation.isValid && evaluation.error && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs space-y-2 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Regex Syntax Error</h3>
            <p className="font-mono text-destructive/90">{evaluation.error}</p>
            <div className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
              <p>Common issues: unescaped special characters (e.g. <code className="text-foreground">[</code>, <code className="text-foreground">(</code>, <code className="text-foreground">\</code>), invalid quantifiers, or unmatched parentheses.</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor & Highlight Split-Pane Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Test String Input */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Test String</span>
              <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                {testString.length} chars
              </span>
            </div>

            <CopyButton text={testString} label="Copy Test Text" size="sm" className="h-6 px-2 text-[11px]" />
          </div>

          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Type or paste text to test against your regular expression..."
            className="w-full h-80 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none selection:bg-primary/20"
            spellCheck={false}
          />
        </div>

        {/* Right Pane: Live Highlighted Match Viewer */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Live Match Highlighting</span>
              {evaluation.isValid && (
                <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                  evaluation.totalMatches > 0
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {evaluation.totalMatches} {evaluation.totalMatches === 1 ? "match" : "matches"}
                </span>
              )}
            </div>

            {evaluation.totalMatches > 0 && (
              <span className="text-[11px] text-muted-foreground font-mono">
                {evaluation.executionTimeMs}ms
              </span>
            )}
          </div>

          <div className="w-full h-80 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
            {!testString.trim() ? (
              <div className="text-muted-foreground/60 italic text-center py-28">
                Enter a test string on the left to see live highlighted matches here.
              </div>
            ) : !pattern.trim() ? (
              <div className="text-muted-foreground/60 italic text-center py-28">
                Enter a regular expression pattern above to evaluate.
              </div>
            ) : evaluation.totalMatches === 0 ? (
              <div className="text-muted-foreground/60 italic text-center py-28">
                No matches found in the test string.
              </div>
            ) : (
              highlightedTestNodes
            )}
          </div>
        </div>
      </div>

      {/* Match Summary & Capture Groups Breakdown Panel */}
      <div className="space-y-3 p-4 rounded-xl border border-border bg-card/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ListTree className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Match Results & Capture Groups
            </h2>
            <span className="text-[11px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {evaluation.totalMatches} {evaluation.totalMatches === 1 ? "match" : "matches"}
            </span>
          </div>

          <CopyButton
            text={formattedMatchesCopyText}
            label="Copy All Matches"
            size="sm"
            className="h-6 px-2.5 text-[11px] self-start sm:self-auto"
            disabled={evaluation.totalMatches === 0}
          />
        </div>

        {evaluation.totalMatches === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-8">
            {pattern ? "No matches found with current pattern and flags." : "Awaiting regular expression pattern..."}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {evaluation.matches.map((m) => (
              <div
                key={m.matchIndex}
                className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2 text-xs"
              >
                {/* Match Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 font-mono">
                      #{m.matchIndex}
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      Index: [{m.startIndex}..{m.endIndex}] &bull; {m.matchText.length} chars
                    </span>
                  </div>

                  <CopyButton
                    text={m.matchText}
                    label="Copy Match"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                  />
                </div>

                {/* Match text */}
                <div className="p-2 rounded bg-card border border-border/50 font-mono text-xs text-foreground font-semibold break-all">
                  {m.matchText}
                </div>

                {/* Capture Groups Breakdown */}
                {m.groups.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3 text-sky-400" />
                      Captured Groups ({m.groups.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {m.groups.map((g) => (
                        <div
                          key={g.index}
                          className="p-2 rounded bg-muted/40 border border-border/40 text-[11px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between text-muted-foreground font-mono">
                            <span className="font-semibold text-sky-400">
                              {g.name ? `$${g.name}` : `Group ${g.index}`}
                            </span>
                            <span className="text-[10px]">({g.value?.length ?? 0} chars)</span>
                          </div>
                          <div className="font-mono text-foreground font-medium truncate" title={g.value}>
                            {g.value !== undefined ? `"${g.value}"` : <span className="text-muted-foreground italic">undefined</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

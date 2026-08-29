import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { JsonTreeView } from "./json/json-tree-view";
import { JsonSyntaxHighlighter } from "./json/json-syntax-highlighter";
import { validateJson, type JsonValidationResult } from "./json/json-validator";
import { useJsonHistory, addJsonHistory, deleteHistoryItem, clearHistory } from "@/db";
import {
  Braces,
  Play,
  Minimize2,
  Maximize2,
  FolderTree,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SAMPLE_NESTED_JSON = JSON.stringify(
  {
    appName: "LadeTools",
    version: "0.1.0",
    features: {
      clientSideOnly: true,
      pwa: {
        enabled: true,
        caching: "CacheFirst",
        manifest: {
          display: "standalone",
          themeColor: "#0a0d14",
        },
      },
      offlineStorage: {
        engine: "IndexedDB",
        orm: "Dexie.js",
        tables: ["jsonHistory", "base64History", "jwtHistory", "regexHistory", "uuidHistory"],
        stats: {
          records: 120,
          performanceMs: 4.2,
          isEncrypted: false,
        },
      },
    },
    tools: [
      { id: "json", name: "JSON Formatter", category: "formatters", status: "active" },
      { id: "base64", name: "Base64 Tool", category: "converters", status: "active" },
      { id: "jwt", name: "JWT Decoder", category: "crypto", status: "active" },
    ],
  },
  null,
  2
);

type OutputViewMode = "tree" | "code";

export function JsonFormatterTool() {
  const [input, setInput] = useState<string>(SAMPLE_NESTED_JSON);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [viewMode, setViewMode] = useState<OutputViewMode>("tree");
  const [validation, setValidation] = useState<JsonValidationResult>(() =>
    validateJson(SAMPLE_NESTED_JSON, 2)
  );
  const [expandAllTrigger, setExpandAllTrigger] = useState(0);
  const [collapseAllTrigger, setCollapseAllTrigger] = useState(0);

  const history = useJsonHistory();
  const lastSavedInput = useRef<string>(SAMPLE_NESTED_JSON.trim());
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced real-time validation (~300ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const res = validateJson(input, indentSize);
      setValidation(res);

      // Auto-save valid formatted JSON to IndexedDB after pause if changed and non-empty
      if (res.isValid && input.trim() && input.trim() !== lastSavedInput.current) {
        lastSavedInput.current = input.trim();
        addJsonHistory(input.trim());
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input, indentSize]);

  // Format action (pretty print)
  const handleFormat = useCallback(() => {
    const res = validateJson(input, indentSize);
    setValidation(res);
    if (res.isValid && res.formattedJson) {
      setInput(res.formattedJson);
      if (res.formattedJson !== lastSavedInput.current) {
        lastSavedInput.current = res.formattedJson;
        addJsonHistory(res.formattedJson);
      }
    }
  }, [input, indentSize]);

  // Minify action (single line compact)
  const handleMinify = useCallback(() => {
    const res = validateJson(input, indentSize);
    setValidation(res);
    if (res.isValid && res.minifiedJson) {
      setInput(res.minifiedJson);
      if (res.minifiedJson !== lastSavedInput.current) {
        lastSavedInput.current = res.minifiedJson;
        addJsonHistory(res.minifiedJson);
      }
    }
  }, [input, indentSize]);

  // Load sample nested JSON
  const handleLoadSample = () => {
    setInput(SAMPLE_NESTED_JSON);
    setValidation(validateJson(SAMPLE_NESTED_JSON, indentSize));
  };

  // History Drawer mapping
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
        label: preview.length > 45 ? `${preview.slice(0, 42)}...` : preview,
        secondaryLabel: item.input,
        createdAt: item.createdAt,
      };
    });

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setInput(item.input);
    const res = validateJson(item.input, indentSize);
    setValidation(res);
    lastSavedInput.current = item.input.trim();
  };

  const outputFormattedText = validation.formattedJson || "";

  return (
    <div className="space-y-6">
      {/* Tool Header & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Braces className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">JSON Formatter & Validator</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Validate syntax in real-time, inspect interactive tree views, format and minify.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="JSON History"
            description="Recent formatted and validated JSON payloads"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("jsonHistory", id)}
            onClearAll={() => clearHistory("jsonHistory")}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleLoadSample}
            title="Load deeply nested sample JSON"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Sample
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput("")}
            disabled={!input}
            className="text-xs"
          >
            Clear
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleMinify}
            disabled={!input || !validation.isValid}
            className="text-xs gap-1"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Minify
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleFormat}
            disabled={!input || !validation.isValid}
            className="gap-1.5 text-xs shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Format
          </Button>
        </div>
      </div>

      {/* Split-Pane Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Input Editor */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">JSON Input</span>
              <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                {input.length} chars
              </span>
            </div>

            <div className="flex items-center gap-2">
              <CopyButton
                text={input}
                label="Copy Input"
                size="sm"
                className="h-6 px-2 text-[11px]"
              />
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste or type raw JSON here..."
              className={`w-full h-[520px] p-4 rounded-xl border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 resize-none selection:bg-primary/20 ${
                validation.error && input.trim()
                  ? "border-destructive/60 focus:ring-destructive/40"
                  : "border-border focus:ring-primary/40"
              }`}
              spellCheck={false}
            />

            {/* Floating Validation Status Badge */}
            <div className="absolute bottom-3 right-3 pointer-events-none">
              {validation.isValid ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold backdrop-blur-md shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Valid JSON</span>
                </div>
              ) : input.trim() ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold backdrop-blur-md shadow-sm">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>
                    Invalid{validation.error?.line ? ` (Line ${validation.error.line})` : ""}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Pane: Formatted Output / Tree View */}
        <div className="flex flex-col space-y-2">
          {/* Header Controls for Output Pane */}
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            {/* View Mode Switcher: Tree View vs Code View */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                onClick={() => setViewMode("tree")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  viewMode === "tree"
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderTree className="h-3.5 w-3.5 text-primary" />
                <span>Tree View</span>
              </button>

              <button
                onClick={() => setViewMode("code")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                  viewMode === "code"
                    ? "bg-card text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="h-3.5 w-3.5 text-primary" />
                <span>Code View</span>
              </button>
            </div>

            {/* Tree expansion & Copy controls */}
            <div className="flex items-center gap-1.5">
              {viewMode === "tree" && validation.isValid && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-muted-foreground gap-1"
                    onClick={() => setExpandAllTrigger((prev) => prev + 1)}
                    title="Expand all tree nodes"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Expand</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-muted-foreground gap-1"
                    onClick={() => setCollapseAllTrigger((prev) => prev + 1)}
                    title="Collapse all tree nodes"
                  >
                    <Minimize2 className="h-3 w-3" />
                    <span>Collapse</span>
                  </Button>
                </>
              )}

              {viewMode === "code" && (
                <div className="flex items-center gap-1 text-[11px] mr-1">
                  <span className="text-muted-foreground">Indent:</span>
                  <select
                    value={indentSize}
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                    className="bg-card border border-border rounded px-1.5 py-0.5 text-[11px] text-foreground focus:outline-none"
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                  </select>
                </div>
              )}

              <CopyButton
                text={outputFormattedText}
                label="Copy Output"
                size="sm"
                className="h-6 px-2.5 text-[11px]"
                disabled={!validation.isValid || !outputFormattedText}
              />
            </div>
          </div>

          {/* Output Content Area */}
          <div className="relative rounded-xl border border-border bg-card/70 h-[520px] overflow-hidden flex flex-col shadow-inner">
            {!input.trim() ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground space-y-2">
                <Braces className="h-10 w-10 text-muted-foreground/40" />
                <div className="font-semibold text-xs text-foreground">Waiting for JSON input</div>
                <p className="text-[11px] max-w-xs leading-relaxed">
                  Type or paste JSON on the left, or click "Sample" above to format and validate.
                </p>
              </div>
            ) : !validation.isValid ? (
              /* Error Display Pane */
              <div className="flex-1 p-6 bg-destructive/5 text-destructive overflow-auto space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/10">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm">JSON Syntax Error</h3>
                    <p className="text-xs font-mono text-destructive/90">
                      {validation.error?.message}
                    </p>
                    {validation.error?.line && (
                      <div className="text-xs font-semibold text-destructive mt-2">
                        Location: Line {validation.error.line}
                        {validation.error.column ? `, Column ${validation.error.column}` : ""}
                      </div>
                    )}
                  </div>
                </div>

                {validation.error?.snippet && (
                  <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 font-mono text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-destructive/70">
                      Problematic Line:
                    </div>
                    <div className="text-foreground font-semibold">
                      {validation.error.snippet}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  <p>Common JSON issues:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                    <li>Trailing commas after the last item in an object or array</li>
                    <li>Single quotes instead of double quotes for keys or strings</li>
                    <li>Unquoted object property keys</li>
                    <li>Unescaped control characters or backslashes</li>
                  </ul>
                </div>
              </div>
            ) : viewMode === "tree" ? (
              /* Recursive Interactive Tree View */
              <div className="flex-1 overflow-auto">
                <JsonTreeView
                  data={validation.data}
                  defaultExpandedDepth={3}
                  expandAllTrigger={expandAllTrigger}
                  collapseAllTrigger={collapseAllTrigger}
                />
              </div>
            ) : (
              /* Syntax Highlighted Code View with Line Numbers */
              <div className="flex-1 overflow-auto">
                <JsonSyntaxHighlighter jsonString={outputFormattedText} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

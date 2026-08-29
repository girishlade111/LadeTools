import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { utf8ToBase64, base64ToUtf8, fileToBase64 } from "@/lib/base64";
import { useBase64History, addBase64History, deleteHistoryItem, clearHistory } from "@/db";
import {
  Binary,
  ArrowDownUp,
  Upload,
  Sparkles,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
} from "lucide-react";

type Base64Mode = "encode" | "decode";
type OutputFormat = "raw" | "dataUri";

const SAMPLE_TEXT = "Hello World! 🚀 🔒 Built with LadeTools — 100% Client-Side UTF-8 & Emoji support: 日本語, Español, Français, 🌍";

export function Base64Tool() {
  const [mode, setMode] = useState<Base64Mode>("encode");
  const [input, setInput] = useState<string>(SAMPLE_TEXT);
  const [output, setOutput] = useState<string>(() => utf8ToBase64(SAMPLE_TEXT));
  const [error, setError] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("raw");
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    mimeType: string;
    sizeBytes: number;
    dataUrl: string;
    rawBase64: string;
  } | null>(null);

  const history = useBase64History();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>(SAMPLE_TEXT);

  // Process conversion
  const processConversion = useCallback(
    (textToProcess: string, currentMode: Base64Mode) => {
      const trimmed = textToProcess.trim();
      if (!trimmed) {
        setOutput("");
        setError(null);
        return;
      }

      if (currentMode === "encode") {
        try {
          const encoded = utf8ToBase64(textToProcess);
          setOutput(encoded);
          setError(null);

          // Auto-save history if changed
          if (trimmed !== lastSavedRef.current) {
            lastSavedRef.current = trimmed;
            addBase64History(textToProcess, encoded, "encode");
          }
        } catch (err: unknown) {
          setError((err as Error)?.message || "Encoding failed.");
          setOutput("");
        }
      } else {
        // Decode mode
        try {
          const decoded = base64ToUtf8(textToProcess);
          setOutput(decoded);
          setError(null);

          // Auto-save history if changed
          if (trimmed !== lastSavedRef.current) {
            lastSavedRef.current = trimmed;
            addBase64History(textToProcess, decoded, "decode");
          }
        } catch (err: unknown) {
          setError((err as Error)?.message || "Invalid Base64 string.");
          setOutput("");
        }
      }
    },
    []
  );

  // Debounced real-time conversion (~300ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      processConversion(input, mode);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [input, mode, processConversion]);

  // Handle mode toggle
  const handleModeChange = (newMode: Base64Mode) => {
    setMode(newMode);
    setUploadedFile(null);
    setError(null);
  };

  // Swap input and output
  const handleSwap = () => {
    if (!output) return;
    const nextInput = output;
    const nextMode: Base64Mode = mode === "encode" ? "decode" : "encode";
    setInput(nextInput);
    setMode(nextMode);
    setUploadedFile(null);
  };

  // File Upload (<1MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("File size exceeds 1MB limit. Please upload a smaller file.");
      return;
    }

    try {
      const fileResult = await fileToBase64(file);
      setUploadedFile(fileResult);
      setMode("encode");
      setInput(`[File: ${fileResult.name} (${(fileResult.sizeBytes / 1024).toFixed(1)} KB)]`);
      setOutput(outputFormat === "dataUri" ? fileResult.dataUrl : fileResult.rawBase64);
      setError(null);
      addBase64History(`[File: ${fileResult.name}]`, fileResult.rawBase64, "encode");
    } catch (err) {
      setError("Failed to read file: " + (err as Error).message);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // History Drawer items mapping
  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: item.input.length > 45 ? `${item.input.slice(0, 42)}...` : item.input,
      secondaryLabel: `Result: ${item.output.length > 50 ? `${item.output.slice(0, 47)}...` : item.output}`,
      badge: item.mode,
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setMode(item.mode);
    setInput(item.input);
    setOutput(item.output);
    setUploadedFile(null);
    setError(null);
    lastSavedRef.current = item.input.trim();
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Binary className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Base64 Encoder & Decoder</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Convert text and files to Base64 format with full UTF-8 and Unicode emoji support.
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="Base64 History"
            description="Recent Base64 encodings and decodings"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("base64History", id)}
            onClearAll={() => clearHistory("base64History")}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              if (mode === "encode") {
                setInput(SAMPLE_TEXT);
              } else {
                setInput(utf8ToBase64(SAMPLE_TEXT));
              }
              setUploadedFile(null);
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Sample
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setInput("");
              setOutput("");
              setUploadedFile(null);
              setError(null);
            }}
            disabled={!input && !output}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Main Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        {/* Mode Selector */}
        <div className="inline-flex rounded-lg border border-border/80 p-1 bg-muted/40">
          <button
            onClick={() => handleModeChange("encode")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === "encode"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Encode Text / File</span>
          </button>
          <button
            onClick={() => handleModeChange("decode")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === "decode"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Decode Base64</span>
          </button>
        </div>

        {/* File upload trigger & Swap button */}
        <div className="flex items-center gap-2">
          {mode === "encode" && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 text-primary" />
                <span>Upload File (&lt;1MB)</span>
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleSwap}
            disabled={!output || Boolean(error)}
            title="Swap input and output"
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span>Swap</span>
          </Button>
        </div>
      </div>

      {/* Uploaded File Banner (if active) */}
      {uploadedFile && (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-primary/30 bg-primary/5 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              {uploadedFile.mimeType.startsWith("image/") ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-semibold text-foreground">{uploadedFile.name}</div>
              <div className="text-[11px] text-muted-foreground font-mono">
                {uploadedFile.mimeType} &bull; {(uploadedFile.sizeBytes / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-[11px]">
              <button
                onClick={() => {
                  setOutputFormat("raw");
                  setOutput(uploadedFile.rawBase64);
                }}
                className={`px-2 py-0.5 rounded ${
                  outputFormat === "raw"
                    ? "bg-card text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Raw Base64
              </button>
              <button
                onClick={() => {
                  setOutputFormat("dataUri");
                  setOutput(uploadedFile.dataUrl);
                }}
                className={`px-2 py-0.5 rounded ${
                  outputFormat === "dataUri"
                    ? "bg-card text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                Data URI
              </button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => {
                setUploadedFile(null);
                setInput("");
                setOutput("");
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Editor Panes */}
      <div className="space-y-4">
        {/* Input Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {mode === "encode" ? "Plain Text / Input" : "Base64 String to Decode"}
              </span>
              <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                {input.length} chars
              </span>
            </div>

            <CopyButton text={input} label="Copy Input" size="sm" className="h-6 px-2 text-[11px]" />
          </div>

          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setUploadedFile(null);
            }}
            placeholder={
              mode === "encode"
                ? "Type or paste text (UTF-8 / Emojis supported)..."
                : "Paste Base64 encoded string..."
            }
            className="w-full h-44 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none selection:bg-primary/20"
            spellCheck={false}
          />
        </div>

        {/* Output Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {mode === "encode" ? "Base64 Output" : "Decoded Plain Text"}
              </span>
              {output && !error && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Converted ({output.length} chars)
                </span>
              )}
            </div>

            <CopyButton
              text={output}
              label={mode === "encode" ? "Copy Base64" : "Copy Decoded Text"}
              size="sm"
              className="h-6 px-2.5 text-[11px]"
              disabled={!output || Boolean(error)}
            />
          </div>

          {error ? (
            <div className="w-full h-44 p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs space-y-2 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
              <div>
                <div className="font-bold text-sm">Decoding Error</div>
                <p className="text-xs text-destructive/90 mt-1">{error}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Please verify that the input is a valid Base64 encoded string without invalid special characters.
                </p>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder={
                mode === "encode"
                  ? "Base64 encoded output will appear here..."
                  : "Decoded text will appear here..."
              }
              className="w-full h-44 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none select-all"
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

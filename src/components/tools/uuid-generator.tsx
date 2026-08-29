import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useUuidHistory, addUuidHistory, deleteHistoryItem, clearHistory } from "@/db";
import {
  generateUuidV4,
  generateMultipleUuids,
  parseUnixTimestampInput,
  formatTimestampResult,
  dateToDatetimeLocalString,
  type TimestampFormatsResult,
  type UuidOptions,
} from "@/lib/uuid-timestamp";
import {
  Hash,
  Sparkles,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  Timer,
  Fingerprint,
} from "lucide-react";

type ActiveTab = "both" | "uuid" | "timestamp";
type HistoryFilter = "all" | "uuid" | "timestamp";

export function UuidGeneratorTool() {
  // Navigation / View Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>("both");

  // UUID State
  const [uuidOptions, setUuidOptions] = useState<UuidOptions>({
    uppercase: false,
    hyphens: true,
  });
  const [batchCount, setBatchCount] = useState<number>(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>(() => [
    generateUuidV4({ uppercase: false, hyphens: true }),
  ]);

  // Timestamp State
  const [timestampInput, setTimestampInput] = useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  );
  const [datetimePickerValue, setDatetimePickerValue] = useState<string>(() =>
    dateToDatetimeLocalString(new Date())
  );
  const [timestampResult, setTimestampResult] = useState<TimestampFormatsResult | null>(() =>
    formatTimestampResult(new Date())
  );
  const [detectedUnit, setDetectedUnit] = useState<"seconds" | "milliseconds" | null>("seconds");
  const [timestampError, setTimestampError] = useState<string | null>(null);

  // Live Current Time Ticker
  const [currentNow, setCurrentNow] = useState<{ sec: number; ms: number }>({
    sec: Math.floor(Date.now() / 1000),
    ms: Date.now(),
  });

  // History state
  const history = useUuidHistory();
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTimestampRef = useRef<string>("");

  // Live Clock Interval
  useEffect(() => {
    const timer = setInterval(() => {
      const ms = Date.now();
      setCurrentNow({
        sec: Math.floor(ms / 1000),
        ms,
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- UUID Actions ---
  const handleGenerateSingleUuid = () => {
    const newUuid = generateUuidV4(uuidOptions);
    setGeneratedUuids([newUuid]);
    addUuidHistory(newUuid, "uuid");
  };

  const handleGenerateBatchUuids = (count = batchCount) => {
    const list = generateMultipleUuids(count, uuidOptions);
    setGeneratedUuids(list);
    addUuidHistory(`${list[0]} (+${list.length - 1} more)`, "uuid");
  };

  const handleOptionChange = (key: keyof UuidOptions, value: boolean) => {
    const newOpts = { ...uuidOptions, [key]: value };
    setUuidOptions(newOpts);
    // Transform existing UUIDs
    setGeneratedUuids((prev) =>
      prev.map((u) => {
        let transformed = u;
        if (key === "hyphens") {
          if (!value) transformed = transformed.replace(/-/g, "");
          else if (!transformed.includes("-") && transformed.length === 32) {
            transformed = `${transformed.slice(0, 8)}-${transformed.slice(8, 12)}-${transformed.slice(12, 16)}-${transformed.slice(16, 20)}-${transformed.slice(20)}`;
          }
        }
        if (key === "uppercase") {
          transformed = value ? transformed.toUpperCase() : transformed.toLowerCase();
        }
        return transformed;
      })
    );
  };

  // --- Timestamp Actions ---
  const processTimestampConversion = useCallback((inputStr: string) => {
    const trimmed = inputStr.trim();
    if (!trimmed) {
      setTimestampResult(null);
      setDetectedUnit(null);
      setTimestampError(null);
      return;
    }

    const { result, detectedUnit: unit, error } = parseUnixTimestampInput(trimmed);
    if (error || !result) {
      setTimestampResult(null);
      setDetectedUnit(null);
      setTimestampError(error || "Invalid timestamp format.");
    } else {
      setTimestampResult(result);
      setDetectedUnit(unit);
      setTimestampError(null);
      setDatetimePickerValue(dateToDatetimeLocalString(result.date));

      // Auto-save conversion to history (debounced)
      if (trimmed !== lastSavedTimestampRef.current) {
        lastSavedTimestampRef.current = trimmed;
        addUuidHistory(`${trimmed} (${result.iso8601})`, "timestamp");
      }
    }
  }, []);

  // Debounced input conversion
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      processTimestampConversion(timestampInput);
    }, 250);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [timestampInput, processTimestampConversion]);

  // Handle DatePicker change
  const handleDatetimePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDatetimePickerValue(val);
    if (!val) return;

    const date = new Date(val);
    if (!isNaN(date.getTime())) {
      const res = formatTimestampResult(date);
      setTimestampResult(res);
      setDetectedUnit("seconds");
      setTimestampError(null);
      const secStr = res.unixSeconds.toString();
      setTimestampInput(secStr);

      if (secStr !== lastSavedTimestampRef.current) {
        lastSavedTimestampRef.current = secStr;
        addUuidHistory(`${secStr} (${res.iso8601})`, "timestamp");
      }
    }
  };

  // Set to Current Time
  const handleSetToCurrentTime = () => {
    const now = new Date();
    const secStr = Math.floor(now.getTime() / 1000).toString();
    setTimestampInput(secStr);
    setDatetimePickerValue(dateToDatetimeLocalString(now));
    const res = formatTimestampResult(now);
    setTimestampResult(res);
    setDetectedUnit("seconds");
    setTimestampError(null);
    addUuidHistory(`${secStr} (${res.iso8601})`, "timestamp");
  };

  // History Drawer filter & items
  const filteredHistory = (history || []).filter((item) => {
    if (historyFilter === "all") return true;
    return item.type === historyFilter;
  });

  const drawerItems: HistoryDrawerItem[] = filteredHistory
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => ({
      id: item.id,
      label: item.value.length > 45 ? `${item.value.slice(0, 42)}...` : item.value,
      badge: item.type === "uuid" ? "UUID v4" : "Timestamp",
      createdAt: item.createdAt,
    }));

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    if (item.type === "uuid") {
      setGeneratedUuids([item.value]);
      if (activeTab === "timestamp") setActiveTab("uuid");
    } else {
      // Extract numeric timestamp if stored like "1788031200 (2026-08-29T...)"
      const match = /^(\d+)/.exec(item.value);
      const val = match ? match[1] : item.value;
      setTimestampInput(val);
      processTimestampConversion(val);
      if (activeTab === "uuid") setActiveTab("timestamp");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">UUID & Timestamp Utility</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Generate cryptographically secure UUID v4 identifiers and convert Unix timestamps across standard formats.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* History filter toggle */}
          <div className="inline-flex rounded-lg border border-border/80 p-0.5 bg-muted/40 text-[11px]">
            <button
              onClick={() => setHistoryFilter("all")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                historyFilter === "all"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setHistoryFilter("uuid")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                historyFilter === "uuid"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              UUIDs
            </button>
            <button
              onClick={() => setHistoryFilter("timestamp")}
              className={`px-2 py-0.5 rounded font-medium transition-all ${
                historyFilter === "timestamp"
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Timestamps
            </button>
          </div>

          <HistoryDrawer
            title="UUID & Timestamp History"
            description={`Recent ${historyFilter === "all" ? "UUIDs and timestamps" : historyFilter === "uuid" ? "UUID v4 records" : "timestamp conversions"}`}
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("uuidHistory", id)}
            onClearAll={() => clearHistory("uuidHistory")}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleSetToCurrentTime}
            title="Fill in current Unix Epoch timestamp"
          >
            <Clock className="h-3.5 w-3.5 text-pink-500" />
            Current Time
          </Button>

          <Button
            variant="default"
            size="sm"
            className="gap-1.5 text-xs shadow-sm"
            onClick={handleGenerateSingleUuid}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate UUID
          </Button>
        </div>
      </div>

      {/* Live Time Ticker Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60">
        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Timer className="h-3.5 w-3.5 text-primary" /> Live Unix Clock:
          </span>
          <span className="font-mono text-muted-foreground">
            {currentNow.sec} <span className="text-[10px]">(sec)</span> &bull; {currentNow.ms} <span className="text-[10px]">(ms)</span>
          </span>
        </div>

        {/* View Switcher Tabs: All-in-One vs UUID vs Timestamp */}
        <div className="inline-flex rounded-lg border border-border/80 p-0.5 bg-muted/40 text-xs">
          <button
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "both"
                ? "bg-card text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All-in-One
          </button>
          <button
            onClick={() => setActiveTab("uuid")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "uuid"
                ? "bg-card text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            UUID Generator
          </button>
          <button
            onClick={() => setActiveTab("timestamp")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeTab === "timestamp"
                ? "bg-card text-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Timestamp Converter
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={`grid gap-6 ${activeTab === "both" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* ========================================================================= */}
        {/* SECTION 1: UUID GENERATOR */}
        {/* ========================================================================= */}
        {(activeTab === "both" || activeTab === "uuid") && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-4">
              {/* Section Title & Generator Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-pink-500" />
                  <h2 className="font-semibold text-sm text-foreground">UUID v4 Generator</h2>
                  <span className="text-[11px] font-mono bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded border border-pink-500/20">
                    RFC 4122
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={handleGenerateSingleUuid}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    New UUID
                  </Button>
                </div>
              </div>

              {/* Options & Batch Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Format Switches */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOptionChange("uppercase", !uuidOptions.uppercase)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-mono font-medium transition-all ${
                      uuidOptions.uppercase
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {uuidOptions.uppercase ? "UPPERCASE" : "lowercase"}
                  </button>

                  <button
                    onClick={() => handleOptionChange("hyphens", !uuidOptions.hyphens)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-mono font-medium transition-all ${
                      uuidOptions.hyphens
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {uuidOptions.hyphens ? "With Hyphens" : "No Hyphens"}
                  </button>
                </div>

                {/* Batch Count Buttons */}
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px] font-medium">Batch:</span>
                  {[5, 10, 20].map((num) => (
                    <Button
                      key={num}
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs font-mono"
                      onClick={() => {
                        setBatchCount(num);
                        handleGenerateBatchUuids(num);
                      }}
                    >
                      +{num}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generated UUIDs Output List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-medium pt-1">
                  <span>Generated ({generatedUuids.length})</span>
                  {generatedUuids.length > 1 && (
                    <CopyButton
                      text={generatedUuids.join("\n")}
                      label="Copy All UUIDs"
                      size="sm"
                      className="h-6 px-2 text-[11px]"
                    />
                  )}
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {generatedUuids.map((uuid, idx) => (
                    <div
                      key={idx}
                      className="group p-3 rounded-lg border border-border/70 bg-background/80 hover:border-pink-500/40 transition-all flex items-center justify-between font-mono text-xs shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className="text-muted-foreground/60 text-[11px] select-none shrink-0 w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-foreground font-semibold select-all truncate">
                          {uuid}
                        </span>
                      </div>
                      <CopyButton
                        text={uuid}
                        size="sm"
                        label="Copy"
                        className="h-6 px-2 text-[11px] shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: TIMESTAMP CONVERTER */}
        {/* ========================================================================= */}
        {(activeTab === "both" || activeTab === "timestamp") && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-4">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <h2 className="font-semibold text-sm text-foreground">Timestamp Converter</h2>
                  {detectedUnit && (
                    <span className="text-[11px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20">
                      Auto-detected: {detectedUnit}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={handleSetToCurrentTime}
                >
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Current Time
                </Button>
              </div>

              {/* Two-Way Inputs: Numeric Timestamp + Visual DatePicker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Numeric Unix Timestamp Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Unix Timestamp (sec or ms)</span>
                    <CopyButton
                      text={timestampInput}
                      label="Copy"
                      size="sm"
                      className="h-5 px-1.5 text-[10px]"
                    />
                  </div>
                  <input
                    type="text"
                    value={timestampInput}
                    onChange={(e) => setTimestampInput(e.target.value)}
                    placeholder="e.g. 1788031200 or 1788031200000"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Visual Date & Time Picker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-sky-400" /> Visual Date Picker
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                      {timestampResult?.timezone || "Local"}
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    step="1"
                    value={datetimePickerValue}
                    onChange={handleDatetimePickerChange}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {/* Error Box */}
              {timestampError && (
                <div className="p-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{timestampError}</span>
                </div>
              )}

              {/* Comprehensive Formats Output Cards */}
              {timestampResult && !timestampError && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="font-semibold text-foreground">Converted Formats</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted">
                      {timestampResult.dayOfWeek} &bull; {timestampResult.relative}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {/* Unix Seconds */}
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                          Seconds (10 digits)
                        </div>
                        <div className="font-semibold text-foreground truncate">
                          {timestampResult.unixSeconds}
                        </div>
                      </div>
                      <CopyButton text={String(timestampResult.unixSeconds)} size="sm" className="h-6 px-2 text-[10px]" />
                    </div>

                    {/* Unix Milliseconds */}
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                          Milliseconds (13 digits)
                        </div>
                        <div className="font-semibold text-foreground truncate">
                          {timestampResult.unixMilliseconds}
                        </div>
                      </div>
                      <CopyButton text={String(timestampResult.unixMilliseconds)} size="sm" className="h-6 px-2 text-[10px]" />
                    </div>

                    {/* ISO 8601 */}
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 flex items-center justify-between sm:col-span-2">
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                          ISO 8601 (UTC)
                        </div>
                        <div className="font-semibold text-foreground truncate">
                          {timestampResult.iso8601}
                        </div>
                      </div>
                      <CopyButton text={timestampResult.iso8601} size="sm" className="h-6 px-2 text-[10px]" />
                    </div>

                    {/* Local Time with Timezone */}
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 flex items-center justify-between sm:col-span-2">
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                          Local Timezone ({timestampResult.timezone})
                        </div>
                        <div className="font-semibold text-foreground truncate">
                          {timestampResult.localReadable}
                        </div>
                      </div>
                      <CopyButton text={timestampResult.localReadable} size="sm" className="h-6 px-2 text-[10px]" />
                    </div>

                    {/* RFC 2822 / HTTP Date */}
                    <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1 flex items-center justify-between sm:col-span-2">
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-sans font-semibold text-muted-foreground uppercase">
                          RFC 2822 / HTTP Date
                        </div>
                        <div className="font-semibold text-foreground truncate">
                          {timestampResult.rfc2822}
                        </div>
                      </div>
                      <CopyButton text={timestampResult.rfc2822} size="sm" className="h-6 px-2 text-[10px]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

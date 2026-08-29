import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useJwtHistory, addJwtHistory, deleteHistoryItem, clearHistory } from "@/db";
import { decodeJwt, generateSampleJwt, type DecodedJwtResult } from "@/lib/jwt";
import { JsonSyntaxHighlighter } from "./json/json-syntax-highlighter";
import { JsonTreeView } from "./json/json-tree-view";
import {
  KeyRound,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Code2,
  FolderTree,
  User,
  Tag,
  Info,
  Lock,
  Layers,
  FileCheck,
} from "lucide-react";

type ViewMode = "code" | "tree";

const DEFAULT_SAMPLE_TOKEN = generateSampleJwt(false);

export function JwtDecoderTool() {
  const [token, setToken] = useState<string>(DEFAULT_SAMPLE_TOKEN);
  const [decoded, setDecoded] = useState<DecodedJwtResult | null>(() => {
    try {
      return decodeJwt(DEFAULT_SAMPLE_TOKEN);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [headerViewMode, setHeaderViewMode] = useState<ViewMode>("code");
  const [payloadViewMode, setPayloadViewMode] = useState<ViewMode>("code");

  const history = useJwtHistory();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTokenRef = useRef<string>(DEFAULT_SAMPLE_TOKEN);

  // Decode logic
  const handleProcessJwt = useCallback((rawToken: string) => {
    const trimmed = rawToken.trim();
    if (!trimmed) {
      setDecoded(null);
      setError(null);
      return;
    }

    try {
      const result = decodeJwt(trimmed);
      setDecoded(result);
      setError(null);

      // Auto-save valid tokens to history if changed
      if (trimmed !== lastSavedTokenRef.current) {
        lastSavedTokenRef.current = trimmed;
        addJwtHistory(trimmed);
      }
    } catch (err: unknown) {
      setDecoded(null);
      setError((err as Error)?.message || "Failed to decode JWT token.");
    }
  }, []);

  // Debounced real-time decoding (~300ms)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      handleProcessJwt(token);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [token, handleProcessJwt]);

  // Load sample tokens
  const handleLoadSample = (isExpired = false) => {
    const sample = generateSampleJwt(isExpired);
    setToken(sample);
    try {
      const result = decodeJwt(sample);
      setDecoded(result);
      setError(null);
      lastSavedTokenRef.current = sample;
    } catch {
      //
    }
  };

  // History Drawer items mapping
  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => {
      let label = "JWT Token";
      let badge: string | undefined = undefined;

      try {
        const res = decodeJwt(item.token);
        if (res.claims.sub) {
          label = `Sub: ${res.claims.sub}`;
        } else if (res.payload.name) {
          label = `Name: ${String(res.payload.name)}`;
        } else if (res.payload.email) {
          label = `Email: ${String(res.payload.email)}`;
        }

        if (res.claims.exp) {
          badge = res.claims.exp.isExpired ? "Expired" : "Active";
        } else if (res.algorithm) {
          badge = res.algorithm;
        }
      } catch {
        label = "Malformed Token";
        badge = "Error";
      }

      return {
        id: item.id,
        label,
        secondaryLabel: item.token,
        badge,
        createdAt: item.createdAt,
      };
    });

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setToken(item.token);
    try {
      const result = decodeJwt(item.token);
      setDecoded(result);
      setError(null);
      lastSavedTokenRef.current = item.token.trim();
    } catch (err: unknown) {
      setDecoded(null);
      setError((err as Error)?.message || "Failed to decode JWT token.");
    }
  };

  const parts = token.trim() ? token.trim().split(".") : [];

  return (
    <div className="space-y-6">
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">JWT Token Decoder</h1>
              <p className="text-xs text-muted-foreground font-sans">
                Inspect, debug, and validate JSON Web Token claims offline with 100% client-side security.
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Privacy Note Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary border border-border text-[11px] font-mono text-muted-foreground">
            <Lock className="h-3 w-3 text-primary shrink-0" />
            <span>Local memory only &bull; Offline</span>
          </div>

          <HistoryDrawer
            title="JWT History"
            description="Recent inspected and decoded JSON Web Tokens. Stored locally on your device only, never sent anywhere."
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("jwtHistory", id)}
            onClearAll={() => clearHistory("jwtHistory")}
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => handleLoadSample(false)}
            title="Load an active valid sample JWT"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Sample (Active)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => handleLoadSample(true)}
            title="Load an expired sample JWT"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Sample (Expired)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setToken("");
              setDecoded(null);
              setError(null);
            }}
            disabled={!token}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Mobile Privacy Notice */}
      <div className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
        <Lock className="h-3 w-3 shrink-0" />
        <span>History is stored locally on your device only, never sent anywhere</span>
      </div>

      {/* Raw JWT Input Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Encoded JWT String</span>
            {token.trim() && (
              <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded">
                {parts.length} {parts.length === 1 ? "part" : "parts"} &bull; {token.length} chars
              </span>
            )}
            {parts.length === 3 && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                <CheckCircle2 className="h-3 w-3" /> 3 Segments Detected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <CopyButton text={token} label="Copy Raw JWT" size="sm" className="h-6 px-2 text-[11px]" />
          </div>
        </div>

        {/* Input Textarea with colored segment hints */}
        <div className="relative">
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your base64url-encoded JWT token here (header.payload.signature)..."
            className={`w-full h-28 p-3.5 rounded-xl border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 resize-none break-all selection:bg-primary/20 ${
              error && token.trim()
                ? "border-destructive/60 focus:ring-destructive/40"
                : "border-border focus:ring-primary/40"
            }`}
            spellCheck={false}
          />
        </div>

        {/* Segment legend / preview bar */}
        {parts.length === 3 && !error && (
          <div className="flex items-center gap-2 text-[11px] font-mono p-2 rounded-lg bg-muted/40 border border-border/60 overflow-x-auto">
            <span className="text-muted-foreground font-sans font-semibold shrink-0">Structure:</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 truncate max-w-[120px] sm:max-w-[200px]" title="Header part">
              {parts[0]}
            </span>
            <span className="text-muted-foreground font-bold">.</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 truncate max-w-[120px] sm:max-w-[200px]" title="Payload part">
              {parts[1]}
            </span>
            <span className="text-muted-foreground font-bold">.</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 truncate max-w-[120px] sm:max-w-[200px]" title="Signature part">
              {parts[2]}
            </span>
          </div>
        )}
      </div>

      {/* Error Alert Box */}
      {error && token.trim() && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs space-y-2 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Invalid JWT Format</h3>
            <p className="font-mono text-destructive/90">{error}</p>
            <div className="text-[11px] text-muted-foreground space-y-1 mt-2">
              <p className="font-semibold text-foreground/80">A standard JSON Web Token consists of 3 dot-separated Base64URL segments:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>Header:</strong> contains the token algorithm and token type</li>
                <li><strong>Payload:</strong> contains the claims data (e.g. sub, exp, user info)</li>
                <li><strong>Signature:</strong> ensures token integrity using a cryptographic hash or signature</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!token.trim() && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-3 bg-card/40">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Waiting for JSON Web Token</h3>
            <p className="text-xs max-w-sm text-muted-foreground">
              Paste an encoded JWT in the box above or click <strong>Sample</strong> to inspect claims, timestamps, and signature details.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs mt-2"
            onClick={() => handleLoadSample(false)}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Load Sample Token
          </Button>
        </div>
      )}

      {/* Decoded Content Display */}
      {decoded && !error && (
        <div className="space-y-6">
          {/* Key Claims Overview Banner */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-xs tracking-tight text-foreground">
                  Claims & Token Status
                </span>
              </div>

              {/* Status Badge */}
              {decoded.claims.exp ? (
                decoded.claims.exp.isExpired ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Expired ({decoded.claims.exp.relative})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Active (expires {decoded.claims.exp.relative})</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                  <Info className="h-3.5 w-3.5" />
                  <span>No Expiration Set</span>
                </div>
              )}
            </div>

            {/* Quick Claims Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs">
              {/* Algorithm & Type */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-sky-400" />
                  Algorithm & Type
                </div>
                <div className="font-mono font-semibold text-foreground">
                  {decoded.algorithm || "None"} &bull; {decoded.tokenType || "JWT"}
                </div>
              </div>

              {/* Subject (sub) */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-purple-400" />
                  Subject (sub)
                </div>
                <div className="font-mono font-semibold text-foreground truncate" title={decoded.claims.sub || "None"}>
                  {decoded.claims.sub || <span className="text-muted-foreground italic font-normal">Not specified</span>}
                </div>
              </div>

              {/* Issued At (iat) */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Issued At (iat)
                </div>
                <div className="font-mono text-foreground text-[11px] leading-tight">
                  {decoded.claims.iat ? (
                    <>
                      <div className="font-semibold">{decoded.claims.iat.relative}</div>
                      <div className="text-[10px] text-muted-foreground">{decoded.claims.iat.dateFormatted}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic font-normal">Not specified</span>
                  )}
                </div>
              </div>

              {/* Expiration (exp) */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-1">
                <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-400" />
                  Expires At (exp)
                </div>
                <div className="font-mono text-foreground text-[11px] leading-tight">
                  {decoded.claims.exp ? (
                    <>
                      <div className={`font-semibold ${decoded.claims.exp.isExpired ? "text-rose-400" : "text-emerald-400"}`}>
                        {decoded.claims.exp.dateFormatted}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {decoded.claims.exp.isExpired ? `Expired ${decoded.claims.exp.relative}` : `Expires in ${decoded.claims.exp.relative}`}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic font-normal">No expiry timestamp</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Split Panes: Header & Payload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Card: Header */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Header</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Algorithm: {decoded.algorithm || "HS256"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                    <button
                      onClick={() => setHeaderViewMode("code")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        headerViewMode === "code"
                          ? "bg-card text-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code2 className="h-3 w-3 text-rose-400" />
                      <span>Code</span>
                    </button>
                    <button
                      onClick={() => setHeaderViewMode("tree")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        headerViewMode === "tree"
                          ? "bg-card text-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FolderTree className="h-3 w-3 text-rose-400" />
                      <span>Tree</span>
                    </button>
                  </div>

                  <CopyButton
                    text={decoded.headerJson}
                    label="Copy Header"
                    size="sm"
                    className="h-6 px-2.5 text-[11px]"
                  />
                </div>
              </div>

              <div className="relative rounded-xl border border-border bg-card/70 h-80 overflow-hidden flex flex-col shadow-inner">
                {headerViewMode === "code" ? (
                  <div className="flex-1 overflow-auto">
                    <JsonSyntaxHighlighter jsonString={decoded.headerJson} />
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <JsonTreeView data={decoded.header} defaultExpandedDepth={3} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Payload */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Payload</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {Object.keys(decoded.payload).length} claims
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/60">
                    <button
                      onClick={() => setPayloadViewMode("code")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        payloadViewMode === "code"
                          ? "bg-card text-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code2 className="h-3 w-3 text-purple-400" />
                      <span>Code</span>
                    </button>
                    <button
                      onClick={() => setPayloadViewMode("tree")}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
                        payloadViewMode === "tree"
                          ? "bg-card text-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <FolderTree className="h-3 w-3 text-purple-400" />
                      <span>Tree</span>
                    </button>
                  </div>

                  <CopyButton
                    text={decoded.payloadJson}
                    label="Copy Payload"
                    size="sm"
                    className="h-6 px-2.5 text-[11px]"
                  />
                </div>
              </div>

              <div className="relative rounded-xl border border-border bg-card/70 h-80 overflow-hidden flex flex-col shadow-inner">
                {payloadViewMode === "code" ? (
                  <div className="flex-1 overflow-auto">
                    <JsonSyntaxHighlighter jsonString={decoded.payloadJson} />
                  </div>
                ) : (
                  <div className="flex-1 overflow-auto">
                    <JsonTreeView data={decoded.payload} defaultExpandedDepth={3} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature Card */}
          <div className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-xs text-foreground">Signature</span>
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {decoded.signature ? `${decoded.signature.length} chars` : "unsigned"}
                </span>
              </div>

              <CopyButton
                text={decoded.signature}
                label="Copy Signature"
                size="sm"
                className="h-6 px-2 text-[11px] self-start sm:self-auto"
                disabled={!decoded.signature}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/60 font-mono text-xs text-cyan-400 break-all select-all">
              {decoded.signature || <span className="text-muted-foreground italic font-normal">No signature part present in token</span>}
            </div>

            {/* Client-side verification notice */}
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/40">
              <Lock className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div className="space-y-0.5 text-[11px] leading-relaxed">
                <p className="font-semibold text-foreground/90">
                  Signature verification is not performed client-side
                </p>
                <p>
                  Verifying the cryptographic signature requires the secret key or public certificate. LadeTools is 100% client-side and does not upload your tokens to any server.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

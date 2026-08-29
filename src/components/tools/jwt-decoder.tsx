import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useJwtHistory, addJwtHistory } from "@/db";
import { KeyRound, ShieldAlert, History, Key } from "lucide-react";

export function JwtDecoderTool() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxhZGVUb29scyBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4z...sample"
  );
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = useJwtHistory();

  const handleDecode = async () => {
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format: A valid JWT must contain 3 dot-separated parts.");
      }

      const decodedHeader = JSON.parse(decodeURIComponent(escape(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")))));
      const decodedPayload = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
      setError(null);
      await addJwtHistory(token.trim());
    } catch (err: unknown) {
      setError((err as Error).message);
      setHeader("");
      setPayload("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JWT Token Decoder</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Inspect decoded JSON Web Token header, claims payload, and signature locally.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setToken("")} disabled={!token}>
            Clear
          </Button>
          <Button variant="default" size="sm" className="gap-1.5" onClick={handleDecode} disabled={!token}>
            <Key className="h-3.5 w-3.5" />
            Decode JWT
          </Button>
        </div>
      </div>

      {/* Token Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>Encoded JWT String</span>
          <CopyButton text={token} label="Copy Token" size="sm" className="h-6 px-2 text-[11px]" />
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste encoded JWT token here..."
          className="w-full h-28 p-3.5 rounded-xl border border-border bg-card font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none break-all"
        />
      </div>

      {error ? (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive font-mono text-xs flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong>Decoding Error:</strong> {error}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Header (Algorithm & Type)</span>
              <CopyButton text={header} label="Copy Header" size="sm" className="h-6 px-2 text-[11px]" />
            </div>
            <textarea
              readOnly
              value={header}
              placeholder="Decoded header..."
              className="w-full h-64 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Payload (Claims & Data)</span>
              <CopyButton text={payload} label="Copy Payload" size="sm" className="h-6 px-2 text-[11px]" />
            </div>
            <textarea
              readOnly
              value={payload}
              placeholder="Decoded payload claims..."
              className="w-full h-64 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <History className="h-4 w-4 text-primary" />
            <span>Recent JWT Runs ({history?.length || 0})</span>
          </div>
        </div>
        {history && history.length > 0 ? (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => setToken(item.token)}
                className="cursor-pointer p-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/70 text-xs font-mono flex justify-between items-center transition-colors"
              >
                <span className="truncate max-w-lg text-foreground">{item.token}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <CopyButton text={item.token} showIconOnly className="h-6 w-6 p-0 border-0 bg-transparent hover:bg-muted" />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>
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

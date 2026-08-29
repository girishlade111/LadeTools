import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { HistoryDrawer, type HistoryDrawerItem } from "@/components/ui/history-drawer";
import { useJwtHistory, addJwtHistory, deleteHistoryItem, clearHistory } from "@/db";
import { KeyRound, ShieldAlert, Key } from "lucide-react";

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

  const drawerItems: HistoryDrawerItem[] = (history || [])
    .filter((item): item is typeof item & { id: number } => item.id !== undefined)
    .map((item) => {
      let subject = "JWT Token";
      try {
        const parts = item.token.split(".");
        if (parts.length === 3) {
          const p = JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))));
          if (p.sub) subject = `Sub: ${p.sub}`;
          else if (p.name) subject = `Name: ${p.name}`;
          else if (p.email) subject = `Email: ${p.email}`;
        }
      } catch {
        // fallback
      }

      return {
        id: item.id,
        label: subject,
        secondaryLabel: item.token,
        createdAt: item.createdAt,
      };
    });

  const handleSelectHistory = (id: number) => {
    const item = history?.find((h) => h.id === id);
    if (!item) return;

    setToken(item.token);
    try {
      const parts = item.token.split(".");
      if (parts.length === 3) {
        setHeader(JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"))))), null, 2));
        setPayload(JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))))), null, 2));
        setError(null);
      }
    } catch {
      //
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

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <HistoryDrawer
            title="JWT History"
            description="Recent inspected JSON Web Tokens"
            items={drawerItems}
            onSelect={handleSelectHistory}
            onDelete={(id) => deleteHistoryItem("jwtHistory", id)}
            onClearAll={() => clearHistory("jwtHistory")}
          />

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
              className="w-full h-80 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
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
              className="w-full h-80 p-3.5 rounded-xl border border-border bg-muted/40 font-mono text-xs leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

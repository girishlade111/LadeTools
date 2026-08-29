import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/hooks/use-toast";

interface JsonTreeViewProps {
  data: unknown;
  defaultExpandedDepth?: number;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
}

export function JsonTreeView({
  data,
  defaultExpandedDepth = 2,
  expandAllTrigger,
  collapseAllTrigger,
}: JsonTreeViewProps) {
  return (
    <div className="font-mono text-xs select-text overflow-auto p-3 space-y-1">
      <JsonTreeNode
        name="root"
        value={data}
        depth={0}
        defaultExpandedDepth={defaultExpandedDepth}
        expandAllTrigger={expandAllTrigger}
        collapseAllTrigger={collapseAllTrigger}
        isLast
      />
    </div>
  );
}

interface JsonTreeNodeProps {
  name?: string | number;
  value: unknown;
  depth: number;
  defaultExpandedDepth: number;
  expandAllTrigger?: number;
  collapseAllTrigger?: number;
  isLast?: boolean;
}

function JsonTreeNode({
  name,
  value,
  depth,
  defaultExpandedDepth,
  expandAllTrigger,
  collapseAllTrigger,
  isLast = false,
}: JsonTreeNodeProps) {
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < defaultExpandedDepth);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (expandAllTrigger !== undefined && expandAllTrigger > 0) {
      setIsExpanded(true);
    }
  }, [expandAllTrigger]);

  useEffect(() => {
    if (collapseAllTrigger !== undefined && collapseAllTrigger > 0) {
      setIsExpanded(false);
    }
  }, [collapseAllTrigger]);

  const handleCopyValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    const str = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
    copyToClipboard(str);
    setCopied(true);
    toast({
      title: "Copied node value",
      description: str.length > 50 ? `${str.slice(0, 47)}...` : str,
    });
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isObject) {
    return (
      <div
        className="group flex items-center py-0.5 hover:bg-muted/40 rounded px-1.5 transition-colors"
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        {name !== undefined && name !== "root" && (
          <span className="text-sky-400 font-semibold mr-1.5">
            {typeof name === "string" ? `"${name}"` : name}:
          </span>
        )}
        <JsonPrimitiveValue value={value} />
        {!isLast && <span className="text-muted-foreground mr-1">,</span>}

        <button
          onClick={handleCopyValue}
          className="ml-2 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-opacity"
          title="Copy value"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
    );
  }

  const entries = isArray
    ? (value as unknown[]).map((v, i) => [i, v] as [number, unknown])
    : Object.entries(value as Record<string, unknown>);

  const count = entries.length;
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="space-y-0.5">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center py-0.5 hover:bg-muted/50 rounded px-1.5 cursor-pointer select-none transition-colors"
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        <span className="text-muted-foreground/80 hover:text-foreground mr-1">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </span>

        {name !== undefined && name !== "root" && (
          <span className="text-sky-400 font-semibold mr-1.5">
            {typeof name === "string" ? `"${name}"` : name}:
          </span>
        )}

        <span className="text-muted-foreground font-semibold">{openBracket}</span>

        {!isExpanded && (
          <span className="text-[11px] text-muted-foreground/70 mx-1.5 bg-muted/60 px-1.5 py-0.5 rounded">
            {count} {isArray ? (count === 1 ? "item" : "items") : count === 1 ? "key" : "keys"}
          </span>
        )}

        {!isExpanded && (
          <span className="text-muted-foreground font-semibold">
            {closeBracket}
            {!isLast && ","}
          </span>
        )}

        <button
          onClick={handleCopyValue}
          className="ml-2 opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground transition-opacity"
          title="Copy subtree"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-0.5">
          {count === 0 ? (
            <div
              className="text-muted-foreground/60 italic py-0.5"
              style={{ paddingLeft: `${(depth + 1) * 1.25}rem` }}
            >
              (empty {isArray ? "array" : "object"})
            </div>
          ) : (
            entries.map(([k, v], idx) => (
              <JsonTreeNode
                key={k}
                name={isArray ? undefined : k}
                value={v}
                depth={depth + 1}
                defaultExpandedDepth={defaultExpandedDepth}
                expandAllTrigger={expandAllTrigger}
                collapseAllTrigger={collapseAllTrigger}
                isLast={idx === count - 1}
              />
            ))
          )}

          <div
            className="text-muted-foreground font-semibold py-0.5"
            style={{ paddingLeft: `${depth * 1.25 + 1.25}rem` }}
          >
            {closeBracket}
            {!isLast && ","}
          </div>
        </div>
      )}
    </div>
  );
}

function JsonPrimitiveValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="text-slate-400 italic">null</span>;
  }
  if (value === undefined) {
    return <span className="text-slate-500 italic">undefined</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-purple-400 font-semibold">{String(value)}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-amber-400 font-semibold">{value}</span>;
  }
  if (typeof value === "string") {
    return (
      <span className="text-emerald-400 break-all font-mono">
        "{value}"
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

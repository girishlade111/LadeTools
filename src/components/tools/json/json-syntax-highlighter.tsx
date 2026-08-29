import React from "react";

interface JsonSyntaxHighlighterProps {
  jsonString: string;
}

/**
 * Lightweight JSON syntax highlighter without heavy dependencies
 */
export function JsonSyntaxHighlighter({ jsonString }: JsonSyntaxHighlighterProps) {
  if (!jsonString) {
    return <div className="text-muted-foreground italic p-4 text-xs">No formatted output.</div>;
  }

  const lines = jsonString.split("\n");

  return (
    <div className="font-mono text-xs overflow-auto h-full flex select-text">
      {/* Line Numbers Gutter */}
      <div className="select-none py-3 px-3 text-right text-muted-foreground/40 border-r border-border/40 bg-muted/20 shrink-0 space-y-0.5 min-w-[2.75rem]">
        {lines.map((_, idx) => (
          <div key={idx} className="leading-5 text-[11px]">
            {idx + 1}
          </div>
        ))}
      </div>

      {/* Code Content */}
      <div className="py-3 px-4 flex-1 space-y-0.5 overflow-x-auto whitespace-pre">
        {lines.map((line, idx) => (
          <div key={idx} className="leading-5">
            {highlightJsonLine(line)}
          </div>
        ))}
      </div>
    </div>
  );
}

function highlightJsonLine(line: string): React.ReactNode[] {
  // Regex parsing JSON tokens:
  // 1. Key: "key":
  // 2. String: "value"
  // 3. Number: -?\d+(\.\d+)?([eE][+-]?\d+)?
  // 4. Boolean: true | false
  // 5. Null: null
  // 6. Punctuation: { } [ ] , :
  const tokenRegex =
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?|[{}[\],:])/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    // Add any preceding whitespace/indentation
    if (match.index > lastIndex) {
      elements.push(line.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (/^"/.test(token)) {
      if (/:$/.test(token)) {
        // Key: e.g. "name":
        const colonIndex = token.lastIndexOf(":");
        const keyPart = token.slice(0, colonIndex);
        const colonPart = token.slice(colonIndex);
        elements.push(
          <span key={match.index} className="text-sky-400 font-semibold">
            {keyPart}
          </span>
        );
        elements.push(
          <span key={`${match.index}-colon`} className="text-muted-foreground">
            {colonPart}
          </span>
        );
      } else {
        // String value
        elements.push(
          <span key={match.index} className="text-emerald-400">
            {token}
          </span>
        );
      }
    } else if (/true|false/.test(token)) {
      elements.push(
        <span key={match.index} className="text-purple-400 font-semibold">
          {token}
        </span>
      );
    } else if (/null/.test(token)) {
      elements.push(
        <span key={match.index} className="text-slate-400 italic">
          {token}
        </span>
      );
    } else if (/-?\d+/.test(token)) {
      elements.push(
        <span key={match.index} className="text-amber-400 font-semibold">
          {token}
        </span>
      );
    } else {
      // Brackets, braces, commas
      elements.push(
        <span key={match.index} className="text-foreground/80 font-bold">
          {token}
        </span>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return elements;
}

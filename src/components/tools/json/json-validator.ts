export interface JsonValidationResult {
  isValid: boolean;
  data?: unknown;
  formattedJson?: string;
  minifiedJson?: string;
  error?: {
    message: string;
    line?: number;
    column?: number;
    snippet?: string;
  };
}

/**
 * Validate and parse a JSON string, extracting error line/column details if invalid
 */
export function validateJson(rawInput: string, indent = 2): JsonValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: { message: "Input is empty. Paste or type JSON to validate." },
    };
  }

  try {
    const parsed = JSON.parse(rawInput);
    return {
      isValid: true,
      data: parsed,
      formattedJson: JSON.stringify(parsed, null, indent),
      minifiedJson: JSON.stringify(parsed),
    };
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || "Invalid JSON";
    const { line, column, snippet } = extractErrorPosition(rawInput, errorMsg);

    return {
      isValid: false,
      error: {
        message: errorMsg,
        line,
        column,
        snippet,
      },
    };
  }
}

function extractErrorPosition(
  text: string,
  errorMsg: string
): { line?: number; column?: number; snippet?: string } {
  let line: number | undefined;
  let column: number | undefined;

  // Pattern 1: "... at line X column Y" or "... line X column Y"
  const lineColMatch = errorMsg.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  } else {
    // Pattern 2: "... at position X"
    const posMatch = errorMsg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = text.slice(0, pos).split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
  }

  let snippet: string | undefined;
  if (line !== undefined) {
    const lines = text.split("\n");
    const errorLine = lines[line - 1] || "";
    snippet = `Line ${line}: ${errorLine.trim()}`;
  }

  return { line, column, snippet };
}

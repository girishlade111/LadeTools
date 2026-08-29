// Barrel export file for tool components
export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: "formatters" | "converters" | "generators" | "crypto" | "utilities";
  icon: string;
}

export const TOOLS_REGISTRY: ToolMeta[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "Format, validate, minfy, and inspect JSON payloads offline.",
    category: "formatters",
    icon: "Braces",
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode text, files, and URIs seamlessly.",
    category: "converters",
    icon: "Binary",
  },
  {
    id: "jwt-debugger",
    name: "JWT Token Debugger",
    description: "Inspect decoded headers, claims, expiration, and payload tokens.",
    category: "crypto",
    icon: "KeyRound",
  },
  {
    id: "hash-generator",
    name: "Hash & UUID Generator",
    description: "Generate MD5, SHA-256, SHA-512, and UUID v4 identifiers locally.",
    category: "generators",
    icon: "Hash",
  },
];

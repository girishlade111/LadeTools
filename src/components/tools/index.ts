import {
  Braces,
  Binary,
  KeyRound,
  FileCode2,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { JsonFormatterTool } from "./json-formatter";
import { Base64Tool } from "./base64-tool";
import { JwtDecoderTool } from "./jwt-decoder";
import { RegexTesterTool } from "./regex-tester";
import { UuidGeneratorTool } from "./uuid-generator";

export interface ToolMeta {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  category: "formatters" | "converters" | "crypto" | "utilities" | "generators";
  icon: LucideIcon;
  badge?: string;
  component: React.ComponentType;
}

export type ToolId =
  | "json-formatter"
  | "base64"
  | "jwt-decoder"
  | "regex-tester"
  | "uuid-timestamp";

export const TOOLS_REGISTRY: ToolMeta[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    shortName: "JSON",
    description: "Format, validate, prettify, and minify JSON data",
    category: "formatters",
    icon: Braces,
    badge: "Formatter",
    component: JsonFormatterTool,
  },
  {
    id: "base64",
    name: "Base64 Tool",
    shortName: "Base64",
    description: "Encode and decode text and string payloads",
    category: "converters",
    icon: Binary,
    badge: "Converter",
    component: Base64Tool,
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    shortName: "JWT",
    description: "Decode and inspect JSON Web Tokens and claims",
    category: "crypto",
    icon: KeyRound,
    badge: "Crypto",
    component: JwtDecoderTool,
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    shortName: "Regex",
    description: "Evaluate and test regular expressions in real-time",
    category: "utilities",
    icon: FileCode2,
    badge: "Utility",
    component: RegexTesterTool,
  },
  {
    id: "uuid-timestamp",
    name: "UUID / Timestamp",
    shortName: "UUID / Time",
    description: "Generate UUIDs v4 and convert Unix Epoch timestamps",
    category: "generators",
    icon: Hash,
    badge: "Generator",
    component: UuidGeneratorTool,
  },
];

export {
  JsonFormatterTool,
  Base64Tool,
  JwtDecoderTool,
  RegexTesterTool,
  UuidGeneratorTool,
};

export interface RegexGroupInfo {
  index: number;
  name?: string;
  value: string;
}

export interface RegexMatchItem {
  matchIndex: number;
  matchText: string;
  startIndex: number;
  endIndex: number;
  groups: RegexGroupInfo[];
}

export interface RegexEvaluationResult {
  isValid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  totalMatches: number;
  executionTimeMs: number;
}

export interface RegexPreset {
  id: string;
  name: string;
  category: string;
  pattern: string;
  flags: string;
  description: string;
  sampleText: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "email",
    name: "Email Address",
    category: "Web & Network",
    pattern: "([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})",
    flags: "gim",
    description: "Matches standard email addresses with user, domain, and TLD capture groups.",
    sampleText: `Contact team at support@ladetools.dev or send feedback to admin.user+test@company.co.uk.
Invalid: @bademail.com, user@.com, test@site`,
  },
  {
    id: "url",
    name: "HTTP / HTTPS URLs",
    category: "Web & Network",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "gi",
    description: "Matches web URLs with protocol, domain name, query params, and paths.",
    sampleText: `Visit our site at https://ladetools.dev/docs/getting-started?v=2.0#overview
Also check http://api.example.com:8080/v1/users?limit=10&page=1 and https://github.com/girishlade111/LadeTools`,
  },
  {
    id: "ipv4",
    name: "IPv4 Address",
    category: "Web & Network",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    description: "Matches valid IPv4 addresses from 0.0.0.0 to 255.255.255.255.",
    sampleText: `Local addresses: 127.0.0.1 and 192.168.1.1
Public DNS: 8.8.8.8, 1.1.1.1
Invalid IPs: 999.1.1.1, 256.0.0.1, 12.34.56`,
  },
  {
    id: "uuid",
    name: "UUID v4",
    category: "Identifiers",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}",
    flags: "gi",
    description: "Matches UUID / GUID strings (versions 1 through 5).",
    sampleText: `Generated IDs:
c851-4eac: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
Session ID: 4ae6f22e-c851-4eac-a3ec-82a42415d68f
Invalid: 1234-5678-90ab, gba7b810-9dad-11d1-80b4-00c04fd430c8`,
  },
  {
    id: "date-iso",
    name: "ISO 8601 Date (YYYY-MM-DD)",
    category: "Date & Time",
    pattern: "(?<year>\\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\\d|3[01])",
    flags: "g",
    description: "Matches calendar dates in YYYY-MM-DD format with named capture groups.",
    sampleText: `Project releases:
v1.0.0 on 2026-01-15
v2.0.0 scheduled for 2026-08-29
v3.0.0 roadmap: 2026-12-31
Invalid: 2026-13-45, 26-08-29, 2026/08/29`,
  },
  {
    id: "html-tag",
    name: "HTML / XML Tags",
    category: "Markup & Data",
    pattern: "<(?<tag>\\w+)(?:\\s+[^>]*)?>(?<content>.*?)<\\/\\k<tag>>|<(?<selfClosing>\\w+)(?:\\s+[^>]*)?\\/>",
    flags: "gms",
    description: "Matches opening/closing HTML tags with content, and self-closing tags.",
    sampleText: `<div class="container">
  <h1 id="title">Hello World</h1>
  <p>Building <strong>awesome</strong> offline developer tools.</p>
  <img src="icon.png" alt="Logo" />
</div>`,
  },
  {
    id: "hex-color",
    name: "Hex Color Codes",
    category: "Design",
    pattern: "#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b",
    flags: "gi",
    description: "Matches 3, 4, 6, and 8-character hex color codes (#FFF, #3B82F6, #10B981CC).",
    sampleText: `Theme Palette:
Primary: #3B82F6, Emerald: #10B981, Rose: #F43F5E
Short hex: #FFF, #000, #F00
With Alpha: #0a0d14F0, #3b82f680
Invalid: #12345, #GGGGGG`,
  },
];

/**
 * Execute regular expression against a test string and extract all match details safely
 */
export function evaluateRegex(
  pattern: string,
  flags: string,
  testString: string
): RegexEvaluationResult {
  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      totalMatches: 0,
      executionTimeMs: 0,
    };
  }

  const startTime = performance.now();

  try {
    const regex = new RegExp(pattern, flags);
    const matches: RegexMatchItem[] = [];
    const isGlobal = flags.includes("g");

    if (!isGlobal) {
      const match = regex.exec(testString);
      if (match) {
        const groups: RegexGroupInfo[] = [];

        // Named groups if available
        const namedGroups = match.groups || {};

        for (let i = 1; i < match.length; i++) {
          let name: string | undefined = undefined;
          for (const [k, v] of Object.entries(namedGroups)) {
            if (v === match[i]) {
              name = k;
              break;
            }
          }
          groups.push({
            index: i,
            name,
            value: match[i],
          });
        }

        matches.push({
          matchIndex: 1,
          matchText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          groups,
        });
      }
    } else {
      let match: RegExpExecArray | null;
      let count = 0;
      const MAX_MATCHES = 3000;

      while ((match = regex.exec(testString)) !== null && count < MAX_MATCHES) {
        count++;
        const groups: RegexGroupInfo[] = [];
        const namedGroups = match.groups || {};

        for (let i = 1; i < match.length; i++) {
          let name: string | undefined = undefined;
          for (const [k, v] of Object.entries(namedGroups)) {
            if (v === match[i]) {
              name = k;
              break;
            }
          }
          groups.push({
            index: i,
            name,
            value: match[i],
          });
        }

        matches.push({
          matchIndex: count,
          matchText: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          groups,
        });

        // Zero-length match guard to prevent infinite loops (e.g. /a*/ or /^/ or /\b/)
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    }

    const executionTimeMs = +(performance.now() - startTime).toFixed(2);

    return {
      isValid: true,
      matches,
      totalMatches: matches.length,
      executionTimeMs,
    };
  } catch (err: unknown) {
    const executionTimeMs = +(performance.now() - startTime).toFixed(2);
    return {
      isValid: false,
      error: (err as Error)?.message || "Invalid regular expression syntax.",
      matches: [],
      totalMatches: 0,
      executionTimeMs,
    };
  }
}

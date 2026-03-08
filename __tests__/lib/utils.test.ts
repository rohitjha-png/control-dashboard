import { cn, formatDuration, formatDate, maskSecret } from "@/lib/utils";

// ─── cn (class merger) ────────────────────────────────────────────────────────

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skip", "keep")).toBe("base keep");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    // tailwind-merge: bg-red-500 overrides bg-blue-500
    const result = cn("bg-blue-500", "bg-red-500");
    expect(result).toBe("bg-red-500");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn(undefined, null, "valid")).toBe("valid");
  });

  it("returns empty string with no args", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats 0 seconds as 0:00", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("formats 65 seconds as 1:05", () => {
    expect(formatDuration(65)).toBe("1:05");
  });

  it("formats 3600 seconds (1 hour) as 60:00", () => {
    expect(formatDuration(3600)).toBe("60:00");
  });

  it("pads single-digit seconds with leading zero", () => {
    expect(formatDuration(61)).toBe("1:01");
    expect(formatDuration(70)).toBe("1:10");
  });

  it("handles exactly 1 minute", () => {
    expect(formatDuration(60)).toBe("1:00");
  });

  it("handles large values", () => {
    // 125 seconds = 2m 5s
    expect(formatDuration(125)).toBe("2:05");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatDate("2026-03-07T10:30:00.000Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes the year in the output", () => {
    const result = formatDate("2026-03-07T10:30:00.000Z");
    expect(result).toMatch(/2026/);
  });

  it("handles epoch timestamp strings", () => {
    const result = formatDate(new Date(0).toISOString());
    expect(typeof result).toBe("string");
  });
});

// ─── maskSecret ───────────────────────────────────────────────────────────────

describe("maskSecret", () => {
  it("returns default mask for empty string", () => {
    expect(maskSecret("")).toBe("••••••••");
  });

  it("returns default mask for strings shorter than 8 chars", () => {
    expect(maskSecret("abc")).toBe("••••••••");
    expect(maskSecret("1234567")).toBe("••••••••");
  });

  it("shows first 4 and last 4 chars for 8+ char strings", () => {
    const result = maskSecret("sk-abcdefgh1234");
    expect(result).toMatch(/^sk-a/);
    expect(result).toMatch(/1234$/);
    expect(result).toContain("••••••••");
  });

  it("masks a realistic API key", () => {
    const key = "sk-proj-abcdefghijklmnop1234";
    const masked = maskSecret(key);
    expect(masked.startsWith("sk-p")).toBe(true);
    expect(masked.endsWith("1234")).toBe(true);
    expect(masked).not.toBe(key); // Should be masked
  });

  it("handles exactly 8 character string", () => {
    const result = maskSecret("12345678");
    expect(result).toMatch(/^1234/);
    expect(result).toMatch(/5678$/);
  });
});

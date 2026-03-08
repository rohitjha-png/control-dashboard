import {
  CALL_STATUS_CONFIG,
  LMS_STATUS_OPTIONS,
  LMS_SUB_STATUS_OPTIONS,
  BUYING_TIME_OPTIONS,
  CALL_PATCH_STATUS_OPTIONS,
  CREDENTIAL_GROUPS,
} from "@/lib/constants";

// ─── CALL_STATUS_CONFIG ───────────────────────────────────────────────────────

describe("CALL_STATUS_CONFIG", () => {
  const EXPECTED_STATUSES = [
    "pending",
    "initiating",
    "dialing",
    "ringing",
    "answered",
    "in_progress",
    "completed",
    "no_answer",
    "busy",
    "failed",
    "cancelled",
  ];

  it("has all expected statuses", () => {
    EXPECTED_STATUSES.forEach((status) => {
      expect(CALL_STATUS_CONFIG[status]).toBeDefined();
    });
  });

  it("each status has a label and a color", () => {
    Object.entries(CALL_STATUS_CONFIG).forEach(([, cfg]) => {
      expect(typeof cfg.label).toBe("string");
      expect(cfg.label.length).toBeGreaterThan(0);
      expect(typeof cfg.color).toBe("string");
      expect(cfg.color).toMatch(/^bg-/); // Tailwind bg class
    });
  });

  it("completed status has grey color", () => {
    expect(CALL_STATUS_CONFIG.completed.color).toMatch(/gray/);
  });

  it("failed status has red color", () => {
    expect(CALL_STATUS_CONFIG.failed.color).toMatch(/red/);
  });
});

// ─── LMS option arrays ────────────────────────────────────────────────────────

describe("LMS_STATUS_OPTIONS", () => {
  it("has at least one dealer allocation option", () => {
    const hasDealer = LMS_STATUS_OPTIONS.some((o) =>
      o.label.toLowerCase().includes("dealer")
    );
    expect(hasDealer).toBe(true);
  });

  it("each option has value and label", () => {
    LMS_STATUS_OPTIONS.forEach((opt) => {
      expect(typeof opt.value).toBe("string");
      expect(typeof opt.label).toBe("string");
    });
  });
});

describe("LMS_SUB_STATUS_OPTIONS", () => {
  it("has super hot option", () => {
    const hasSuperHot = LMS_SUB_STATUS_OPTIONS.some((o) =>
      o.label.toLowerCase().includes("super hot")
    );
    expect(hasSuperHot).toBe(true);
  });

  it("each option has a non-empty value and label", () => {
    LMS_SUB_STATUS_OPTIONS.forEach((opt) => {
      expect(opt.value.length).toBeGreaterThan(0);
      expect(opt.label.length).toBeGreaterThan(0);
    });
  });
});

describe("BUYING_TIME_OPTIONS", () => {
  it("has exactly 5 options", () => {
    expect(BUYING_TIME_OPTIONS).toHaveLength(5);
  });

  it("includes immediate and 3+ months options", () => {
    const values = BUYING_TIME_OPTIONS.map((o) => o.value);
    expect(values).toContain("immediate");
    expect(values).toContain("3_plus");
  });
});

// ─── CREDENTIAL_GROUPS ────────────────────────────────────────────────────────

describe("CREDENTIAL_GROUPS", () => {
  it("includes a livekit group", () => {
    const lk = CREDENTIAL_GROUPS.find((g) => g.id === "livekit");
    expect(lk).toBeDefined();
    const keys = lk!.fields.map((f) => f.key);
    expect(keys).toContain("LIVEKIT_URL");
    expect(keys).toContain("LIVEKIT_API_KEY");
    expect(keys).toContain("LIVEKIT_API_SECRET");
  });

  it("includes an LMS group", () => {
    const lms = CREDENTIAL_GROUPS.find((g) => g.id === "lms");
    expect(lms).toBeDefined();
  });

  it("every secret field is typed password", () => {
    CREDENTIAL_GROUPS.forEach((group) => {
      group.fields.forEach((field) => {
        if (
          field.key.includes("SECRET") ||
          field.key.includes("KEY") ||
          field.key.includes("TOKEN") ||
          field.key.includes("COOKIE")
        ) {
          expect(field.type).toBe("password");
        }
      });
    });
  });

  it("has no duplicate field keys across groups", () => {
    const allKeys = CREDENTIAL_GROUPS.flatMap((g) => g.fields.map((f) => f.key));
    const uniqueKeys = new Set(allKeys);
    expect(uniqueKeys.size).toBe(allKeys.length);
  });
});

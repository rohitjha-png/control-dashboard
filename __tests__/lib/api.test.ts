/**
 * Tests for lib/api.ts
 *
 * Strategy: mock global fetch; verify correct method, URL, headers, and
 * error propagation. No real network calls.
 */

import { api, fetcher } from "@/lib/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetch(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── api.get ─────────────────────────────────────────────────────────────────

describe("api.get", () => {
  it("sends GET to /api/<path>", async () => {
    mockFetch(200, { ok: true });
    await api.get("/agents");
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("/api/agents");
    // GET has no explicit method override
    expect(init.method).toBeUndefined();
  });

  it("returns parsed JSON on 200", async () => {
    mockFetch(200, { tenants: [], total: 0 });
    const result = await api.get("/agents");
    expect(result).toEqual({ tenants: [], total: 0 });
  });

  it("throws on 401", async () => {
    mockFetch(401, "Unauthorized");
    await expect(api.get("/agents")).rejects.toThrow();
  });

  it("throws on 500", async () => {
    mockFetch(500, "Internal Server Error");
    await expect(api.get("/agents")).rejects.toThrow();
  });

  it("sets Content-Type header", async () => {
    mockFetch(200, {});
    await api.get("/stats");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });
});

// ─── api.post ────────────────────────────────────────────────────────────────

describe("api.post", () => {
  it("sends POST with JSON-serialised body", async () => {
    mockFetch(200, { call_id: "c-123" });
    await api.post("/calls", { phone_number: "+919876543210" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/calls",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ phone_number: "+919876543210" }),
      })
    );
  });

  it("returns parsed JSON response", async () => {
    mockFetch(201, { call_id: "c-456", status: "pending" });
    const result = await api.post("/calls", {});
    expect(result).toEqual({ call_id: "c-456", status: "pending" });
  });

  it("throws on 422 Unprocessable Entity", async () => {
    mockFetch(422, { detail: "validation error" });
    await expect(api.post("/calls", {})).rejects.toThrow();
  });
});

// ─── api.patch ───────────────────────────────────────────────────────────────

describe("api.patch", () => {
  it("sends PATCH with correct method and body", async () => {
    mockFetch(200, { updated: ["LIVEKIT_URL"] });
    await api.patch("/credentials", { LIVEKIT_URL: "wss://new.livekit.io" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/credentials",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ LIVEKIT_URL: "wss://new.livekit.io" }),
      })
    );
  });
});

// ─── fetcher (SWR) ────────────────────────────────────────────────────────────

describe("fetcher", () => {
  it("calls api.get with the provided URL", async () => {
    mockFetch(200, { sessions: [] });
    const result = await fetcher("/telemetry");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/telemetry",
      expect.any(Object)
    );
    expect(result).toEqual({ sessions: [] });
  });

  it("propagates errors from api.get", async () => {
    mockFetch(403, "Forbidden");
    await expect(fetcher("/agents")).rejects.toThrow();
  });
});

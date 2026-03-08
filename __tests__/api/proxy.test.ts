/** @jest-environment node
 *
 * Tests for app/api/proxy.ts (BFF helper)
 *
 * NextRequest cannot be instantiated in jsdom (needs native Request global).
 * We pass a minimal duck-typed mock for the req parameter and verify
 * fetch call shape and response status codes.
 */

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    FASTAPI_BASE: "http://localhost:8000",
    VOICE_AGENT_API_KEY: "test-api-key",
  };
  jest.resetModules();
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

function mockFetch(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Response);
}

describe("proxyToFastAPI", () => {
  async function getProxy() {
    const mod = await import("@/app/api/proxy");
    return mod.proxyToFastAPI;
  }

  it("constructs correct FastAPI URL", async () => {
    mockFetch(200, {});
    const proxy = await getProxy();
    await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/tenants");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/tenants",
      expect.any(Object)
    );
  });

  it("includes X-API-Key from env", async () => {
    mockFetch(200, {});
    const proxy = await getProxy();
    await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/stats");
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers["X-API-Key"]).toBe("test-api-key");
  });

  it("defaults to localhost:8000 when FASTAPI_BASE unset", async () => {
    delete process.env.FASTAPI_BASE;
    jest.resetModules();
    mockFetch(200, {});
    const proxy = await getProxy();
    await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/health");
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/health",
      expect.any(Object)
    );
  });

  it("returns status 200 on success", async () => {
    mockFetch(200, { total: 0 });
    const proxy = await getProxy();
    const res = await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/calls");
    expect(res.status).toBe(200);
  });

  it("propagates 404 from upstream", async () => {
    mockFetch(404, { detail: "Not found" });
    const proxy = await getProxy();
    const res = await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/tenants/xyz");
    expect(res.status).toBe(404);
  });

  it("returns 502 when fetch rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    const proxy = await getProxy();
    const res = await proxy({ method: "GET" } as Parameters<typeof proxy>[0], "/agents");
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("forwards POST method and body", async () => {
    mockFetch(200, { call_id: "c-1" });
    const proxy = await getProxy();
    const body = JSON.stringify({ phone_number: "+919999" });
    await proxy({ method: "POST" } as Parameters<typeof proxy>[0], "/calls", { method: "POST", body });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(body);
  });
});

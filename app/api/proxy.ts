import { NextRequest, NextResponse } from "next/server";

const FASTAPI_BASE = process.env.FASTAPI_BASE ?? "http://localhost:8000";
const API_KEY = process.env.VOICE_AGENT_API_KEY ?? "";

export async function proxyToFastAPI(
  req: NextRequest,
  path: string,
  init?: RequestInit
): Promise<NextResponse> {
  const url = `${FASTAPI_BASE}/api/v1${path}`;
  try {
    const res = await fetch(url, {
      method: init?.method ?? req.method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        ...(init?.headers ?? {}),
      },
      body: init?.body,
      signal: AbortSignal.timeout(30000),
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 502 }
    );
  }
}

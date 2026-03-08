import { NextRequest, NextResponse } from "next/server";
import { proxyToFastAPI } from "../proxy";

export async function GET(req: NextRequest) {
  return proxyToFastAPI(req, "/credentials");
}

export async function PATCH(req: NextRequest) {
  // Extra auth check: require admin key header
  const adminKey = req.headers.get("x-admin-key");
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.text();
  return proxyToFastAPI(req, "/credentials", { method: "PATCH", body });
}

import { type NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/proxy";

export async function GET(req: NextRequest) {
  return proxyToFastAPI(req, "/worker/status");
}

export async function POST(req: NextRequest) {
  const { action } = await req.json().catch(() => ({ action: "start" }));
  const path = action === "stop" ? "/worker/stop" : action === "restart" ? "/worker/restart" : "/worker/start";
  return proxyToFastAPI(req, path, { method: "POST" });
}

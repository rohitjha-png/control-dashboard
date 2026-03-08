import { type NextRequest } from "next/server";
import { proxyToFastAPI } from "@/app/api/proxy";

export async function GET(req: NextRequest) {
  const lines = new URL(req.url).searchParams.get("lines") ?? "150";
  return proxyToFastAPI(req, `/worker/logs?lines=${lines}`);
}

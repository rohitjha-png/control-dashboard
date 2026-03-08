import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../proxy";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  return proxyToFastAPI(req, `/calls${search}`);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyToFastAPI(req, "/calls", { method: "POST", body });
}

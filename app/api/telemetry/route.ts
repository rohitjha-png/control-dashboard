import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../proxy";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  return proxyToFastAPI(req, `/telemetry${search}`);
}

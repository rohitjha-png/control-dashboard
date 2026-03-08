import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../proxy";

export async function GET(req: NextRequest) {
  // Maps to existing /tenants endpoint
  return proxyToFastAPI(req, "/tenants");
}

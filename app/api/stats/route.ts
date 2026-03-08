import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../proxy";

export async function GET(req: NextRequest) {
  return proxyToFastAPI(req, "/stats");
}

import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../../../proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToFastAPI(req, `/calls/${id}/transcript`);
}

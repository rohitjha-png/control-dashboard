import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../../../proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.text();
  return proxyToFastAPI(req, `/calls/${id}/lms-sync`, { method: "POST", body });
}

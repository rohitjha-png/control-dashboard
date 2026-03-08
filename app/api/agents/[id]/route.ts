import { NextRequest } from "next/server";
import { proxyToFastAPI } from "../../proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToFastAPI(req, `/tenants/${id}`);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.text();
  return proxyToFastAPI(req, `/tenants/${id}`, { method: "PATCH", body });
}

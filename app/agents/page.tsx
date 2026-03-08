"use client";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AgentSummary } from "@/types";
import { Bot, Phone, Clock, ChevronRight, RefreshCw } from "lucide-react";

interface TenantListResponse {
  tenants: Array<{
    tenant_id: string;
    name: string;
    description?: string;
    supported_languages?: string[];
    is_active?: boolean;
    total_calls?: number;
    last_call_at?: string | null;
  }>;
  total: number;
}

function mapTenantToAgent(
  t: TenantListResponse["tenants"][number]
): AgentSummary {
  return {
    id: t.tenant_id,
    name: t.name,
    description: t.description ?? "",
    status: t.is_active ? "online" : "offline",
    active_sessions: 0,
    total_calls: t.total_calls ?? 0,
    last_call_at: t.last_call_at ?? null,
    language: t.supported_languages?.[0] ?? "hi",
  };
}

export default function AgentsPage() {
  const { data, isLoading, mutate } = useSWR<TenantListResponse>(
    "/agents",
    fetcher,
    { refreshInterval: 15000 }
  );
  const agents = (data?.tenants ?? []).map(mapTenantToAgent);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Agents" subtitle="All registered LiveKit agents">
        <button
          onClick={() => mutate()}
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </Topbar>

      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
            Loading agents...
          </div>
        )}

        {!isLoading && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Bot size={40} className="text-gray-600" />
            <p className="text-gray-400 text-sm">No agents registered</p>
            <p className="text-gray-600 text-xs">
              Register a tenant in the backend to see it here
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentSummary }) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="hover:border-gray-600 transition-all cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/30 border border-blue-700/30 flex items-center justify-center">
                <Bot size={18} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-100">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.language}</p>
              </div>
            </div>
            <Badge
              variant={
                agent.status === "online"
                  ? "success"
                  : agent.status === "error"
                  ? "error"
                  : "outline"
              }
            >
              {agent.status}
            </Badge>
          </div>

          {agent.description && (
            <p className="text-xs text-gray-500 mb-4 line-clamp-2">
              {agent.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Phone size={11} className="text-gray-600" />
              <span>{agent.total_calls} calls</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  agent.active_sessions > 0 ? "bg-green-400" : "bg-gray-600"
                }`}
              />
              <span>{agent.active_sessions} active</span>
            </div>
          </div>

          {agent.last_call_at && (
            <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center gap-1.5 text-xs text-gray-600">
              <Clock size={10} />
              <span>Last call: {formatDate(agent.last_call_at)}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-end text-xs text-blue-400 gap-1">
            <span>Configure</span>
            <ChevronRight size={11} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

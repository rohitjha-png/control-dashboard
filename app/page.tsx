"use client";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetcher } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import type { PlatformStats, Call } from "@/types";
import { Bot, Phone, Activity, CheckCircle, TrendingUp, Plus, ChevronRight } from "lucide-react";
import { CALL_STATUS_CONFIG } from "@/lib/constants";

export default function OverviewPage() {
  const { data: stats } = useSWR<PlatformStats>("/stats", fetcher, { refreshInterval: 10000 });
  const { data: callsRaw } = useSWR<Call[] | { calls: Call[] }>("/calls?limit=5", fetcher, { refreshInterval: 15000 });
  const { data: agentsData } = useSWR<{ tenants: Array<{ tenant_id: string; name: string; is_active?: boolean; supported_languages?: string[] }> }>("/agents", fetcher, { refreshInterval: 30000 });
  const agents = (agentsData?.tenants ?? []).map((t) => ({
    id: t.tenant_id, name: t.name,
    status: t.is_active ? "online" : "offline",
    active_sessions: 0,
  }));

  const rawCalls = Array.isArray(callsRaw) ? callsRaw : (callsRaw as { calls: Call[] })?.calls ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentCalls: Call[] = rawCalls.map((c: any) => ({
    call_id: c.call_id,
    customer_phone: c.customer_phone ?? c.phone_number ?? "",
    customer_name: c.customer_name,
    agent_id: c.agent_id ?? c.tenant_id ?? "",
    status: c.status,
    duration_seconds: c.duration_seconds,
    created_at: c.created_at ?? c.initiated_at ?? "",
    ended_at: c.ended_at,
    outcome: c.outcome,
    session_id: c.session_id,
  }));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title="Overview"
        subtitle="Platform health and recent activity"
      >
        <Link
          href="/calls"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors"
        >
          <Plus size={12} />
          New Call
        </Link>
      </Topbar>

      <div className="p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Phone size={16} className="text-blue-400" />}
            label="Total Calls"
            value={stats?.total_calls ?? 0}
            sub="All time"
          />
          <StatCard
            icon={<TrendingUp size={16} className="text-green-400" />}
            label="Completed"
            value={stats?.completed_calls ?? 0}
            sub="Successful calls"
          />
          <StatCard
            icon={<Activity size={16} className="text-yellow-400" />}
            label="Active Calls"
            value={stats?.active_calls ?? 0}
            sub="Right now"
            highlight={(stats?.active_calls ?? 0) > 0}
          />
          <StatCard
            icon={<CheckCircle size={16} className="text-purple-400" />}
            label="Telemetry Sessions"
            value={stats?.total_sessions ?? 0}
            sub="Recorded"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent calls */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <Link
                  href="/calls"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  View all <ChevronRight size={10} />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentCalls.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 text-sm">No calls yet</div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {recentCalls.map((call) => {
                      const cfg = CALL_STATUS_CONFIG[call.status] ?? { label: call.status, color: "bg-gray-500" };
                      return (
                        <Link
                          key={call.call_id}
                          href={`/calls/${call.call_id}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">
                              {call.customer_name ?? call.customer_phone}
                            </p>
                            <p className="text-xs text-gray-500">{call.customer_phone}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-white ${cfg.color}`}
                            >
                              {cfg.label}
                            </span>
                            {call.duration_seconds && (
                              <span className="text-xs text-gray-500">
                                {formatDuration(call.duration_seconds)}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Agents overview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Agents</CardTitle>
                <Link
                  href="/agents"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Manage <ChevronRight size={10} />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {!agents || agents.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-sm">No agents registered</div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {agents.map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/agents/${agent.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-700 flex items-center justify-center">
                          <Bot size={13} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.active_sessions} active</p>
                        </div>
                        <Badge
                          variant={agent.status === "online" ? "success" : "outline"}
                        >
                          {agent.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Make a Call", href: "/calls", icon: Phone, color: "text-blue-400" },
                { label: "View Agents", href: "/agents", icon: Bot, color: "text-green-400" },
                { label: "Knowledge Base", href: "/knowledge", icon: Activity, color: "text-yellow-400" },
                { label: "Credentials", href: "/credentials", icon: CheckCircle, color: "text-purple-400" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 transition-all text-center"
                >
                  <action.icon size={20} className={action.color} />
                  <span className="text-xs font-medium text-gray-300">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-yellow-700/50" : ""}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-medium">{label}</span>
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-100">{value}</p>
        <p className="text-xs text-gray-600 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

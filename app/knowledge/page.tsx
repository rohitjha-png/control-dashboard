"use client";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { fetcher } from "@/lib/api";
import type { AgentSummary } from "@/types";
import { BookOpen, ChevronRight, Bot } from "lucide-react";

export default function KnowledgeBasePage() {
  const { data: agentsData, isLoading } = useSWR<{ tenants: Array<{ tenant_id: string; name: string }> }>("/agents", fetcher);
  const agents = (agentsData?.tenants ?? []).map((t) => ({ id: t.tenant_id, name: t.name }));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Knowledge Base" subtitle="Browse agent knowledge bases" />
      <div className="p-6">
        {isLoading && (
          <div className="text-center py-16 text-gray-500 text-sm">Loading agents...</div>
        )}
        {!isLoading && agents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <BookOpen size={36} className="text-gray-600" />
            <p className="text-gray-400 text-sm">No agents found</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/knowledge/${agent.id}`}>
              <Card className="hover:border-gray-600 transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-200">{agent.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">View knowledge base</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-600" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

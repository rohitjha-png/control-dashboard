"use client";
import { use, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetcher, api } from "@/lib/api";
import type { AgentConfig } from "@/types";
import { ChevronLeft, Save, Search } from "lucide-react";

export default function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const { data: agent, mutate } = useSWR<AgentConfig>(
    `/agents/${agentId}`,
    fetcher
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const kb = agent?.knowledge_base ?? "";
  const filtered = searchTerm
    ? kb
        .split("\n")
        .filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
        .join("\n")
    : kb;

  const handleEdit = () => {
    setEditContent(kb);
    setEditMode(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/agents/${agentId}`, { knowledge_base: editContent });
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 2000);
      mutate();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title={agent?.name ? `${agent.name} — Knowledge Base` : "Knowledge Base"}
        subtitle="Browse and edit agent knowledge"
      >
        <Link href="/knowledge" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200">
          <ChevronLeft size={12} /> Back
        </Link>
        {!editMode ? (
          <Button size="sm" variant="outline" onClick={handleEdit}>
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving} variant={saved ? "success" : "default"}>
              <Save size={12} /> {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        )}
      </Topbar>

      <div className="p-6 space-y-4">
        {/* Search */}
        {!editMode && (
          <div className="relative max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-md border border-gray-600 bg-gray-800 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {searchTerm
                ? `Search results for "${searchTerm}"`
                : "Full Knowledge Base"}
            </CardTitle>
            {!editMode && kb && (
              <span className="text-xs text-gray-600">
                {kb.split("\n").length} lines · {kb.length} chars
              </span>
            )}
          </CardHeader>
          <CardContent>
            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={30}
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-gray-200 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : kb ? (
              <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed overflow-auto max-h-[600px]">
                {filtered || "No results found"}
              </pre>
            ) : (
              <p className="text-gray-500 text-sm py-8 text-center">No knowledge base configured for this agent</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

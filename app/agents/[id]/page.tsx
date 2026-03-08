"use client";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { fetcher, api } from "@/lib/api";
import type { AgentConfig } from "@/types";
import { Save, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: agent, isLoading, mutate } = useSWR<AgentConfig>(
    `/agents/${id}`,
    fetcher as (url: string) => Promise<AgentConfig>
  );

  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (agent?.system_prompt) setPrompt(agent.system_prompt);
  }, [agent]);

  const savePrompt = async () => {
    setSaving(true);
    try {
      await api.patch(`/agents/${id}`, { system_prompt: prompt });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      mutate();
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 text-gray-500 text-sm">
        Loading agent...
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3">
        <p className="text-gray-400">Agent not found</p>
        <Link href="/agents" className="text-blue-400 text-sm hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title={agent.name} subtitle={`Agent ID: ${agent.id}`}>
        <Link
          href="/agents"
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
        >
          <ChevronLeft size={12} />
          Back
        </Link>
      </Topbar>

      <div className="p-6">
        <Tabs defaultValue="prompt">
          <TabsList>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
            <TabsTrigger value="flow">Conversation Flow</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>System Prompt</CardTitle>
                <Button
                  size="sm"
                  onClick={savePrompt}
                  loading={saving}
                  variant={saved ? "success" : "default"}
                >
                  <Save size={12} />
                  {saved ? "Saved!" : "Save"}
                </Button>
              </CardHeader>
              <CardContent>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={20}
                  className="w-full rounded-md border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-gray-200 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="System prompt..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flow">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Flow</CardTitle>
              </CardHeader>
              <CardContent>
                {agent.flow ? (
                  <pre className="text-xs text-gray-300 bg-gray-900 rounded-md p-4 overflow-auto max-h-[600px] border border-gray-700">
                    {JSON.stringify(agent.flow, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">No flow configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                {agent.knowledge_base ? (
                  <pre className="text-xs text-gray-300 bg-gray-900 rounded-md p-4 overflow-auto max-h-[600px] border border-gray-700 whitespace-pre-wrap">
                    {agent.knowledge_base}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">No knowledge base configured</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <div className="space-y-3">
              {agent.tools && agent.tools.length > 0 ? (
                agent.tools.map((tool, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs bg-gray-700 px-2 py-0.5 rounded text-blue-300 font-mono">
                          {tool.name}
                        </code>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{tool.description}</p>
                      {tool.parameters && (
                        <pre className="text-xs text-gray-500 bg-gray-900 rounded p-3 border border-gray-700 overflow-auto">
                          {JSON.stringify(tool.parameters, null, 2)}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">
                  No tools configured for this agent
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config">
            <Card>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <ConfigRow label="STT Provider" value={agent.stt_provider} />
                  <ConfigRow label="LLM Provider" value={agent.llm_provider} />
                  <ConfigRow label="TTS Provider" value={agent.tts_provider} />
                  <ConfigRow label="Language" value={agent.language} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm text-gray-200 font-mono">{value ?? "—"}</span>
    </div>
  );
}

"use client";
import { use, useEffect, useState, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { fetcher, api } from "@/lib/api";
import { formatDate, formatDuration, cn } from "@/lib/utils";
import {
  CALL_STATUS_CONFIG,
  LMS_STATUS_OPTIONS,
  LMS_SUB_STATUS_OPTIONS,
  BUYING_TIME_OPTIONS,
  CALL_PATCH_STATUS_OPTIONS,
} from "@/lib/constants";
import type { Call, TranscriptEntry, ToolCall, LMSFields } from "@/types";
import {
  ChevronLeft,
  Sparkles,
  Eye,
  Send,
  Check,
  AlertCircle,
  Clock,
  User,
  Bot,
} from "lucide-react";

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawCall } = useSWR<any>(`/calls/${id}`, fetcher, {
    refreshInterval: 5000,
  });
  // Map API fields to Call interface
  const call: Call | undefined = rawCall ? {
    call_id: rawCall.call_id,
    customer_phone: rawCall.customer_phone ?? rawCall.phone_number ?? "",
    customer_name: rawCall.customer_name,
    agent_id: rawCall.agent_id ?? rawCall.tenant_id ?? "",
    status: rawCall.status,
    duration_seconds: rawCall.duration_seconds,
    created_at: rawCall.created_at ?? rawCall.initiated_at ?? "",
    ended_at: rawCall.ended_at,
    outcome: rawCall.outcome,
    session_id: rawCall.session_id ?? rawCall.room_name,
  } : undefined;
  const { data: transcriptData } = useSWR<{ transcript: TranscriptEntry[] }>(
    `/calls/${id}/transcript`,
    fetcher
  );
  const { data: toolsData } = useSWR<{ tool_calls: ToolCall[] }>(
    `/calls/${id}/tools`,
    fetcher
  );

  const transcript = transcriptData?.transcript ?? [];
  const toolCalls = toolsData?.tool_calls ?? [];

  const [lmsFields, setLmsFields] = useState<LMSFields>({});
  const [lmsId, setLmsId] = useState("");
  const [activeTab, setActiveTab] = useState("transcript");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDryRun, setIsDryRun] = useState(true);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previewData, setPreviewData] = useState<any>(null);

  const extractLMS = async () => {
    setIsExtracting(true);
    setSyncResult(null);
    try {
      const data = await api.post<{ fields: LMSFields; message?: string }>(
        `/calls/${id}/extract-lms`,
        {}
      );
      if (data.fields && Object.keys(data.fields).length > 0) {
        setLmsFields(data.fields);
        setActiveTab("lms");
      } else {
        setSyncResult({ success: false, message: data.message ?? "No fields extracted — transcript may be empty" });
      }
    } catch (err) {
      setSyncResult({ success: false, message: String(err) });
    } finally {
      setIsExtracting(false);
    }
  };

  const previewLMS = async () => {
    setSyncResult(null);
    try {
      const data = await api.get<unknown>(`/calls/${id}/lms-preview`);
      setPreviewData(data);
    } catch (err) {
      setSyncResult({ success: false, message: String(err) });
    }
  };

  const syncToLMS = async () => {
    if (!isDryRun && !lmsId.trim()) {
      setSyncResult({ success: false, message: "Enter a 91Wheels Lead ID to sync (e.g. 3392464)" });
      return;
    }
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await api.post<{ success: boolean; message?: string; error?: string }>(
        `/calls/${id}/lms-sync`,
        { fields: lmsFields, lms_id: lmsId.trim(), dry_run: isDryRun }
      );
      setSyncResult({
        success: result.success ?? false,
        message: result.message ?? result.error ?? (result.success ? "Sync successful" : "Sync failed"),
      });
    } catch (err) {
      setSyncResult({ success: false, message: String(err) });
    } finally {
      setIsSyncing(false);
    }
  };

  const cfg = call ? (CALL_STATUS_CONFIG[call.status] ?? { label: call.status, color: "bg-gray-500" }) : null;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar
        title={call?.customer_name ?? call?.customer_phone ?? "Call Detail"}
        subtitle={call ? formatDate(call.created_at) : ""}
      >
        <Link href="/calls" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200">
          <ChevronLeft size={12} /> Back
        </Link>
      </Topbar>

      <div className="p-6 space-y-5">
        {/* Call header */}
        {call && (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-mono text-gray-200">{call.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Agent</p>
                  <p className="text-sm text-gray-200">{call.agent_id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-white ${cfg?.color}`}>
                    {cfg?.label}
                  </span>
                </div>
                {call.duration_seconds && (
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <div className="flex items-center gap-1 text-sm text-gray-200">
                      <Clock size={12} />
                      {formatDuration(call.duration_seconds)}
                    </div>
                  </div>
                )}
                {call.outcome && (
                  <div>
                    <p className="text-xs text-gray-500">Outcome</p>
                    <p className="text-sm text-gray-200">{call.outcome}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transcript">
              Transcript ({transcript.length})
            </TabsTrigger>
            <TabsTrigger value="tools">
              Tool Calls ({toolCalls.length})
            </TabsTrigger>
            <TabsTrigger value="lms">LMS Fields</TabsTrigger>
          </TabsList>

          {/* Transcript */}
          <TabsContent value="transcript">
            <Card>
              <CardContent className="p-5">
                {transcript.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 text-sm">
                    {call?.status === "completed"
                      ? "No transcript available for this call"
                      : "Call in progress — transcript will appear after completion"}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {transcript.map((entry, i) => (
                      <TranscriptBubble key={i} entry={entry} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tool Calls */}
          <TabsContent value="tools">
            {toolCalls.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">
                No tool calls for this session
              </div>
            ) : (
              <div className="space-y-3">
                {toolCalls.map((tc, i) => (
                  <ToolCallCard key={i} toolCall={tc} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* LMS Fields */}
          <TabsContent value="lms">
            <div className="space-y-4">
              {/* LMS Lead ID row */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <Input
                    label="91Wheels Lead ID"
                    placeholder="e.g. 3392464"
                    value={lmsId}
                    onChange={(e) => setLmsId(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 pb-2">Required for live sync. Find in 91Wheels CRM URL.</p>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={extractLMS}
                    loading={isExtracting}
                    variant="default"
                  >
                    <Sparkles size={12} />
                    {isExtracting ? "Extracting..." : "Auto-Extract from Transcript"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={previewLMS}>
                    <Eye size={12} />
                    Preview Payload
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={isDryRun}
                      onChange={(e) => setIsDryRun(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-800"
                    />
                    Dry run (no actual sync)
                  </label>
                  <Button
                    size="sm"
                    variant={isDryRun ? "outline" : "success"}
                    onClick={syncToLMS}
                    loading={isSyncing}
                  >
                    <Send size={12} />
                    {isDryRun ? "Dry Run Sync" : "Sync to LMS"}
                  </Button>
                </div>
              </div>

              {/* Sync result */}
              {syncResult && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-lg border text-sm",
                    syncResult.success
                      ? "bg-green-900/20 border-green-700/50 text-green-300"
                      : "bg-red-900/20 border-red-700/50 text-red-300"
                  )}
                >
                  {syncResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  {syncResult.message}
                </div>
              )}

              {/* Preview panel */}
              {previewData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payload Preview</CardTitle>
                    <Button size="sm" variant="ghost" onClick={() => setPreviewData(null)}>
                      Dismiss
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs text-gray-300 bg-gray-900 rounded p-3 overflow-auto max-h-48 border border-gray-700">
                      {JSON.stringify(previewData, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* LMS Form */}
              <LMSForm fields={lmsFields} onChange={setLmsFields} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TranscriptBubble({ entry }: { entry: TranscriptEntry }) {
  const isAgent = entry.speaker === "agent";
  return (
    <div className={cn("flex gap-2.5", isAgent ? "flex-row" : "flex-row-reverse")}>
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isAgent ? "bg-blue-800" : "bg-gray-700"
      )}>
        {isAgent ? <Bot size={11} className="text-blue-300" /> : <User size={11} className="text-gray-300" />}
      </div>
      <div className={cn("max-w-[80%] rounded-xl px-3.5 py-2.5",
        isAgent ? "bg-blue-900/30 border border-blue-800/40" : "bg-gray-700/50 border border-gray-600/40"
      )}>
        <p className="text-xs text-gray-200 leading-relaxed">{entry.text}</p>
        {entry.timestamp && (
          <p className="text-[10px] text-gray-600 mt-1">{entry.timestamp}</p>
        )}
      </div>
    </div>
  );
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-700 px-2 py-0.5 rounded text-green-300 font-mono">
              {toolCall.tool_name}
            </code>
            {toolCall.duration_ms && (
              <span className="text-xs text-gray-500">{toolCall.duration_ms}ms</span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
        {expanded && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Input</p>
              <pre className="text-xs text-gray-300 bg-gray-900 rounded p-3 overflow-auto border border-gray-700">
                {JSON.stringify(toolCall.input, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Output</p>
              <pre className="text-xs text-gray-300 bg-gray-900 rounded p-3 overflow-auto border border-gray-700">
                {JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LMSForm({
  fields,
  onChange,
}: {
  fields: LMSFields;
  onChange: (f: LMSFields) => void;
}) {
  const update = (key: keyof LMSFields, value: unknown) =>
    onChange({ ...fields, [key]: value });

  return (
    <div className="space-y-5">
      {/* Lead Action */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Status"
              options={LMS_STATUS_OPTIONS}
              placeholder="-- Select --"
              value={fields.status ?? ""}
              onChange={(e) => update("status", e.target.value)}
            />
            <Select
              label="Select Sub Status"
              options={LMS_SUB_STATUS_OPTIONS}
              placeholder="-- Select --"
              value={fields.sub_status ?? ""}
              onChange={(e) => update("sub_status", e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-400">Update Comment</label>
              <textarea
                value={fields.update_comment ?? ""}
                onChange={(e) => update("update_comment", e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Auto-generated comment..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-gray-400">Agent Remarks</label>
              <textarea
                value={fields.agent_remarks ?? ""}
                onChange={(e) => update("agent_remarks", e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Agent remarks..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bike / Assignment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Bike Suggested / Assignment Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Select Make"
              placeholder="e.g. Honda"
              value={fields.bike_make ?? ""}
              onChange={(e) => update("bike_make", e.target.value)}
            />
            <Input
              label="Select Type"
              placeholder="e.g. Scooter"
              value={fields.bike_type ?? ""}
              onChange={(e) => update("bike_type", e.target.value)}
            />
            <Input
              label="Select Model"
              placeholder="e.g. Activa"
              value={fields.bike_model ?? ""}
              onChange={(e) => update("bike_model", e.target.value)}
            />
            <Input
              label="Select Variant"
              placeholder="e.g. H-Smart"
              value={fields.bike_variant ?? ""}
              onChange={(e) => update("bike_variant", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Timing */}
      <Card>
        <CardHeader>
          <CardTitle>Location & Timing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Select
              label="Buying Time"
              options={BUYING_TIME_OPTIONS}
              placeholder="-- Select --"
              value={fields.buying_time ?? ""}
              onChange={(e) => update("buying_time", e.target.value)}
            />
            <Input
              label="Select State"
              placeholder="State"
              value={fields.state ?? ""}
              onChange={(e) => update("state", e.target.value)}
            />
            <Input
              label="Select City"
              placeholder="City"
              value={fields.city ?? ""}
              onChange={(e) => update("city", e.target.value)}
            />
            <Input
              label="Select Dealer"
              placeholder="Dealer"
              value={fields.dealer ?? ""}
              onChange={(e) => update("dealer", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer & Booking */}
      <Card>
        <CardHeader>
          <CardTitle>Customer & Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-3">
              <Toggle
                checked={fields.existing_customer ?? false}
                onChange={(v) => update("existing_customer", v)}
                label="Existing Customer"
              />
            </div>
            <Input
              label="Name To Book"
              placeholder="Customer name for booking"
              value={fields.name_to_book ?? ""}
              onChange={(e) => update("name_to_book", e.target.value)}
            />
            <Select
              label="Call Patch Status"
              options={CALL_PATCH_STATUS_OPTIONS}
              placeholder="-- Select --"
              value={fields.call_patch_status ?? ""}
              onChange={(e) => update("call_patch_status", e.target.value)}
            />
            <Input
              label="Expected Purchase Date"
              type="date"
              value={fields.expected_purchase_date ?? ""}
              onChange={(e) => update("expected_purchase_date", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-6">
            <Toggle
              checked={fields.send_dealer_details ?? false}
              onChange={(v) => update("send_dealer_details", v)}
              label="Send Dealer Details To Customer"
            />
            <Toggle
              checked={fields.test_ride_required ?? false}
              onChange={(v) => update("test_ride_required", v)}
              label="Test Ride Required"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

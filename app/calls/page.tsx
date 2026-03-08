"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { fetcher, api } from "@/lib/api";
import { formatDate, formatDuration } from "@/lib/utils";
import { CALL_STATUS_CONFIG } from "@/lib/constants";
import type { Call } from "@/types";
import { Phone, Plus, RefreshCw, ChevronRight, User, Search } from "lucide-react";

const PHONE_RE = /^\+?[1-9]\d{7,14}$/;

export default function CallsPage() {
  const [newCallOpen, setNewCallOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: callsRaw, isLoading, mutate } = useSWR<Call[] | { calls: Call[] }>(
    "/calls?limit=50",
    fetcher,
    { refreshInterval: 10000 }
  );
  const { data: agentsData } = useSWR<{ tenants: Array<{ tenant_id: string; name: string }> }>(
    "/agents",
    fetcher
  );
  const agents = agentsData?.tenants ?? [];
  const rawList = Array.isArray(callsRaw) ? callsRaw : (callsRaw as { calls: Call[] })?.calls ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calls: Call[] = rawList.map((c: any) => ({
    call_id: c.call_id,
    customer_phone: c.customer_phone ?? c.phone_number ?? "",
    customer_name: c.customer_name,
    agent_id: c.agent_id ?? c.tenant_id ?? "",
    status: c.status,
    duration_seconds: c.duration_seconds,
    created_at: c.created_at ?? c.initiated_at ?? "",
    ended_at: c.ended_at,
    outcome: c.outcome,
    session_id: c.session_id ?? c.room_name,
  }));

  const filtered = useMemo(() => {
    let list = calls;
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_phone?.toLowerCase().includes(q) ||
          c.customer_name?.toLowerCase().includes(q) ||
          c.agent_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [calls, statusFilter, search]);

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
    { value: "dialing", label: "Dialing" },
    { value: "answered", label: "Answered" },
    { value: "no_answer", label: "No Answer" },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Calls" subtitle={`${filtered.length} of ${calls.length} calls`}>
        <button onClick={() => mutate()} className="p-1.5 text-gray-400 hover:text-gray-200">
          <RefreshCw size={14} />
        </button>
        <Button size="sm" onClick={() => setNewCallOpen(true)}>
          <Plus size={12} />
          New Call
        </Button>
      </Topbar>

      <div className="p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-700 bg-gray-800 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="text-center py-16 text-gray-500 text-sm">Loading calls...</div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Phone size={36} className="text-gray-600" />
            <p className="text-gray-400 text-sm">
              {calls.length === 0 ? "No calls yet" : "No calls match your filter"}
            </p>
            {calls.length === 0 && (
              <Button size="sm" onClick={() => setNewCallOpen(true)}>
                <Plus size={12} /> Make First Call
              </Button>
            )}
          </div>
        )}

        {filtered.length > 0 && (
          <Card>
            <div className="divide-y divide-gray-700/50">
              {filtered.map((call) => (
                <CallRow key={call.call_id} call={call} />
              ))}
            </div>
          </Card>
        )}
      </div>

      <NewCallDialog
        open={newCallOpen}
        onClose={() => setNewCallOpen(false)}
        agents={agents}
        onSuccess={() => { mutate(); setNewCallOpen(false); }}
      />
    </div>
  );
}

function CallRow({ call }: { call: Call }) {
  const cfg = CALL_STATUS_CONFIG[call.status] ?? { label: call.status, color: "bg-gray-500" };
  return (
    <Link
      href={`/calls/${call.call_id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-700/20 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <User size={14} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200">
          {call.customer_name ?? call.customer_phone}
        </p>
        <p className="text-xs text-gray-500">
          {call.customer_name ? call.customer_phone + " · " : ""}
          {call.agent_id}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs text-white ${cfg.color}`}>
          {cfg.label}
        </span>
        {call.duration_seconds != null && call.duration_seconds > 0 && (
          <span className="text-xs text-gray-500">{formatDuration(call.duration_seconds)}</span>
        )}
        <span className="text-xs text-gray-600">{formatDate(call.created_at)}</span>
        <ChevronRight size={13} className="text-gray-600" />
      </div>
    </Link>
  );
}

function NewCallDialog({
  open,
  onClose,
  agents,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  agents: Array<{ tenant_id: string; name: string }>;
  onSuccess: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [language, setLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const agentOptions = agents.map((a) => ({ value: a.tenant_id, label: a.name }));
  const langOptions = [
    { value: "hi", label: "Hindi" },
    { value: "en", label: "English" },
    { value: "hi-en", label: "Hinglish" },
  ];

  const handleSubmit = async () => {
    const trimmed = phone.trim();
    if (!trimmed || !agentId) {
      setError("Phone number and agent are required");
      return;
    }
    if (!PHONE_RE.test(trimmed)) {
      setError("Enter a valid phone number (8–15 digits, optionally starting with +)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/calls", {
        phone_number: trimmed,
        tenant_id: agentId,
        customer_info: name.trim() ? { name: name.trim(), phone_number: trimmed } : undefined,
        metadata: { language },
      });
      setPhone("");
      setName("");
      setAgentId("");
      onSuccess();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Initiate New Call" className="max-w-md">
      <div className="space-y-4">
        <Input
          label="Customer Phone Number"
          placeholder="+91 XXXXX XXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Input
          label="Customer Name (optional)"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          label="Select Agent"
          options={agentOptions}
          placeholder="-- Select Agent --"
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
        />
        <Select
          label="Language"
          options={langOptions}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">
            <Phone size={13} />
            Call Now
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

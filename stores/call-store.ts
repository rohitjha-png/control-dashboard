import { create } from "zustand";
import type { Call, InitiateCallRequest, TranscriptEntry, ToolCall, LMSFields } from "@/types";
import { api } from "@/lib/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCall(c: any): Call {
  return {
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
  };
}

interface CallStore {
  calls: Call[];
  selectedCall: Call | null;
  transcript: TranscriptEntry[];
  toolCalls: ToolCall[];
  lmsFields: LMSFields | null;
  isLoading: boolean;
  isExtracting: boolean;
  error: string | null;
  fetchCalls: (params?: Record<string, string>) => Promise<void>;
  fetchCall: (id: string) => Promise<void>;
  fetchTranscript: (id: string) => Promise<void>;
  fetchToolCalls: (id: string) => Promise<void>;
  initiateCall: (req: InitiateCallRequest) => Promise<Call>;
  extractLMS: (callId: string) => Promise<void>;
  setLMSFields: (fields: LMSFields) => void;
  clearSelected: () => void;
}

export const useCallStore = create<CallStore>((set) => ({
  calls: [],
  selectedCall: null,
  transcript: [],
  toolCalls: [],
  lmsFields: null,
  isLoading: false,
  isExtracting: false,
  error: null,

  fetchCalls: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      const data = await api.get<Call[] | { calls: Call[] }>(`/calls${qs}`);
      const raw = Array.isArray(data) ? data : (data as { calls: Call[] }).calls ?? [];
      set({ calls: raw.map(mapCall), isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  fetchCall: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<Call>(`/calls/${id}`);
      set({ selectedCall: mapCall(data), isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  fetchTranscript: async (id: string) => {
    try {
      const data = await api.get<{ transcript: TranscriptEntry[] }>(`/calls/${id}/transcript`);
      set({ transcript: data.transcript ?? [] });
    } catch {
      set({ transcript: [] });
    }
  },

  fetchToolCalls: async (id: string) => {
    try {
      const data = await api.get<{ tool_calls: ToolCall[] }>(`/calls/${id}/tools`);
      set({ toolCalls: data.tool_calls ?? [] });
    } catch {
      set({ toolCalls: [] });
    }
  },

  initiateCall: async (req: InitiateCallRequest) => {
    const data = await api.post<Call>("/calls", {
      phone_number: req.phone_number,
      tenant_id: req.agent_id,
      customer_info: req.customer_name
        ? { name: req.customer_name, phone_number: req.phone_number }
        : undefined,
      metadata: { language: req.language ?? "hi" },
    });
    const mapped = mapCall(data);
    set((state) => ({ calls: [mapped, ...state.calls] }));
    return mapped;
  },

  extractLMS: async (callId: string) => {
    set({ isExtracting: true });
    try {
      const data = await api.post<{ fields: LMSFields }>(`/calls/${callId}/extract-lms`, {});
      set({ lmsFields: data.fields, isExtracting: false });
    } catch (err) {
      set({ error: String(err), isExtracting: false });
    }
  },

  setLMSFields: (fields: LMSFields) => set({ lmsFields: fields }),

  clearSelected: () =>
    set({ selectedCall: null, transcript: [], toolCalls: [], lmsFields: null }),
}));

import { create } from "zustand";
import type { AgentSummary, AgentConfig } from "@/types";
import { api } from "@/lib/api";

interface AgentStore {
  agents: AgentSummary[];
  selectedAgent: AgentConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  fetchAgent: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  selectedAgent: null,
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<AgentSummary[]>("/agents");
      set({ agents: data, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  fetchAgent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.get<AgentConfig>(`/agents/${id}`);
      set({ selectedAgent: data, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  clearSelected: () => set({ selectedAgent: null }),
}));

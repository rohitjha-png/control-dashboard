// ─── Agent / Tenant ─────────────────────────────────────────────────────────

export interface AgentSummary {
  id: string;
  name: string;
  description: string;
  status: "online" | "offline" | "error";
  active_sessions: number;
  total_calls: number;
  last_call_at: string | null;
  language: string;
}

export interface AgentConfig {
  // Maps to TenantDetailResponse from FastAPI
  tenant_id: string;
  id?: string;
  name: string;
  description?: string;
  system_prompt?: string;
  knowledge_base?: string;
  flow?: Record<string, unknown>;
  flows?: Record<string, unknown>[];
  tools?: ToolDefinition[];
  stt_provider?: string;
  llm_provider?: string;
  llm_model?: string;
  tts_provider?: string;
  voice_id?: string;
  primary_language?: string;
  supported_languages?: string[];
  language?: string;
  // Any other detail fields
  [key: string]: unknown;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ─── Calls ──────────────────────────────────────────────────────────────────

export type CallStatus =
  | "pending"
  | "initiating"
  | "dialing"
  | "ringing"
  | "answered"
  | "in_progress"
  | "completed"
  | "no_answer"
  | "busy"
  | "failed"
  | "cancelled";

export interface Call {
  call_id: string;
  customer_phone: string;
  customer_name?: string;
  agent_id: string;
  status: CallStatus;
  duration_seconds?: number;
  created_at: string;
  ended_at?: string;
  outcome?: string;
  session_id?: string;
}

export interface InitiateCallRequest {
  phone_number: string;
  customer_name?: string;
  agent_id: string;
  language?: string;
}

// ─── Transcript ──────────────────────────────────────────────────────────────

export interface TranscriptEntry {
  speaker: "agent" | "customer";
  text: string;
  timestamp?: string;
  start_time?: number;
  end_time?: number;
}

export interface ToolCall {
  id: string;
  tool_name: string;
  input: Record<string, unknown>;
  output: unknown;
  timestamp: string;
  duration_ms?: number;
}

// ─── LMS Fields ──────────────────────────────────────────────────────────────

export interface LMSFields {
  status?: string;
  sub_status?: string;
  update_comment?: string;
  agent_remarks?: string;
  bike_make?: string;
  bike_type?: string;
  bike_model?: string;
  bike_variant?: string;
  buying_time?: string;
  state?: string;
  city?: string;
  dealer?: string;
  existing_customer?: boolean;
  name_to_book?: string;
  call_patch_status?: string;
  expected_purchase_date?: string;
  send_dealer_details?: boolean;
  test_ride_required?: boolean;
  confidence?: Record<string, number>;
}

export interface LMSExtractionResult {
  fields: LMSFields;
  raw_extraction: string;
  confidence_scores: Record<string, number>;
}

export interface LMSSyncResult {
  success: boolean;
  message: string;
  lms_response?: unknown;
  dry_run?: boolean;
}

// ─── Credentials ─────────────────────────────────────────────────────────────

export interface Credentials {
  [key: string]: string;
}

// ─── Monitor ─────────────────────────────────────────────────────────────────

export interface LiveSession {
  session_id: string;
  customer_phone: string;
  customer_name?: string;
  agent_id: string;
  status: string;
  duration_seconds: number;
  started_at: string;
}

export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  total_calls: number;
  active_calls: number;
  completed_calls: number;
  failed_calls: number;
  total_sessions: number;
  avg_call_duration: number;
  // Aliases used by some dashboard pages
  calls_today?: number;
  active_sessions?: number;
  avg_duration_seconds?: number;
  success_rate?: number;
  lms_synced_today?: number;
}

export interface LatencyStats {
  stt_ms: number;
  llm_ms: number;
  tts_ms: number;
  total_turn_ms: number;
}

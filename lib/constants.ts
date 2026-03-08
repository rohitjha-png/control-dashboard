export const CALL_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-gray-500" },
  initiating: { label: "Initiating", color: "bg-blue-500" },
  dialing: { label: "Dialing", color: "bg-yellow-500" },
  ringing: { label: "Ringing", color: "bg-yellow-400" },
  answered: { label: "Answered", color: "bg-green-400" },
  in_progress: { label: "In Progress", color: "bg-green-500" },
  completed: { label: "Completed", color: "bg-gray-400" },
  no_answer: { label: "No Answer", color: "bg-orange-500" },
  busy: { label: "Busy", color: "bg-red-400" },
  failed: { label: "Failed", color: "bg-red-600" },
  cancelled: { label: "Cancelled", color: "bg-gray-600" },
};

export const LMS_STATUS_OPTIONS = [
  { value: "6", label: "Dealer Allocation" },
  { value: "7", label: "Follow-up" },
  { value: "8", label: "Closed" },
  { value: "9", label: "Not Interested" },
];

export const LMS_SUB_STATUS_OPTIONS = [
  { value: "super_hot", label: "Super Hot [1 Week]" },
  { value: "hot", label: "Hot [2 Weeks]" },
  { value: "warm", label: "Warm [1 Month]" },
  { value: "cold", label: "Cold [3 Months]" },
  { value: "busy", label: "Busy / Will Call Back" },
  { value: "not_answering", label: "Not Answering" },
  { value: "already_purchased", label: "Already Purchased" },
  { value: "not_interested", label: "Not Interested" },
  { value: "language_barrier", label: "Language Barrier" },
];

export const BUYING_TIME_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "1_month", label: "Within 1 Month" },
  { value: "2_months", label: "Within 2 Months" },
  { value: "3_months", label: "Within 3 Months" },
  { value: "3_plus", label: "3+ Months" },
];

export const CALL_PATCH_STATUS_OPTIONS = [
  { value: "patched", label: "Patched" },
  { value: "not_patched", label: "Not Patched" },
  { value: "pending", label: "Pending" },
];

export const CREDENTIAL_GROUPS = [
  {
    id: "livekit",
    label: "LiveKit Cloud",
    fields: [
      { key: "LIVEKIT_URL", label: "LiveKit URL", type: "text" },
      { key: "LIVEKIT_API_KEY", label: "API Key", type: "password" },
      { key: "LIVEKIT_API_SECRET", label: "API Secret", type: "password" },
    ],
  },
  {
    id: "llm",
    label: "LLM (OpenAI)",
    fields: [
      { key: "OPENAI_API_KEY", label: "OpenAI API Key", type: "password" },
      { key: "OPENAI_MODEL", label: "Model", type: "text" },
    ],
  },
  {
    id: "stt",
    label: "STT (Deepgram)",
    fields: [
      { key: "DEEPGRAM_API_KEY", label: "Deepgram API Key", type: "password" },
    ],
  },
  {
    id: "tts",
    label: "TTS (Cartesia)",
    fields: [
      { key: "CARTESIA_API_KEY", label: "Cartesia API Key", type: "password" },
      { key: "CARTESIA_VOICE_ID", label: "Voice ID", type: "text" },
    ],
  },
  {
    id: "sip",
    label: "SIP / Plivo",
    fields: [
      { key: "PLIVO_AUTH_ID", label: "Auth ID", type: "password" },
      { key: "PLIVO_AUTH_TOKEN", label: "Auth Token", type: "password" },
      { key: "PLIVO_PHONE_NUMBER", label: "Phone Number", type: "text" },
      { key: "SIP_TRUNK_NUMBER", label: "SIP Trunk Number", type: "text" },
    ],
  },
  {
    id: "lms",
    label: "LMS (91Wheels)",
    fields: [
      { key: "LMS_SESSION_COOKIE", label: "Session Cookie (PHPSESSID)", type: "password" },
      { key: "LMS_BASE_URL", label: "LMS Base URL", type: "text" },
    ],
  },
  {
    id: "auth",
    label: "API Auth",
    fields: [
      { key: "VOICE_AGENT_API_KEY", label: "Voice Agent API Key", type: "password" },
    ],
  },
];

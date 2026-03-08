"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetcher, api } from "@/lib/api";
import { Play, Square, RefreshCw, Terminal, Cpu, Zap } from "lucide-react";

interface WorkerStatus {
  running: boolean;
  pid: number | null;
}

interface WorkerLogs {
  lines: string[];
  log_file: string;
}

export default function WorkerPage() {
  const { data: status, mutate: mutateStatus } = useSWR<WorkerStatus>(
    "/worker",
    fetcher,
    { refreshInterval: 3000 }
  );
  const { data: logs, mutate: mutateLogs } = useSWR<WorkerLogs>(
    "/worker/logs?lines=200",
    fetcher,
    { refreshInterval: 5000 }
  );

  const [actionLoading, setActionLoading] = useState<"start" | "stop" | "restart" | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs?.lines]);

  const doAction = useCallback(async (action: "start" | "stop" | "restart") => {
    setActionLoading(action);
    setActionMsg(null);
    try {
      const res = await api.post<{ message?: string; pid?: number }>("/worker", { action });
      const msg = res.message ?? (action === "start" ? `Started (PID ${res.pid})` : action === "stop" ? "Stopped" : `Restarted (PID ${res.pid})`);
      setActionMsg(msg);
    } catch (err) {
      setActionMsg(String(err));
    } finally {
      setActionLoading(null);
      await new Promise((r) => setTimeout(r, 1500));
      mutateStatus();
      mutateLogs();
    }
  }, [mutateStatus, mutateLogs]);

  const running = status?.running ?? false;
  const pid = status?.pid;

  function logColor(line: string): string {
    if (/ERROR|CRITICAL|error|exception/i.test(line)) return "text-red-400";
    if (/WARN|warning/i.test(line)) return "text-yellow-400";
    if (/INFO.*start|connect|ready|session/i.test(line)) return "text-green-400";
    if (/DEBUG/i.test(line)) return "text-gray-600";
    return "text-gray-300";
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Topbar title="Agent Worker" subtitle="Deploy and monitor the LiveKit agent worker">
        <button
          onClick={() => { mutateStatus(); mutateLogs(); }}
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </Topbar>

      <div className="p-6 space-y-6">
        {/* Status card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${running ? "bg-green-500/10 border border-green-500/30" : "bg-gray-700/40 border border-gray-600/30"}`}>
                  <Cpu size={22} className={running ? "text-green-400" : "text-gray-500"} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-100">LiveKit Agent Worker</p>
                    <Badge variant={running ? "success" : "outline"}>
                      {running ? "Running" : "Stopped"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {running ? `PID ${pid} — connecting to LiveKit Cloud` : "Worker is not running. Start it to accept calls."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!running && (
                  <Button
                    onClick={() => doAction("start")}
                    disabled={actionLoading !== null}
                    className="bg-green-600 hover:bg-green-500 text-white"
                  >
                    {actionLoading === "start" ? <RefreshCw size={14} className="animate-spin mr-1" /> : <Play size={14} className="mr-1" />}
                    Start Worker
                  </Button>
                )}
                {running && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => doAction("restart")}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "restart" ? <RefreshCw size={14} className="animate-spin mr-1" /> : <Zap size={14} className="mr-1" />}
                      Restart
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => doAction("stop")}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "stop" ? <RefreshCw size={14} className="animate-spin mr-1" /> : <Square size={14} className="mr-1" />}
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>

            {actionMsg && (
              <div className="mt-4 px-3 py-2 rounded bg-gray-800/60 border border-gray-700/50 text-xs text-gray-300">
                {actionMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live indicator */}
        {running && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Worker is live — accepting inbound jobs from LiveKit Cloud
          </div>
        )}

        {/* Log viewer */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Terminal size={13} />
                <span>Worker Logs</span>
                {logs?.log_file && <span className="text-gray-600">— {logs.log_file}</span>}
              </div>
              <button
                onClick={() => mutateLogs()}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
            </div>
            <div
              ref={logRef}
              className="font-mono text-xs p-4 h-[480px] overflow-y-auto bg-[#0a0c10] rounded-b"
            >
              {!logs || logs.lines.length === 0 ? (
                <p className="text-gray-600 italic">No log output yet. Start the worker to see logs here.</p>
              ) : (
                logs.lines.map((line, i) => (
                  <div key={i} className={`leading-5 whitespace-pre-wrap break-all ${logColor(line)}`}>
                    {line}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

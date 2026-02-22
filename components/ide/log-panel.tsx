"use client";

import React from "react";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Bug,
  Trash2,
} from "lucide-react";

interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | "success" | "debug";
  time: string;
  source: string;
  message: string;
}

const DEMO_LOGS: LogEntry[] = [
  { id: "1", level: "info", time: "10:23:01", source: "system", message: "Browser launched (Chromium)" },
  { id: "2", level: "info", time: "10:23:02", source: "recorder", message: "Recording started on https://example.com/login" },
  { id: "3", level: "success", time: "10:23:03", source: "runner", message: "Step 1: Navigate -- passed (120ms)" },
  { id: "4", level: "success", time: "10:23:04", source: "runner", message: 'Step 2: Click [data-testid="login-button"] -- passed (45ms)' },
  { id: "5", level: "success", time: "10:23:05", source: "runner", message: 'Step 3: Type "testuser" -- passed (80ms)' },
  { id: "6", level: "info", time: "10:23:06", source: "runner", message: "Step 4: Running..." },
  { id: "7", level: "debug", time: "10:23:06", source: "browser", message: 'Selector resolved: [data-testid="password-input"]' },
  { id: "8", level: "warn", time: "10:23:07", source: "system", message: "Slow selector resolution (>500ms)" },
];

const LEVEL_ICON: Record<string, React.ReactNode> = {
  info: <Info size={11} className="text-[#4f8cff]" />,
  warn: <AlertTriangle size={11} className="text-[#f0a500]" />,
  error: <XCircle size={11} className="text-[#ff5b5b]" />,
  success: <CheckCircle size={11} className="text-[#00d4aa]" />,
  debug: <Bug size={11} className="text-[#7a7a9a]" />,
};

const LEVEL_MSG_CLASS: Record<string, string> = {
  info: "text-[#e0e0e0]",
  warn: "text-[#f0a500]",
  error: "text-[#ff5b5b]",
  success: "text-[#00d4aa]",
  debug: "text-[#7a7a9a]",
};

export function IDELogPanel() {
  return (
    <div className="flex flex-col w-[260px] min-w-[200px] bg-[#16213e] border-l border-[#2a2a4a] overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 h-9 px-3 border-b border-[#2a2a4a] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0a0c0]">
          Logs
        </h3>
        <span className="text-[11px] px-1.5 py-0 rounded-full bg-[#2a2a4a] text-[#7a7a9a] font-medium">
          {DEMO_LOGS.length}
        </span>
        <button className="ml-auto flex items-center justify-center w-6 h-6 rounded text-[#7a7a9a] hover:bg-[#ff5b5b] hover:text-[#fff] transition-all">
          <Trash2 size={11} />
        </button>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px]">
        {DEMO_LOGS.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-1.5 px-2.5 py-1 border-b border-[rgba(42,42,74,0.4)] leading-relaxed"
          >
            <span className="text-[10px] text-[#7a7a9a] flex-shrink-0 pt-px">
              {entry.time}
            </span>
            <span className="flex-shrink-0 pt-0.5">
              {LEVEL_ICON[entry.level]}
            </span>
            <span className="text-[10px] text-[#a0a0c0] flex-shrink-0">
              [{entry.source}]
            </span>
            <span className={`break-words ${LEVEL_MSG_CLASS[entry.level]}`}>
              {entry.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

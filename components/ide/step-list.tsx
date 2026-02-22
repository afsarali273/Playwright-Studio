"use client";

import React from "react";
import {
  MousePointerClick,
  Type,
  Navigation,
  GripVertical,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface DemoStep {
  id: string;
  action: string;
  label: string;
  selector: string;
  value?: string;
  status: "idle" | "running" | "passed" | "failed";
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: "1",
    action: "navigate",
    label: "Navigate",
    selector: "https://example.com/login",
    status: "passed",
  },
  {
    id: "2",
    action: "click",
    label: "Click",
    selector: '[data-testid="login-button"]',
    status: "passed",
  },
  {
    id: "3",
    action: "input",
    label: "Type",
    selector: '[data-testid="username-input"]',
    value: "testuser",
    status: "passed",
  },
  {
    id: "4",
    action: "input",
    label: "Type",
    selector: '[data-testid="password-input"]',
    value: "password123",
    status: "running",
  },
  {
    id: "5",
    action: "click",
    label: "Click",
    selector: '[data-testid="submit-button"]',
    status: "idle",
  },
  {
    id: "6",
    action: "navigate",
    label: "Navigate",
    selector: "**/dashboard",
    status: "idle",
  },
];

function ActionIcon({ action }: { action: string }) {
  switch (action) {
    case "click":
      return <MousePointerClick size={13} />;
    case "input":
      return <Type size={13} />;
    case "navigate":
      return <Navigation size={13} />;
    default:
      return <MousePointerClick size={13} />;
  }
}

function StatusDot({ status }: { status: string }) {
  if (status === "passed")
    return <CheckCircle size={12} className="text-[#00d4aa]" />;
  if (status === "failed")
    return <XCircle size={12} className="text-[#ff5b5b]" />;
  if (status === "running")
    return <Loader2 size={12} className="text-[#4f8cff] animate-spin" />;
  return <div className="w-2 h-2 rounded-full bg-[#7a7a9a] opacity-40" />;
}

export function IDEStepList() {
  return (
    <div className="flex flex-col w-[260px] min-w-[220px] bg-[#16213e] border-r border-[#2a2a4a] overflow-hidden flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 h-9 px-3 border-b border-[#2a2a4a] flex-shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0a0c0]">
          Steps
        </h3>
        <span className="text-[11px] px-1.5 py-0 rounded-full bg-[#2a2a4a] text-[#7a7a9a] font-medium">
          {DEMO_STEPS.length}
        </span>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {DEMO_STEPS.map((step, idx) => (
          <div
            key={step.id}
            className={`flex items-center gap-1.5 px-2.5 py-2 border-b border-[#2a2a4a] cursor-pointer transition-colors group ${
              step.status === "running"
                ? "bg-[rgba(79,140,255,0.08)] border-l-[3px] border-l-[#4f8cff] pl-[7px]"
                : "hover:bg-[#1e2d50]"
            }`}
          >
            <span className="text-[#7a7a9a] opacity-40">
              <GripVertical size={11} />
            </span>
            <span className="text-[10px] text-[#7a7a9a] font-mono min-w-[16px] text-right">
              {idx + 1}
            </span>
            <StatusDot status={step.status} />
            <span className="text-[#a0a0c0]">
              <ActionIcon action={step.action} />
            </span>
            <div className="flex-1 min-w-0 flex flex-col gap-px">
              <span className="text-xs font-semibold text-[#e0e0e0]">
                {step.label}
              </span>
              <span className="text-[11px] text-[#7a7a9a] font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {step.selector}
              </span>
              {step.value && (
                <span className="text-[11px] text-[#00d4aa] font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                  {'"'}{step.value}{'"'}
                </span>
              )}
            </div>
            <button className="flex items-center justify-center w-[22px] h-[22px] rounded text-[#7a7a9a] opacity-0 group-hover:opacity-100 hover:bg-[#ff5b5b] hover:text-[#fff] transition-all">
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

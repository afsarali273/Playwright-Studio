"use client";

import React from "react";
import { IDEToolbar } from "@/components/ide/toolbar";
import { IDEStepList } from "@/components/ide/step-list";
import { IDEBrowserPanel } from "@/components/ide/browser-panel";
import { IDELogPanel } from "@/components/ide/log-panel";
import { IDEStatusBar } from "@/components/ide/status-bar";

export function IDEPreview() {
  return (
    <div className="rounded-xl border border-[#2a2a4a] overflow-hidden bg-[#1a1a2e] shadow-2xl shadow-black/40">
      <IDEToolbar />
      <div className="flex h-[420px]">
        <IDEStepList />
        <IDEBrowserPanel />
        <IDELogPanel />
      </div>
      <IDEStatusBar />
    </div>
  );
}

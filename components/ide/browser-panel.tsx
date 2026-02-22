"use client";

import React from "react";

export function IDEBrowserPanel() {
  return (
    <div className="flex flex-col flex-1 min-w-[200px] overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center gap-2 h-9 px-3 bg-[#16213e] border-b border-[#2a2a4a] flex-shrink-0">
        <span className="flex items-center px-2 py-0.5 rounded-full bg-[#ff5b5b] text-[#fff] text-[10px] font-bold tracking-widest animate-pulse">
          REC
        </span>
        <span className="text-xs text-[#a0a0c0] overflow-hidden text-ellipsis whitespace-nowrap">
          Example Login Page
        </span>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-[#0d0d1a] relative overflow-hidden">
        {/* Simulated browser content */}
        <div className="absolute inset-4 rounded-lg bg-[#f8f9fa] flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-full max-w-sm flex flex-col gap-3">
            {/* Logo area */}
            <div className="text-center mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#4f8cff] mx-auto mb-2" />
              <h2 className="text-lg font-semibold text-[#1a1a2e]">
                Sign In
              </h2>
              <p className="text-xs text-[#7a7a9a]">
                Enter your credentials to continue
              </p>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#1a1a2e]">
                Username
              </label>
              <div className="h-9 rounded-md border-2 border-[#4f8cff] bg-[#fff] px-2.5 flex items-center text-sm text-[#1a1a2e] font-mono ring-2 ring-[#4f8cff]/20">
                testuser
                <span className="ml-px w-0.5 h-4 bg-[#4f8cff] animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#1a1a2e]">
                Password
              </label>
              <div className="h-9 rounded-md border border-[#d0d5dd] bg-[#fff] px-2.5 flex items-center text-sm text-[#7a7a9a]">
                Password
              </div>
            </div>

            <button className="h-9 rounded-md bg-[#4f8cff] text-[#fff] text-sm font-medium hover:bg-[#3a7aee] transition-colors">
              Sign In
            </button>
          </div>

          {/* Selector highlight overlay */}
          <div className="absolute top-[102px] left-[calc(50%-160px)] w-[320px] h-[38px] border-2 border-dashed border-[#00d4aa] rounded-md pointer-events-none">
            <span className="absolute -top-5 left-1 text-[10px] font-mono text-[#00d4aa] bg-[#1a1a2e] px-1.5 py-0.5 rounded">
              {'[data-testid="username-input"]'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

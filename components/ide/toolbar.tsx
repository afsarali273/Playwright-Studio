"use client";

import React, { useState } from "react";
import {
  Circle,
  Square,
  Play,
  SkipForward,
  StepForward,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCw,
} from "lucide-react";

export function IDEToolbar() {
  const [isRecording, setIsRecording] = useState(false);
  const [url, setUrl] = useState("https://example.com/login");

  return (
    <div className="flex items-center h-12 px-3 gap-3 bg-[#16213e] border-b border-[#2a2a4a]">
      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded text-xs font-medium transition-all min-h-[32px] ${
            isRecording
              ? "bg-[#ff5b5b] border-[#ff5b5b] text-[#fff] animate-pulse"
              : "border-[#2a2a4a] text-[#e0e0e0] hover:bg-[#1e2d50]"
          }`}
          onClick={() => setIsRecording(!isRecording)}
        >
          <Circle
            size={14}
            fill={isRecording ? "currentColor" : "none"}
          />
          <span>{isRecording ? "Recording" : "Record"}</span>
        </button>

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#2a2a4a] rounded text-xs text-[#e0e0e0] hover:bg-[#1e2d50] transition-all min-h-[32px]">
          <Square size={14} />
          <span>Stop</span>
        </button>

        <div className="w-px h-5 bg-[#2a2a4a] mx-1.5" />

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4f8cff] border border-[#4f8cff] rounded text-xs text-[#fff] font-medium hover:bg-[#3a7aee] transition-all min-h-[32px]">
          <Play size={14} />
          <span>Run All</span>
        </button>

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#2a2a4a] rounded text-xs text-[#e0e0e0] hover:bg-[#1e2d50] transition-all min-h-[32px]">
          <SkipForward size={14} />
          <span>Run From</span>
        </button>

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#2a2a4a] rounded text-xs text-[#e0e0e0] hover:bg-[#1e2d50] transition-all min-h-[32px]">
          <StepForward size={14} />
          <span>Run Step</span>
        </button>

        <div className="w-px h-5 bg-[#2a2a4a] mx-1.5" />

        <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#2a2a4a] rounded text-xs text-[#e0e0e0] hover:bg-[#1e2d50] transition-all min-h-[32px]">
          <Download size={14} />
          <span>Export</span>
        </button>
      </div>

      {/* URL bar */}
      <div className="flex items-center flex-1 gap-1">
        <button className="flex items-center justify-center w-7 h-7 rounded text-[#7a7a9a] hover:bg-[#1e2d50] hover:text-[#e0e0e0] transition-all">
          <ArrowLeft size={14} />
        </button>
        <button className="flex items-center justify-center w-7 h-7 rounded text-[#7a7a9a] hover:bg-[#1e2d50] hover:text-[#e0e0e0] transition-all">
          <ArrowRight size={14} />
        </button>
        <button className="flex items-center justify-center w-7 h-7 rounded text-[#7a7a9a] hover:bg-[#1e2d50] hover:text-[#e0e0e0] transition-all">
          <RotateCw size={14} />
        </button>
        <input
          className="flex-1 h-[30px] px-2.5 border border-[#2a2a4a] rounded bg-[#1a1a2e] text-[#e0e0e0] text-xs font-mono outline-none focus:border-[#4f8cff] transition-colors placeholder:text-[#7a7a9a]"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-label="Browser URL"
        />
      </div>
    </div>
  );
}

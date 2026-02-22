"use client";

import React from "react";

export function IDEStatusBar() {
  return (
    <div className="flex items-center justify-between h-7 px-3 bg-[#16213e] border-t border-[#2a2a4a] text-[11px] select-none">
      <div className="flex items-center gap-3">
        <span className="text-[#4f8cff] font-semibold">
          Running: 3/6
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[#7a7a9a]">Steps: 6</span>
        <span className="text-[#00d4aa]">Passed: 3</span>
        <span className="text-[#7a7a9a]">Failed: 0</span>
      </div>
    </div>
  );
}

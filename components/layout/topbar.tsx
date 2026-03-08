"use client";
import { Bell, Circle } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, subtitle, children }: TopbarProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="text-base font-semibold text-gray-100">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Circle size={6} className="fill-green-400 text-green-400" />
          <span>Live</span>
        </div>
        <button className="text-gray-400 hover:text-gray-200 transition-colors relative">
          <Bell size={16} />
        </button>
      </div>
    </header>
  );
}

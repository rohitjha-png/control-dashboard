"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Phone,
  Key,
  BookOpen,
  ChevronRight,
  Server,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Calls",
    href: "/calls",
    icon: Phone,
  },
  {
    label: "Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    label: "Knowledge Base",
    href: "/knowledge",
    icon: BookOpen,
  },
  {
    label: "Agent Worker",
    href: "/worker",
    icon: Server,
  },
  {
    label: "Credentials",
    href: "/credentials",
    icon: Key,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 min-h-screen bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-100 leading-none">Agent Control</p>
          <p className="text-[10px] text-gray-500 mt-0.5">LiveKit Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600/20 text-blue-300 border border-blue-700/40"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              )}
            >
              <item.icon
                size={15}
                className={isActive ? "text-blue-400" : "text-gray-500 group-hover:text-gray-300"}
              />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight size={12} className="ml-auto text-blue-400/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600">91Wheels Voice Platform</p>
        <p className="text-[10px] text-gray-700 mt-0.5">v2.0.0</p>
      </div>
    </aside>
  );
}

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-gray-700 text-gray-200",
  success: "bg-green-900/50 text-green-300 border border-green-800",
  warning: "bg-yellow-900/50 text-yellow-300 border border-yellow-800",
  error: "bg-red-900/50 text-red-300 border border-red-800",
  info: "bg-blue-900/50 text-blue-300 border border-blue-800",
  outline: "bg-transparent text-gray-300 border border-gray-600",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

import { LucideIcon } from "lucide-react";

interface KPIProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "error" | "info";
  trend?: {
    value: number;
    label: string;
  };
}

const variantStyles = {
  default: {
    bg: "bg-gradient-to-br from-gray-50 to-gray-100",
    text: "text-[#111827]",
    icon: "bg-white shadow-sm"
  },
  success: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    text: "text-[#059669]",
    icon: "bg-white shadow-sm shadow-emerald-200"
  },
  warning: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    text: "text-[#D97706]",
    icon: "bg-white shadow-sm shadow-amber-200"
  },
  error: {
    bg: "bg-gradient-to-br from-rose-50 to-rose-100",
    text: "text-[#E11D48]",
    icon: "bg-white shadow-sm shadow-rose-200"
  },
  info: {
    bg: "bg-gradient-to-br from-sky-50 to-sky-100",
    text: "text-[#0284C7]",
    icon: "bg-white shadow-sm shadow-sky-200"
  },
};

export function KPI({ label, value, icon: Icon, variant = "default", trend }: KPIProps) {
  return (
    <div 
      className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-hover overflow-hidden relative animate-fade-in" 
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Gradiente de fondo sutil */}
      <div className="absolute inset-0 bg-linear-to-br from-white to-gray-50/30 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-[#6B7280] uppercase tracking-wider">{label}</p>
          {Icon && (
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${variantStyles[variant].icon} transition-transform hover:scale-110`}>
              <Icon className={`h-5 w-5 ${variantStyles[variant].text}`} />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className={`text-3xl font-semibold ${variantStyles[variant].text}`}>
            {value}
          </p>
          
          {trend && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${variantStyles[variant].bg} ${variantStyles[variant].text}`}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              <span className="text-xs text-[#9CA3AF]">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
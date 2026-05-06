import { LucideIcon } from "lucide-react";
import { cn } from "../Components/ui/utils";

interface PageTitleProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageTitle({ 
  icon: Icon, 
  title, 
  description, 
  color = "bg-[#1D4ED8]",
  className,
  children 
}: PageTitleProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", className)}>
      <div className="flex items-start gap-4">
        <div className={cn("w-1.5 rounded-full shrink-0 self-stretch min-h-12", color)} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={cn(
                "p-2 rounded-lg",
                color === "bg-[#1D4ED8]" && "bg-blue-100",
                color === "bg-[#7C3AED]" && "bg-purple-100",
                color === "bg-[#059669]" && "bg-green-100",
                color === "bg-[#D97706]" && "bg-amber-100",
                color === "bg-[#E11D48]" && "bg-red-100",
                color === "bg-[#0891B2]" && "bg-cyan-100",
                color === "bg-[#EA580C]" && "bg-orange-100",
                color === "bg-[#4F46E5]" && "bg-indigo-100"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  color === "bg-[#1D4ED8]" && "text-[#1D4ED8]",
                  color === "bg-[#7C3AED]" && "text-[#7C3AED]",
                  color === "bg-[#059669]" && "text-[#059669]",
                  color === "bg-[#D97706]" && "text-[#D97706]",
                  color === "bg-[#E11D48]" && "text-[#E11D48]",
                  color === "bg-[#0891B2]" && "text-[#0891B2]",
                  color === "bg-[#EA580C]" && "text-[#EA580C]",
                  color === "bg-[#4F46E5]" && "text-[#4F46E5]"
                )} />
              </div>
            )}
            <h1 className="text-[#111827]">{title}</h1>
          </div>
          {description && (
            <p className="text-sm text-[#6B7280] mt-2 ml-11">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="sm:ml-auto">
          {children}
        </div>
      )}
    </div>
  );
}

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      {Icon && (
        <div className="relative mb-6">
          {/* Anillo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl blur-xl opacity-50" />
          
          {/* Icono */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200/50 shadow-lg">
            <Icon className="h-10 w-10 text-[#9CA3AF]" />
          </div>
        </div>
      )}
      
      <h3 className="text-[#111827] mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-[#6B7280] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
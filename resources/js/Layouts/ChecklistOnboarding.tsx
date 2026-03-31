import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { CheckCircle2, Circle, X } from "lucide-react";
import { cn } from "../Components/ui/utils";

interface ChecklistItem {
  id: string;
  label: string;
  route?: string;
  roles: string[];
}

interface ChecklistOnboardingProps {
  userRole: string;
  onNavigate: (route: string) => void;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "agenda",
    label: "Consultar la agenda escolar",
    route: "#/agenda",
    roles: ["Tutor", "Profesor", "Trabajador Social", "Administrador", "Personal Administrativo"],
  },
  {
    id: "calificaciones",
    label: "Revisar calificaciones",
    route: "#/academico",
    roles: ["Tutor", "Profesor", "Trabajador Social", "Administrador"],
  },
  {
    id: "comunicacion",
    label: "Ver notificaciones",
    route: "#/comunicacion",
    roles: ["Tutor", "Profesor", "Trabajador Social", "Administrador"],
  },
];

export function ChecklistOnboarding({ userRole, onNavigate }: ChecklistOnboardingProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const filteredItems = checklistItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleItemClick = (item: ChecklistItem) => {
    setCompletedItems((prev) => new Set(prev).add(item.id));
    if (item.route) {
      onNavigate(item.route);
    }
  };

  if (isDismissed || completedItems.size === filteredItems.length) {
    return null;
  }

  return (
    <Card className="border-[#7C3AED] bg-linear-to-br from-purple-50 to-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-purple-200/30 to-transparent rounded-bl-full" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-[#7C3AED]">🎯</span>
              Primeros pasos
            </CardTitle>
            <p className="text-sm text-[#6B7280] mt-1">
              Completa estas acciones para familiarizarte con el sistema
            </p>
          </div>
          <Button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-purple-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const isCompleted = completedItems.has(item.id);
            return (
              <Button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                  isCompleted
                    ? "bg-green-50 border border-green-200"
                    : "bg-white border border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-[#7C3AED] shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCompleted ? "text-[#059669]" : "text-[#111827]"
                  )}
                >
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-[#6B7280]">
          <span>
            {completedItems.size} de {filteredItems.length} completadas
          </span>
          <div className="flex gap-1">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  completedItems.has(item.id) ? "bg-[#059669]" : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

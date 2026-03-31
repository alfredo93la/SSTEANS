import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Calendar } from "lucide-react";
import { Badge } from "../Components/ui/badge";
import { ChecklistOnboarding } from "../Layouts/ChecklistOnboarding";
import { DashboardTutor } from "./Dashboards/DashboardTutor";
import { DashboardProfesor } from "./Dashboards/DashboardProfesor";
import { DashboardTrabajadorSocial } from "./Dashboards/DashboardTrabajadorSocial";
import { DashboardAdmin } from "./Dashboards/DashboardAdmin";
import { DashboardPersonalAdministrativo } from "./Dashboards/DashboardPersonalAdministrativo";

interface DashboardProps {
  onNavigate: (route: string) => void;
  userRole: string;
  hijoSeleccionado?: number | null;
  onHijoChange?: (hijoId: number | null) => void;
}

const modulosCards = [
  {
    id: "agenda",
    title: "Agenda",
    description: "Gestiona eventos, exámenes y entregas",
    icon: Calendar,
    color: "bg-[#DBEAFE] text-[#1D4ED8]",
    route: "#/agenda",
    roles: ["Tutor", "Profesor", "Trabajador Social", "Administrador"]
  }
];

export function Dashboard({ onNavigate, userRole, hijoSeleccionado, onHijoChange }: DashboardProps) {
  // Si es Tutor, mostrar dashboard específico
  if (userRole === "Tutor") {
    return <DashboardTutor onNavigate={onNavigate} hijoSeleccionado={hijoSeleccionado} onHijoChange={onHijoChange} />;
  }

  // Si es Profesor, mostrar dashboard específico
  if (userRole === "Profesor") {
    return <DashboardProfesor onNavigate={onNavigate} />;
  }

  // Si es Trabajador Social, mostrar dashboard específico
  if (userRole === "Trabajador Social") {
    return <DashboardTrabajadorSocial onNavigate={onNavigate} />;
  }

  // Si es Administrador del sistema, mostrar dashboard de admin
  if (userRole === "Administrador") {
    return <DashboardAdmin onNavigate={onNavigate} />;
  }

  // Si es Personal Administrativo, mostrar dashboard de gestión escolar
  if (userRole === "Personal Administrativo") {
    return <DashboardPersonalAdministrativo onNavigate={onNavigate} />;
  }

  // Dashboard genérico para otros roles
  // Filtrar módulos según el rol
  const filteredModulos = modulosCards.filter(modulo => modulo.roles.includes(userRole));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Título */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50">
        <h1 className="bg-linear-to-r from-[#1D4ED8] to-[#7C3AED] bg-clip-text text-transparent">Inicio</h1>
        <p className="text-sm text-[#6B7280] mt-2">
          Bienvenido al Sistema de Seguimiento a la Trayectoria Escolar
        </p>
      </div>

      {/* Checklist de onboarding */}
      <ChecklistOnboarding userRole={userRole} onNavigate={onNavigate} />


      {/* Módulos */}
      <div>
        <h2 className="mb-4">Módulos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredModulos.map((modulo, index) => {
            const Icon = modulo.icon;
            return (
              <Card
                key={modulo.id}
                className="border-[#E5E7EB] cursor-pointer group relative overflow-hidden animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => onNavigate(modulo.route)}
              >
                {/* Gradiente de fondo al hover */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-300" />
                
                <CardHeader className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl ${modulo.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-base">{modulo.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {modulo.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-[#1D4ED8] hover:bg-[#DBEAFE] rounded-xl group-hover:shadow-sm"
                  >
                    Acceder →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
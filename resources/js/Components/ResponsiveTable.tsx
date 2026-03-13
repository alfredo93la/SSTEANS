import { ReactNode } from "react";
import { Card } from "./ui/card";
import { cn } from "./ui/utils";

interface Column {
  key: string;
  label: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  renderRow: (item: any, isMobile: boolean) => ReactNode;
  renderMobileCard?: (item: any) => ReactNode;
  emptyMessage?: string;
}

export function ResponsiveTable({
  columns,
  data,
  renderRow,
  renderMobileCard,
  emptyMessage = "No hay datos disponibles",
}: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-[#6B7280]">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de tabla - Desktop y Tablet */}
      <div className="hidden md:block rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider",
                      column.hideOnTablet && "hidden lg:table-cell"
                    )}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {data.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {renderRow(item, false)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de tarjetas - Móvil */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => (
          <Card
            key={item.id || index}
            className="p-4 border-[#E5E7EB] hover:shadow-md transition-shadow"
          >
            {renderMobileCard ? renderMobileCard(item) : renderRow(item, true)}
          </Card>
        ))}
      </div>
    </>
  );
}

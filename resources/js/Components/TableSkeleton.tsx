import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardHeader } from "./ui/card";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <Card className="border-[#E5E7EB] rounded-2xl">
      <CardHeader>
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 mt-2 rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex gap-4 pb-3 border-b border-[#E5E7EB]">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1 rounded-lg" />
            ))}
          </div>

          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-3">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-5 flex-1 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CardSkeleton() {
  return (
    <Card className="border-[#E5E7EB] rounded-2xl">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

export function KPISkeleton() {
  return (
    <Card className="border-[#E5E7EB] rounded-2xl">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-3 w-24 rounded-lg" />
          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg mb-2" />
        <Skeleton className="h-4 w-32 rounded-full" />
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  /** Optional % change vs previous period — positive = green, negative = red */
  change?: number;
  icon?: React.ElementType;
  loading?: boolean;
  className?: string;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  loading = false,
  className,
}: KpiCardProps) {
  if (loading) {
    return (
      <Card className={cn("border-slate-200 dark:border-slate-800", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const trendIcon =
    change === undefined ? null : change > 0 ? (
      <TrendingUp className="h-3.5 w-3.5" />
    ) : change < 0 ? (
      <TrendingDown className="h-3.5 w-3.5" />
    ) : (
      <Minus className="h-3.5 w-3.5" />
    );

  const trendColor =
    change === undefined
      ? ""
      : change > 0
      ? "text-emerald-600 dark:text-emerald-400"
      : change < 0
      ? "text-red-500 dark:text-red-400"
      : "text-slate-400";

  return (
    <Card className={cn("border-slate-200 dark:border-slate-800", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {change !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium", trendColor)}>
              {trendIcon}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

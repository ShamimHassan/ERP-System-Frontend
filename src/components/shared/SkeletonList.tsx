import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonListProps {
  rows?: number;
}

export default function SkeletonList({ rows = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

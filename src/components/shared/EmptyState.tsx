interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({ message = "No data found." }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

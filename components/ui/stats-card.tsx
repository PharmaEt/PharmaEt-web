interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-border p-4 sm:p-5">
      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-neutral-500">
        {title}
      </p>
      <p className="mt-2 text-2xl sm:text-4xl font-semibold tracking-tight leading-none">
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      )}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-14 text-center shadow-soft">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
        <Icon className="h-6 w-6 text-tuki-cream/40" />
      </span>
      <p className="font-display text-base font-bold text-card-foreground">
        {title}
      </p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}

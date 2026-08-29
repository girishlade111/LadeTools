import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-8 text-center rounded-lg border border-dashed border-border bg-card flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center text-muted-foreground border border-border shadow-xs">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-serif font-bold text-foreground tracking-tight">{title}</h4>
        <p className="text-xs font-sans text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="gap-1.5 shadow-xs"
          >
            {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

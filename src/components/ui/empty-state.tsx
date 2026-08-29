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
      className={`p-8 text-center rounded-2xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-200 ${className}`}
    >
      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border border-border/60 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="gap-1.5 text-xs shadow-xs"
          >
            {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
            <span>{actionLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

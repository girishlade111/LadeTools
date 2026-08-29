import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatRelativeTime } from "@/lib/date";
import { History, Trash2, Clock, Inbox, CornerDownLeft } from "lucide-react";

export interface HistoryDrawerItem {
  id: number;
  label: string;
  createdAt: Date | number;
  badge?: string;
  secondaryLabel?: string;
}

export interface HistoryDrawerProps {
  title?: string;
  description?: string;
  items: HistoryDrawerItem[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onClearAll: () => void;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function HistoryDrawer({
  title = "Tool History",
  description = "Click an item to restore it into the tool.",
  items = [],
  onSelect,
  onDelete,
  onClearAll,
  triggerLabel,
  triggerVariant = "outline",
  triggerSize = "sm",
}: HistoryDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleItemClick = (id: number) => {
    onSelect(id);
    setIsOpen(false);
  };

  const handleDeleteItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleConfirmClear = () => {
    onClearAll();
    setConfirmOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant={triggerVariant}
            size={triggerSize}
            className="gap-1.5 text-xs shadow-sm"
          >
            <History className="h-3.5 w-3.5 text-primary" />
            <span>{triggerLabel || `History (${items.length})`}</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-6">
          <SheetHeader className="pb-4 border-b border-border/60 text-left">
            <div className="flex items-center justify-between pr-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold tracking-tight">
                    {title}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    {description}
                  </SheetDescription>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-muted-foreground font-medium">
                  {items.length} {items.length === 1 ? "entry" : "entries"} stored locally
                </span>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear All</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove all saved history entries for this tool from your browser's IndexedDB. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmClear}>
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </SheetHeader>

          {/* History Item List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
            {items.length === 0 ? (
              <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2 border border-dashed rounded-xl my-4">
                <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="font-semibold text-xs text-foreground">No history yet</div>
                <p className="text-[11px] max-w-[200px] leading-relaxed">
                  Run or evaluate inputs in this tool to save entries locally in IndexedDB.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="group relative cursor-pointer p-3 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 transition-all duration-150 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono uppercase font-semibold shrink-0">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs font-mono font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      title="Delete record"
                      aria-label="Delete history entry"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {item.secondaryLabel && (
                    <div className="text-[11px] font-mono text-muted-foreground line-clamp-2 bg-muted/30 p-1.5 rounded border border-border/40">
                      {item.secondaryLabel}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                    <div className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      <span>Restore</span>
                      <CornerDownLeft className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

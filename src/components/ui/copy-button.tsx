import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  label?: string;
  successMessage?: string;
  showIconOnly?: boolean;
}

export function CopyButton({
  text,
  label = "Copy",
  successMessage = "Copied to clipboard!",
  showIconOnly = false,
  variant = "outline",
  size = "sm",
  className,
  disabled,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isTextEmpty = !text || text.trim().length === 0;
  const isDisabled = disabled || isTextEmpty;

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isTextEmpty) return;

    try {
      await copyToClipboard(text);
      setCopied(true);

      toast({
        title: successMessage,
        description: text.length > 60 ? `${text.slice(0, 57)}...` : text,
        variant: "default",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      console.error("[CopyButton] Copy failed:", err);
      toast({
        title: "Failed to copy",
        description: (err as Error)?.message || "Clipboard write permission denied",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={isDisabled}
      className={cn(
        "gap-1.5 transition-all select-none",
        copied && "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
        className
      )}
      title={isTextEmpty ? "Nothing to copy" : "Copy to clipboard"}
      aria-label={label}
      {...props}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 transition-transform scale-110" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      {!showIconOnly && <span>{copied ? "Copied" : label}</span>}
    </Button>
  );
}

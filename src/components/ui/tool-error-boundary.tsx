import React, { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolErrorBoundaryProps {
  toolName?: string;
  children: ReactNode;
  onReset?: () => void;
}

interface ToolErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ToolErrorBoundary extends Component<ToolErrorBoundaryProps, ToolErrorBoundaryState> {
  constructor(props: ToolErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ToolErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("ToolErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const toolLabel = this.props.toolName || "This tool";

      return (
        <div className="p-6 sm:p-10 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-6 my-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive border border-destructive/20 shadow-sm">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {toolLabel} Encountered an Unexpected Error
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Don't worry — your other tools and local database remain completely safe. You can reset this tool or return to the overview.
            </p>
          </div>

          {this.state.error && (
            <div className="max-w-lg mx-auto p-3.5 rounded-xl bg-muted/60 border border-border text-left font-mono text-[11px] text-destructive overflow-x-auto max-h-32">
              <span className="font-semibold block mb-1">Error:</span>
              {this.state.error.message || "An unknown rendering error occurred."}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={this.handleReset}
              className="gap-2 text-xs shadow-sm"
              variant="default"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset & Reload Tool</span>
            </Button>

            <Button
              onClick={() => {
                window.location.hash = "";
                window.location.reload();
              }}
              variant="outline"
              className="gap-2 text-xs"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Go to Overview</span>
            </Button>
          </div>

          <div className="pt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>LadeTools client-side isolation active</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

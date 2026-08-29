import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { Toaster } from "@/components/ui/toaster";
import { TOOLS_REGISTRY, type ToolId } from "@/components/tools";

import { SupportFooter } from "@/components/support-footer";
import { HomePage } from "@/components/pages/home-page";
import { ToolErrorBoundary } from "@/components/ui/tool-error-boundary";

interface AppLayoutProps {
  activeToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
  dbStatus?: string;
}

export function AppLayout({ activeToolId, onSelectTool, dbStatus }: AppLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeTool = TOOLS_REGISTRY.find((t) => t.id === activeToolId);
  const isHome = activeToolId === "home";
  const ActiveComponent = activeTool?.component || null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-row">
      {/* Desktop Sidebar */}
      <Sidebar
        activeToolId={activeToolId}
        onSelectTool={onSelectTool}
        dbStatus={dbStatus}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeToolId={activeToolId}
        onSelectTool={onSelectTool}
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeToolId={activeToolId}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onNavigateHome={() => onSelectTool("home")}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto animate-in fade-in duration-200 flex flex-col justify-between">
          {isHome ? (
            <HomePage onSelectTool={onSelectTool} />
          ) : (
            ActiveComponent && (
              <ToolErrorBoundary
                key={activeToolId}
                toolName={activeTool?.name}
                onReset={() => onSelectTool(activeToolId)}
              >
                <ActiveComponent />
              </ToolErrorBoundary>
            )
          )}
          <SupportFooter />
        </main>
      </div>

      {/* PWA Install Banner */}
      <PwaInstallPrompt />

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

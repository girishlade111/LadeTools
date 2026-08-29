import { useState, useEffect } from "react";
import { db } from "@/db";
import { AppLayout } from "@/components/layout/app-layout";
import { type ToolId, TOOLS_REGISTRY } from "@/components/tools";

export function App() {
  const [dbStatus, setDbStatus] = useState<string>("Connecting...");
  const [activeToolId, setActiveToolId] = useState<ToolId>(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "") as ToolId;
      if (TOOLS_REGISTRY.some((t) => t.id === hash)) {
        return hash;
      }
    }
    return "json-formatter";
  });

  useEffect(() => {
    // Open & test Dexie database connection
    db.open()
      .then(() => setDbStatus("IndexedDB Ready (Persistent)"))
      .catch((err) => setDbStatus(`DB Error: ${err.message}`));

    // Listen for hash changes for back/forward browser navigation
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as ToolId;
      if (TOOLS_REGISTRY.some((t) => t.id === hash)) {
        setActiveToolId(hash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleSelectTool = (id: ToolId) => {
    setActiveToolId(id);
    window.location.hash = id;
  };

  return (
    <AppLayout
      activeToolId={activeToolId}
      onSelectTool={handleSelectTool}
      dbStatus={dbStatus}
    />
  );
}

export default App;

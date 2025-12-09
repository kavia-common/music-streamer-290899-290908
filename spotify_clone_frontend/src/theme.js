//
// Ocean Professional Theme configuration and helpers
//

// PUBLIC_INTERFACE
export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#2563EB", // blue-600
    secondary: "#F59E0B", // amber-500
    success: "#F59E0B",
    error: "#EF4444",
    gradientFrom: "rgba(59,130,246,0.1)", // blue-500/10
    gradientTo: "#f9fafb",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
    textMuted: "rgba(17,24,39,0.7)",
    border: "rgba(17,24,39,0.08)",
    sidebarBg: "#0B1220",
    sidebarText: "#E5E7EB",
    sidebarTextMuted: "rgba(229,231,235,0.6)",
    playerBg: "#0F172A",
    playerText: "#E5E7EB"
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 10px rgba(0,0,0,0.08)",
    lg: "0 10px 30px rgba(0,0,0,0.12)",
  },
};

// PUBLIC_INTERFACE
export const getEnv = () => {
  /**
   * Returns environment variables used to wire future API integration.
   * These are placeholders and not required for this scaffold to run.
   * REACT_APP_* variables must be provided by deployment if needed.
   */
  return {
    apiBase: process.env.REACT_APP_API_BASE || "",
    backendUrl: process.env.REACT_APP_BACKEND_URL || "",
    frontendUrl: process.env.REACT_APP_FRONTEND_URL || "",
    wsUrl: process.env.REACT_APP_WS_URL || "",
    nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development",
    features: process.env.REACT_APP_FEATURE_FLAGS || "",
    experiments: process.env.REACT_APP_EXPERIMENTS_ENABLED || "false",
  };
};

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthContext";
import { queryClient } from "./config/queryClient";
import App from "./App.jsx";

// Core Styles (Order matters!)
import "./styles/tailwind.css";      // Tailwind base
import "./styles/tokens.css";        // Design tokens (imported first)
import "./styles/unified-layout.css"; // Unified layout system (NEW - uses tokens)
import "./styles/global.css";        // Global styles
import "./styles/layout.css";        // Legacy layout (MainLayout only)
import "./styles/components.css";    // Component library (CONSOLIDATED)
import "./styles/utilities.css";     // Custom utilities

// Page-Specific Styles
import "./styles/login.css";
import "./styles/register.css";
import "./styles/maintenance.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);

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
import "./styles/tokens.css";        // Design tokens
import "./styles/global.css";        // Global styles
import "./styles/layout.css";        // Layout structures
import "./styles/components.css";    // Component library
import "./styles/utilities.css";     // Custom utilities

// Page-Specific Styles
import "./styles/login.css";
import "./styles/register.css";
import "./styles/maintenance.css";

// Dashboard Styles (keep for now, consolidate later)
import "./styles/dashboard.css";
import "./styles/manager-dashboard.css";

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

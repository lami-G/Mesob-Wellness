import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
// Design Tokens (CSS Variables)
import "./styles/tokens/colors.css";
import "./styles/tokens/spacing.css";
import "./styles/tokens/typography.css";
import "./styles/tokens/effects.css";

// Base Styles
import "./styles/base/reset.css";
import "./styles/base/utilities.css";

// Global Styles (keeping tailwind for now during migration)
import "./styles/tailwind.css";
import "./styles/global.css";

// OLD STYLES - Will be removed after migration
import "./styles/manager-dashboard.css";
import "./styles/nurse-dashboard.css";
import "./styles/nurse-analytics.css";
import "./styles/walkin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
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
  </React.StrictMode>,
);

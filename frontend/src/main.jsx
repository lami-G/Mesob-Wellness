import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App.jsx";
import "./styles/tailwind.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/admin-layout.css";
import "./styles/modals.css";
import "./styles/login.css";
import "./styles/register.css";
import "./styles/dashboard.css";
import "./styles/admin-dashboard.css";
import "./styles/manager-dashboard.css";
import "./styles/nurse-dashboard.css";

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

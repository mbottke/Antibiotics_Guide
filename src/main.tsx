import React from "react";
import { createRoot } from "react-dom/client";

// Generated design tokens (single source of truth: tokens/tokens.json).
// Imported before the app so the :root custom properties are defined globally.
import "./styles/tokens.css";

import App from "./App.jsx";

const el = document.getElementById("root");
if (!el) throw new Error("#root not found");

createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

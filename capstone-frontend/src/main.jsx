import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";
import "./styles.css";

import { AuthProvider } from "./auth/AuthContext.jsx";
import { ApiProvider } from "./api/ApiContext.jsx";
import { ToastProvider } from "./UI/ToastContext.jsx";

// Simple debug badge so we KNOW React mounted
function DebugBadge() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "#00000088",
        color: "white",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        zIndex: 9999,
      }}
    >
      React mounted
    </div>
  );
}

// Minimal error boundary (avoids silent blanks)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("Caught by ErrorBoundary:", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ color: "white", padding: 16 }}>
          <h1>Something went wrong.</h1>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.err?.stack || this.state.err)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ApiProvider>
            <ToastProvider>
              <App />
              <DebugBadge />
            </ToastProvider>
          </ApiProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

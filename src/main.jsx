import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { ApiProvider } from "./api/ApiContext.jsx";
import { ToastProvider } from "./UI/ToastContext.jsx";
import ErrorBoundary from "./UI/ErrorBoundary.jsx";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ApiProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ApiProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// *********** testing bad routes
// import React from "react";
// import ReactDOM from "react-dom/client";

// // TEMP: do not import index.css yet; comment it out to avoid a CSS "invisible" page
// // import "./index.css";

// const rootElIdCandidates = ["root", "app"];
// let rootEl = null;
// for (const id of rootElIdCandidates) {
//   const el = document.getElementById(id);
//   if (el) {
//     rootEl = el;
//     break;
//   }
// }
// if (!rootEl) {
//   // create one if missing
//   rootEl = document.createElement("div");
//   rootEl.id = "root";
//   document.body.appendChild(rootEl);
// }
// console.log("[main] mounting to", rootEl.id);

// ReactDOM.createRoot(rootEl).render(
//   <div style={{ padding: 16, fontFamily: "sans-serif" }}>
//     <h1>React root alive ✅</h1>
//     <p>If you can see this, React mounted successfully.</p>
//   </div>
// );

// src/main.jsx
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// const rootEl = document.getElementById("root");
// ReactDOM.createRoot(rootEl).render(
//   <BrowserRouter>
//     <Routes>
//       <Route
//         path="*"
//         element={<div style={{ padding: 16 }}>Router alive ✅</div>}
//       />
//     </Routes>
//   </BrowserRouter>
// );

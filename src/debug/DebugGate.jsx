import { useEffect } from "react";

export default function DebugGate({ label = "App mounted" }) {
  useEffect(() => {
    console.log(`[DebugGate] ${label}`);
  }, [label]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        padding: "6px 10px",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
        fontSize: 12,
        zIndex: 9999,
      }}
    >
      {label}
    </div>
  );
}

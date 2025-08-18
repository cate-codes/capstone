import { useContext } from "react";
import { ApiContext } from "./ApiContext";

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within an ApiProvider");
  return ctx;
}

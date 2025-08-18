import { useState } from "react";
import { useApi } from "../api/useApi";
import { useToast } from "../UI/ToastContext";

export function useCreateEntry() {
  const { request, invalidateTags } = useApi();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState(null);

  const create = async (payload) => {
    try {
      setLoading(true);
      await request("/entries", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      invalidateTags(["entries"]);
      setErr(null);
      push("Entry Created");
    } catch (e) {
      const msg = e?.message || "Failed to create entry.";
      setErr(msg);
      push(msg, "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

export function useUpdateEntry(id) {
  const { request, invalidateTags } = useApi();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState(null);

  const update = async (payload) => {
    try {
      setLoading(true);
      await request(`/entries/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      invalidateTags(["entries", `entry:${id}`]);
      setErr(null);
      push("Entry Updated");
    } catch (e) {
      const msg = e?.message || "Failed to update entry";
      setErr(msg);
      push(msg, "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useDeleteEntry(id) {
  const { request, invalidateTags } = useApi();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState(null);

  const remove = async () => {
    try {
      setLoading(true);
      await request(`/entries/${id}`, { method: "DELETE" });
      invalidateTags(["entries"]);
      setErr(null);
      push("Entrty deleted");
    } catch (e) {
      const msg = e?.message || "Failed to delete entry";
      setErr(msg);
      push(msg, "error");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
}

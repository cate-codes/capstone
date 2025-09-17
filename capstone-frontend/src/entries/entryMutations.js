// src/entries/entryMutations.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../api/useApi";

export function useCreateEntry() {
  const { request, invalidate } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  const create = useCallback(
    async (payload) => {
      setLoading(true);
      setErr("");
      try {
        // POST /api/entries (Authorization header added by useApi)
        const created = await request("/entries", {
          method: "POST",
          body: payload,
        });

        // refresh anything that reads the list
        invalidate(["entries"]);

        // navigate with Router v6 (no history.push)
        navigate("/entries", { replace: false });

        return created;
      } catch (e) {
        setErr(e?.message || "Failed to create entry");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [request, invalidate, navigate]
  );

  return { create, loading, error };
}

export function useUpdateEntry(id) {
  const { request, invalidate } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  const update = useCallback(
    async (patch) => {
      setLoading(true);
      setErr("");
      try {
        const res = await request(`/entries/${id}`, {
          method: "PUT",
          body: patch,
        });
        invalidate(["entries", `entry:${id}`]);
        navigate(`/entries/${id}`, { replace: true });
        return res;
      } catch (e) {
        setErr(e?.message || "Failed to update entry");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [id, request, invalidate, navigate]
  );

  return { update, loading, error };
}

export function useDeleteEntry(id) {
  const { request, invalidate } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");

  const remove = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      await request(`/entries/${id}`, { method: "DELETE" });
      invalidate(["entries"]);
      navigate("/entries", { replace: true });
    } catch (e) {
      setErr(e?.message || "Failed to delete entry");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [id, request, invalidate, navigate]);

  return { remove, loading, error };
}

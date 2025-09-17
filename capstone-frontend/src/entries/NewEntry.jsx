import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EntryForm from "./EntryForm";
import { useMoods } from "./hooks";
import { useCreateEntry } from "./entryMutations";
import ConfettiBurst from "../UI/ConfettiBurst";

export default function NewEntry() {
  const navigate = useNavigate();
  const { moods, loading } = useMoods();
  const { create, loading: saving, error } = useCreateEntry();
  const [boom, setBoom] = useState(false);

  const CONFETTI_MS = 1000; // keep in sync with ConfettiBurst duration

  if (loading) return <p>Loading…</p>;
  if (!moods?.length) {
    return <p>Couldn’t load moods. Try logging in again or refreshing.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {boom && (
        <ConfettiBurst duration={CONFETTI_MS} onDone={() => setBoom(false)} />
      )}

      <h1 className="text-2xl font-semibold mb-4">New Entry</h1>

      {error && (
        <p role="alert" className="text-red-600 mb-3">
          {String(error)}
        </p>
      )}

      <EntryForm
        moods={moods}
        submitLabel={saving ? "Saving…" : "Create Entry"}
        onSubmit={async (payload) => {
          try {
            if (saving) return; // guard: no double submit
            await create(payload); // POST /api/entries (auth handled in useApi)
            setBoom(true); // fire confetti
            setTimeout(() => navigate("/entries"), CONFETTI_MS);
          } catch {
            // error already set by hook; no-op
          }
        }}
      />
    </div>
  );
}

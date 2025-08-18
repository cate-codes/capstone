import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EntryForm from "./EntryForm";
import { useMoods } from "./hooks";
import { useCreateEntry } from "./entryMutations";
import ConfettiBurst from "../UI/ConfettiBurst";

export default function NewEntry() {
  const nav = useNavigate();
  const { moods, loading } = useMoods();
  const { create, loading: saving, error } = useCreateEntry();
  const [boom, setBoom] = useState(false);

  if (loading) return <p>Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {boom && <ConfettiBurst onDone={() => setBoom(false)} />}
      <h1 className="text-2xl font-semibold mb-4">New Entry</h1>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <EntryForm
        moods={moods}
        onSubmit={async (payload) => {
          await create(payload);
          setBoom(true);
          setTimeout(() => nav("/entries"), 900);
        }}
        submitLabel={saving ? "Saving…" : "Create Entry"}
      />
    </div>
  );
}

import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEntry, useMoods } from "./hooks";
import { useDeleteEntry, useUpdateEntry } from "./entryMutations";
import EntryForm from "./EntryForm";
import Skeleton from "../ui/Skeleton";

export default function EntryDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const { entry, loading, error } = useEntry(id);
  const { moods, loading: loadingMoods } = useMoods();
  const { update, loading: saving, error: updateError } = useUpdateEntry(id);
  const { remove, loading: deleting, error: deleteError } = useDeleteEntry(id);

  if (loading || loadingMoods) {
    return (
      <section className="stack">
        <div className="page-header">
          <h1 className="page-title">Edit Entry</h1>
          <Link to="/entries" className="btn">
            Back to Entries
          </Link>
        </div>
        <div className="card">
          <Skeleton width={220} height={28} />
          <div style={{ height: 12 }} />
          <Skeleton height={120} />
          <div style={{ height: 12 }} />
          <Skeleton width={160} height={36} />
        </div>
      </section>
    );
  }

  if (error)
    return (
      <p role="alert" className="alert">
        {String(error)}
      </p>
    );
  if (!entry) {
    return (
      <section className="stack">
        <div className="page-header">
          <h1 className="page-title">Edit Entry</h1>
          <Link to="/entries" className="btn">
            Back to Entries
          </Link>
        </div>
        <div className="card">
          <p className="muted">Not found.</p>
        </div>
      </section>
    );
  }

  const errMsg = updateError || deleteError;

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Edit Entry</h1>
        <div className="nav-actions">
          <button className="btn" onClick={() => nav("/entries")}>
            Back
          </button>
          <button
            className="btn"
            disabled={deleting}
            onClick={async () => {
              const ok = window.confirm("Delete this entry?");
              if (!ok) return;
              await remove();
              nav("/entries");
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      {errMsg && (
        <div role="alert" className="alert">
          {String(errMsg)}
        </div>
      )}

      <div className="card">
        <EntryForm
          moods={moods}
          initial={entry}
          submitLabel={saving ? "Saving…" : "Save changes"}
          onSubmit={async (payload) => {
            await update(payload);
            // stay on page after save; or navigate if you prefer:
            // nav("/entries");
          }}
        />
      </div>
    </section>
  );
}

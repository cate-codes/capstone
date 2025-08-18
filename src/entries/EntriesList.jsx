import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../ui/Skeleton";
import { useApi } from "../api/useApi";

const dateFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const formatDate = (s) => {
  try {
    return dateFmt.format(new Date(s));
  } catch {
    return s;
  }
};

export default function EntriesList() {
  const { request } = useApi();
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await request("/entries");
        setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e.message || "Failed to load entries");
      } finally {
        setLoading(false);
      }
    })();
  }, [request]);

  if (loading) {
    return (
      <section className="stack">
        <div className="page-header">
          <h1 className="page-title">Entries</h1>
          <Link to="/entries/new" className="btn btn-primary">
            New Entry
          </Link>
        </div>
        <div className="entry-grid">
          <Skeleton height={84} />
          <Skeleton height={84} />
          <Skeleton height={84} />
        </div>
      </section>
    );
  }

  if (err)
    return (
      <p role="alert" className="alert">
        {err}
      </p>
    );

  return (
    <section className="stack">
      <div className="page-header">
        <h1 className="page-title">Entries</h1>
        <Link to="/entries/new" className="btn btn-primary">
          New Entry
        </Link>
      </div>

      {entries?.length ? (
        <div className="entry-grid">
          {entries.map((e) => (
            <Link key={e.id} to={`/entries/${e.id}`} className="entry-card">
              <div className="entry-emoji">{e.mood_emoji || "📝"}</div>
              <div>
                <div className="entry-title">{formatDate(e.date)}</div>
                <div className="entry-sub">
                  {e.mood_name || "Untitled mood"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card">
          <p className="muted">No entries yet.</p>
          <Link
            to="/entries/new"
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            Create your first entry
          </Link>
        </div>
      )}
    </section>
  );
}

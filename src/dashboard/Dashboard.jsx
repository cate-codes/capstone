import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../api/useApi";
import Skeleton from "../ui/Skeleton";

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

function calcStreak(entries) {
  if (!entries?.length) return 0;
  // unique days, newest first
  const days = Array.from(new Set(entries.map((e) => startOfDay(e.date)))).sort(
    (a, b) => b - a
  );

  let streak = 0;
  let cursor = startOfDay(new Date());
  for (const ts of days) {
    if (ts === cursor) {
      streak++;
      cursor -= DAY;
    } else if (ts < cursor) break;
  }
  return streak;
}

export default function Dashboard() {
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
        <h1 className="page-title">MoodTune</h1>
        <div className="grid-2">
          <div className="card">
            <Skeleton width={180} height={22} />
            <div style={{ height: 8 }} />
            <Skeleton width={90} height={18} />
            <div style={{ height: 12 }} />
            <Skeleton width={160} height={36} />
          </div>
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

  const streak = calcStreak(entries);
  const last = entries?.[0];

  return (
    <section className="stack">
      <h1 className="page-title">MoodTune</h1>

      <div className="grid-2">
        <div className="card">
          <h2 className="card-title">Current streak</h2>
          <p className="muted">
            {streak} {streak === 1 ? "day" : "days"}
          </p>
          <div style={{ height: 12 }} />
          <Link to="/entries/new" className="btn btn-primary">
            Create today’s entry
          </Link>
        </div>

        <div className="card">
          <h2 className="card-title">Most recent entry</h2>
          {last ? (
            <>
              <div style={{ fontSize: 28 }}>{last.mood_emoji || "📝"}</div>
              <p className="muted" style={{ marginTop: 6 }}>
                {last.mood_name || "—"}
              </p>
              <div style={{ height: 8 }} />
              <Link to={`/entries/${last.id}`} className="btn">
                Open
              </Link>
            </>
          ) : (
            <p className="muted">You don’t have any entries yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

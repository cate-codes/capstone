// src/home/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { token } = useAuth();

  return (
    <section className="home">
      {/* Hero */}
      <div className="hero scalloped-4">
        <div className="hero-body container">
          <h1 className="hero-title">Welcome to MoodTune</h1>
          <p className="hero-sub">
            Track your mood, jot a quick thought, and tag a song that matches
            your vibe. Build awareness and celebrate your streaks—all in a cozy,
            music-infused journal.
          </p>

          <div className="hero-actions">
            {token ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn">
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature bullets */}
      <div className="container stack" style={{ marginTop: 16 }}>
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">Daily mood check-ins</h2>
            <p className="muted">
              Pick a mood, add a note, and see your streak grow.
            </p>
          </div>
          <div className="card">
            <h2 className="card-title">Song-powered entries</h2>
            <p className="muted">
              Search iTunes right in the form and attach a 30-sec preview.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

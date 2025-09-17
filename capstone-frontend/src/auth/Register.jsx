import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register, loading, error } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  async function onSubmit(e) {
    e.preventDefault();
    await register(form);
    nav("/");
  }

  return (
    <div className="card">
      <h1>Create an account</h1>

      {error && (
        <p role="alert" className="error">
          {String(error)}
        </p>
      )}

      <form className="stack" onSubmit={onSubmit}>
        <label>
          <span>Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
        </label>

        <label>
          <span>Username</span>
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            autoComplete="username"
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password"
          />
        </label>

        <button className="btn" disabled={loading}>
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>
    </div>
  );
}

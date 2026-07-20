import { useState } from "react";
import { FaArrowRight, FaLock } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-mark"><FaLock /></div>
        <span>Private control panel</span>
        <h1>Portfolio Admin</h1>
        <p>Edit every portfolio section, review analytics, and manage AI activity.</p>
        <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
        <label>Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
        {error && <div className="admin-error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"} <FaArrowRight /></button>
      </form>
    </div>
  );
}

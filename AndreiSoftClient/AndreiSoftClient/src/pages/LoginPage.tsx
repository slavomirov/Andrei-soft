import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiLogin } from "../services/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiLogin(username, password);
      login(data);
      if (data.role === "Administrator") navigate("/admin");
      else navigate("/mechanic");
    } catch {
      setError("Невалидно потребителско име или парола");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card login-card">
        <div className="card-header">
          <h1>AndreiSoft</h1>
          <p className="subtitle">Управление на сервиз за глави</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Потребителско име</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Въведете потребителско име"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Парола</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Въведете парола"
            />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Влизане..." : "Вход"}
          </button>
        </form>
      </div>
    </div>
  );
}

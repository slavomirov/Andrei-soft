import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiChangePassword } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirmNewPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      await apiChangePassword(form.currentPassword, form.newPassword, form.confirmNewPassword);
      setSuccess(true);
      setTimeout(() => navigate(isAdmin ? "/admin" : "/mechanic"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div>
      <div className="page-header"><h2>Change Password</h2></div>
      <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: 400 }}>
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" value={form.confirmNewPassword} onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })} required />
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Password changed! Redirecting...</div>}
        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary">Change Password</button>
        </div>
      </form>
    </div>
  );
}

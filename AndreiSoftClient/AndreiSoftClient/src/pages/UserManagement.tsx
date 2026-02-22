import { useEffect, useState, type FormEvent } from "react";
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeactivateUser } from "../services/api";
import type { UserInfo } from "../types/Head";

export default function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [createForm, setCreateForm] = useState({
    username: "", password: "", confirmPassword: "",
    firstName: "", lastName: "", role: "Mechanic",
  });

  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", role: "", isActive: true,
  });

  const loadUsers = async () => {
    try {
      const data = await apiGetUsers();
      setUsers(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const user = await apiCreateUser(createForm);
      setUsers((prev) => [...prev, user]);
      setShowCreate(false);
      setCreateForm({ username: "", password: "", confirmPassword: "", firstName: "", lastName: "", role: "Mechanic" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const startEdit = (u: UserInfo) => {
    setEditingId(u.id);
    setEditForm({ firstName: u.firstName, lastName: u.lastName, role: u.role, isActive: u.isActive });
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const updated = await apiUpdateUser(editingId, editForm);
      setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      setEditingId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this user?")) return;
    await apiDeactivateUser(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)));
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>User Management</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "+ New User"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="form-card" style={{ marginBottom: "1.5rem" }}>
          <h3>Create User</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" value={createForm.confirmPassword} onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                <option value="Administrator">Administrator</option>
                <option value="Mechanic">Mechanic</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create</button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={!u.isActive ? "row-inactive" : ""}>
                {editingId === u.id ? (
                  <>
                    <td>{u.userName}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} style={{ width: 100 }} />
                        <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} style={{ width: 100 }} />
                      </div>
                    </td>
                    <td>
                      <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                        <option value="Administrator">Administrator</option>
                        <option value="Mechanic">Mechanic</option>
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                    </td>
                    <td className="actions-cell">
                      <form onSubmit={handleUpdate} style={{ display: "inline" }}>
                        <button type="submit" className="btn btn-sm btn-primary">Save</button>
                      </form>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{u.userName}</td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td>{u.isActive ? "✅" : "❌"}</td>
                    <td className="actions-cell">
                      <button className="btn btn-sm btn-outline" onClick={() => startEdit(u)}>Edit</button>
                      {u.isActive && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeactivateUser } from "../services/api";
import type { UserInfo } from "../types/Head";
import { ConfirmModal } from "../components/Modal";

export default function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);

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

  const handleDeactivate = (id: string) => {
    setDeactivateId(id);
  };

  const confirmDeactivate = async () => {
    if (deactivateId === null) return;
    await apiDeactivateUser(deactivateId);
    setUsers((prev) => prev.map((u) => (u.id === deactivateId ? { ...u, isActive: false } : u)));
    setDeactivateId(null);
  };

  if (loading) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Управление на потребители</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Отказ" : "+ Нов потребител"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="form-card" style={{ marginBottom: "1.5rem" }}>
          <h3>Създаване на потребител</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Потребителско име</label>
              <input value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Име</label>
              <input value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Парола</label>
              <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Потвърди парола</label>
              <input type="password" value={createForm.confirmPassword} onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Роля</label>
              <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                <option value="Administrator">Администратор</option>
                <option value="Mechanic">Механик</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Създай</button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Потр. име</th>
              <th>Име</th>
              <th>Роля</th>
              <th>Активен</th>
              <th>Действия</th>
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
                        <option value="Administrator">Администратор</option>
                        <option value="Mechanic">Механик</option>
                      </select>
                    </td>
                    <td>
                      <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} />
                    </td>
                    <td className="actions-cell">
                      <form onSubmit={handleUpdate} style={{ display: "inline" }}>
                        <button type="submit" className="btn btn-sm btn-primary">Запази</button>
                      </form>
                      <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}>Отказ</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{u.userName}</td>
                    <td>{u.firstName} {u.lastName}</td>
                    <td><span className="badge">{u.role}</span></td>
                    <td>{u.isActive ? "✅" : "❌"}</td>
                    <td className="actions-cell">
                      <button className="btn btn-sm btn-outline" onClick={() => startEdit(u)}>Ред.</button>
                      {u.isActive && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(u.id)}>Деактивирай</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deactivateId !== null}
        title="Деактивиране"
        message="Деактивирай този потребител?"
        variant="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  );
}

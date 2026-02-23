import { useEffect, useState, type FormEvent } from "react";
import {
  apiGetAllServiceNeeds,
  apiCreateServiceNeed,
  apiUpdateServiceNeed,
  apiDeleteServiceNeed,
} from "../services/api";
import type { ServiceNeedInfo } from "../types/Head";
import { AlertModal } from "../components/Modal";

export default function ServiceNeedsManagement() {
  const [needs, setNeeds] = useState<ServiceNeedInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", price: 0 });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const loadNeeds = async () => {
    try {
      const data = await apiGetAllServiceNeeds();
      setNeeds(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNeeds();
  }, []);

  const resetForm = () => {
    setForm({ name: "", price: 0 });
    setEditingId(null);
    setError("");
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Името е задължително");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const created = await apiCreateServiceNeed({ name: form.name.trim(), price: form.price });
      setNeeds((prev) => [...prev, { ...created, isActive: true }]);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Грешка при създаване");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (need: ServiceNeedInfo) => {
    setEditingId(need.id);
    setForm({ name: need.name, price: need.price });
    setError("");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    if (!form.name.trim()) {
      setError("Името е задължително");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const existing = needs.find((n) => n.id === editingId);
      const updated = await apiUpdateServiceNeed(editingId, {
        name: form.name.trim(),
        price: form.price,
        isActive: existing?.isActive ?? true,
      });
      setNeeds((prev) => prev.map((n) => (n.id === editingId ? updated : n)));
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Грешка при актуализиране");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (need: ServiceNeedInfo) => {
    try {
      if (need.isActive) {
        await apiDeleteServiceNeed(need.id);
        setNeeds((prev) => prev.map((n) => (n.id === need.id ? { ...n, isActive: false } : n)));
      } else {
        const updated = await apiUpdateServiceNeed(need.id, {
          name: need.name,
          price: need.price,
          isActive: true,
        });
        setNeeds((prev) => prev.map((n) => (n.id === need.id ? updated : n)));
      }
    } catch (err: unknown) {
      setAlertMsg(err instanceof Error ? err.message : "Грешка");
    }
  };

  if (loading) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Управление на услуги</h2>
        <span className="badge">{needs.filter((n) => n.isActive).length} активни</span>
      </div>

      {/* Create / Edit form */}
      <div className="form-card" style={{ marginBottom: "1.5rem" }}>
        <h3>{editingId ? "Редактирай услуга" : "Добави нова услуга"}</h3>
        <form onSubmit={editingId ? handleUpdate : handleCreate} className="inline-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Име на услуга</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                placeholder="напр. Обработка на седла"
              />
            </div>
            <div className="form-group">
              <label>Цена (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? "Запазване..."
                : editingId
                ? "Запази промените"
                : "Добави услуга"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Отказ
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Име</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {needs.map((n) => (
              <tr key={n.id} className={n.isActive ? "" : "row-inactive"}>
                <td>{n.id}</td>
                <td><strong>{n.name}</strong></td>
                <td className="price">{n.price.toFixed(2)} €</td>
                <td>
                  <span className={`badge ${n.isActive ? "badge-green" : "badge-gray"}`}>
                    {n.isActive ? "Активна" : "Неактивна"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn btn-sm btn-outline" onClick={() => startEdit(n)}>
                    Ред.
                  </button>
                  <button
                    className={`btn btn-sm ${n.isActive ? "btn-danger" : "btn-success"}`}
                    onClick={() => handleToggleActive(n)}
                  >
                    {n.isActive ? "Деактивирай" : "Активирай"}
                  </button>
                </td>
              </tr>
            ))}
            {needs.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-row">
                  Няма добавени услуги
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AlertModal
        open={!!alertMsg}
        title="Грешка"
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
    </div>
  );
}

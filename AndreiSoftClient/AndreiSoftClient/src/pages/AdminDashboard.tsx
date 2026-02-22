import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Head } from "../types/Head";
import { apiGetAllHeads, apiDeleteHead } from "../services/api";
import { useSignalR } from "../hooks/useSignalR";
import { translateStatus } from "../utils/translations";

export default function AdminDashboard() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadHeads = async () => {
    try {
      const data = await apiGetAllHeads();
      setHeads(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeads();
  }, []);

  const { connected } = useSignalR(
    (h) => setHeads((prev) => [h, ...prev]),
    (h) => setHeads((prev) => prev.map((x) => (x.id === h.id ? h : x))),
    (id) => setHeads((prev) => prev.filter((x) => x.id !== id))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Изтрий тази глава?")) return;
    await apiDeleteHead(id);
    setHeads((prev) => prev.filter((h) => h.id !== id));
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "Added": return "badge-blue";
      case "WorkingOn": return "badge-orange";
      case "Completed": return "badge-green";
      case "GivenToClient": return "badge-gray";
      default: return "";
    }
  };

  const filtered = heads.filter((h) => {
    const matchText =
      `${h.make} ${h.model} ${h.partNumber} ${h.ownerFirstName} ${h.ownerLastName}`
        .toLowerCase()
        .includes(filter.toLowerCase());
    const matchStatus = statusFilter === "All" || h.status === statusFilter;
    return matchText && matchStatus;
  });

  if (loading) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Всички глави</h2>
        <div className="header-actions">
          <span className={`connection-dot ${connected ? "online" : "offline"}`} title={connected ? "На живо" : "Свързване..."} />
          <Link to="/admin/heads/create" className="btn btn-primary">+ Нова глава</Link>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Търсене по марка, модел, част №, собственик..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">Всички статуси</option>
          <option value="Added">Добавена</option>
          <option value="WorkingOn">В обработка</option>
          <option value="Completed">Завършена</option>
          <option value="GivenToClient">Предадена на клиент</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Марка / Модел</th>
              <th>Година</th>
              <th>Част №</th>
              <th>Собственик</th>
              <th>Статус</th>
              <th>Механик</th>
              <th>Цена</th>
              <th>Създадена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td><strong>{h.make}</strong> {h.model}</td>
                <td>{h.year}</td>
                <td><code>{h.partNumber}</code></td>
                <td>{h.ownerFirstName} {h.ownerLastName}</td>
                <td><span className={`badge ${statusColor(h.status)}`}>{translateStatus(h.status)}</span></td>
                <td>{h.mechanicDisplayName || "—"}</td>
                <td className="price">{h.price.toFixed(2)} €</td>
                <td>{new Date(h.createDate).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/admin/heads/${h.id}`} className="btn btn-sm btn-outline">Преглед</Link>
                  <Link to={`/admin/heads/${h.id}/edit`} className="btn btn-sm btn-outline">Ред.</Link>
                  <button onClick={() => handleDelete(h.id)} className="btn btn-sm btn-danger">Изтр.</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="empty-row">Няма намерени глави</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-bar">
        <span>Общо: {filtered.length}</span>
        <span>Обща стойност: {filtered.reduce((s, h) => s + h.price, 0).toFixed(2)} €</span>
      </div>
    </div>
  );
}

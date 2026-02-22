import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Head } from "../types/Head";
import { apiGetAllHeads, apiDeleteHead } from "../services/api";
import { useSignalR } from "../hooks/useSignalR";

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
    if (!confirm("Delete this head?")) return;
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

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>All Heads</h2>
        <div className="header-actions">
          <span className={`connection-dot ${connected ? "online" : "offline"}`} title={connected ? "Live" : "Connecting..."} />
          <Link to="/admin/heads/create" className="btn btn-primary">+ New Head</Link>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search make, model, part#, owner..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Added">Added</option>
          <option value="WorkingOn">Working On</option>
          <option value="Completed">Completed</option>
          <option value="GivenToClient">Given To Client</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Make / Model</th>
              <th>Year</th>
              <th>Part #</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Mechanic</th>
              <th>Price</th>
              <th>Created</th>
              <th>Actions</th>
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
                <td><span className={`badge ${statusColor(h.status)}`}>{h.status}</span></td>
                <td>{h.mechanicDisplayName || "—"}</td>
                <td className="price">${h.price.toFixed(2)}</td>
                <td>{new Date(h.createDate).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <Link to={`/admin/heads/${h.id}`} className="btn btn-sm btn-outline">View</Link>
                  <Link to={`/admin/heads/${h.id}/edit`} className="btn btn-sm btn-outline">Edit</Link>
                  <button onClick={() => handleDelete(h.id)} className="btn btn-sm btn-danger">Del</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="empty-row">No heads found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="summary-bar">
        <span>Total: {filtered.length}</span>
        <span>Total Value: ${filtered.reduce((s, h) => s + h.price, 0).toFixed(2)}</span>
      </div>
    </div>
  );
}

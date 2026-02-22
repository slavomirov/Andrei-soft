import { useEffect, useState } from "react";
import { apiGetMyWorkHistory } from "../services/api";
import type { HistoryEntry } from "../types/Head";

export default function MechanicHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    apiGetMyWorkHistory()
      .then(setEntries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading your work history...</div>;

  const filtered = entries.filter(
    (e) =>
      e.headSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleString();

  const actionBadgeClass = (action: string) => {
    switch (action) {
      case "Created": return "badge badge-blue";
      case "Updated": return "badge badge-orange";
      case "StartedWork": return "badge badge-orange";
      case "Finished": return "badge badge-green";
      case "ServiceNeedAdded": return "badge badge-blue";
      case "ServiceNeedRemoved": return "badge badge-orange";
      case "ServiceNeedChecked": return "badge badge-green";
      default: return "badge badge-gray";
    }
  };

  // Group by head for visual clarity
  const grouped = new Map<number, { summary: string; items: HistoryEntry[] }>();
  filtered.forEach((e) => {
    if (!grouped.has(e.headId)) grouped.set(e.headId, { summary: e.headSummary, items: [] });
    grouped.get(e.headId)!.items.push(e);
  });

  return (
    <div>
      <div className="page-header">
        <h2>My Work History</h2>
        <span className="badge">{filtered.length} entries</span>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search your history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No work history found.</p>
          <p className="text-muted">Your actions on heads will appear here.</p>
        </div>
      ) : (
        Array.from(grouped.entries())
          .sort(([a], [b]) => b - a)
          .map(([headId, { summary, items }]) => (
            <div key={headId} className="history-group">
              <div className="history-group-header">
                <h3>
                  #{headId} — {summary}
                </h3>
                <span className="badge">{items.length} actions</span>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((e) => (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(e.timestamp)}</td>
                        <td>
                          <span className={actionBadgeClass(e.action)}>{e.action}</span>
                        </td>
                        <td className="history-description">{e.description}</td>
                        <td>
                          <span className="badge">{e.status}</span>
                        </td>
                        <td className="price">${e.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}
    </div>
  );
}

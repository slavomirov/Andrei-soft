import { useEffect, useState } from "react";
import { apiGetMyWorkHistory } from "../services/api";
import type { HistoryEntry } from "../types/Head";
import { translateAction, translateStatus } from "../utils/translations";

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

  if (loading) return <div className="page-loader">Зареждане на история...</div>;

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
        <h2>Моята история</h2>
        <span className="badge">{filtered.length} записа</span>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Търсене в историята..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Няма намерена история.</p>
          <p className="text-muted">Вашите действия по главите ще се появят тук.</p>
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
                <span className="badge">{items.length} действия</span>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Действие</th>
                      <th>Описание</th>
                      <th>Статус</th>
                      <th>Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((e) => (
                      <tr key={e.id}>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(e.timestamp)}</td>
                        <td>
                          <span className={actionBadgeClass(e.action)}>{translateAction(e.action)}</span>
                        </td>
                        <td className="history-description">{e.description}</td>
                        <td>
                          <span className="badge">{translateStatus(e.status)}</span>
                        </td>
                        <td className="price">{e.price.toFixed(2)} €</td>
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

import { useEffect, useState } from "react";
import { apiGetAllHistory, apiGetUsers } from "../services/api";
import type { HistoryEntry, UserInfo } from "../types/Head";

type GroupMode = "all" | "byHead" | "byMechanic";

export default function AdminHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [mechanics, setMechanics] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupMode, setGroupMode] = useState<GroupMode>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([apiGetAllHistory(), apiGetUsers()])
      .then(([history, users]) => {
        setEntries(history);
        setMechanics((users as UserInfo[]).filter((u) => u.role === "Mechanic"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading history...</div>;

  const filtered = entries.filter(
    (e) =>
      e.headSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.changedByDisplayName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.mechanicDisplayName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const renderTable = (items: HistoryEntry[]) => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Head</th>
            <th>Action</th>
            <th>Description</th>
            <th>Changed By</th>
            <th>Mechanic</th>
            <th>Status</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-row">No history entries</td>
            </tr>
          ) : (
            items.map((e) => (
              <tr key={e.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(e.timestamp)}</td>
                <td>
                  <strong>#{e.headId}</strong> {e.headSummary}
                </td>
                <td><span className={actionBadgeClass(e.action)}>{e.action}</span></td>
                <td className="history-description">{e.description}</td>
                <td>{e.changedByDisplayName || "—"}</td>
                <td>{e.mechanicDisplayName || "—"}</td>
                <td><span className="badge">{e.status}</span></td>
                <td className="price">${e.price.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Group by Head
  const groupedByHead = () => {
    const map = new Map<number, { summary: string; items: HistoryEntry[] }>();
    filtered.forEach((e) => {
      if (!map.has(e.headId)) map.set(e.headId, { summary: e.headSummary, items: [] });
      map.get(e.headId)!.items.push(e);
    });
    return Array.from(map.entries()).sort(([a], [b]) => b - a);
  };

  // Group by Mechanic
  const groupedByMechanic = () => {
    const map = new Map<string, { name: string; items: HistoryEntry[] }>();

    // Add "unassigned" group
    const unassigned: HistoryEntry[] = [];

    filtered.forEach((e) => {
      const mechId = e.mechanicId;
      if (!mechId) {
        unassigned.push(e);
        return;
      }
      if (!map.has(mechId))
        map.set(mechId, { name: e.mechanicDisplayName || "Unknown", items: [] });
      map.get(mechId)!.items.push(e);
    });

    const result: [string, { name: string; items: HistoryEntry[] }][] = Array.from(
      map.entries()
    );
    if (unassigned.length > 0) {
      result.push(["unassigned", { name: "No Mechanic Assigned", items: unassigned }]);
    }
    return result;
  };

  return (
    <div>
      <div className="page-header">
        <h2>History</h2>
        <span className="badge">{filtered.length} entries</span>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={groupMode} onChange={(e) => setGroupMode(e.target.value as GroupMode)}>
          <option value="all">All (Flat)</option>
          <option value="byHead">Group by Head</option>
          <option value="byMechanic">Group by Mechanic</option>
        </select>
      </div>

      {groupMode === "all" && renderTable(filtered)}

      {groupMode === "byHead" &&
        groupedByHead().map(([headId, { summary, items }]) => (
          <div key={headId} className="history-group">
            <div className="history-group-header">
              <h3>
                #{headId} — {summary}
              </h3>
              <span className="badge">{items.length} entries</span>
            </div>
            {renderTable(items)}
          </div>
        ))}

      {groupMode === "byMechanic" &&
        groupedByMechanic().map(([mechId, { name, items }]) => (
          <div key={mechId} className="history-group">
            <div className="history-group-header">
              <h3>{name}</h3>
              <span className="badge">{items.length} entries</span>
            </div>
            {renderTable(items)}
          </div>
        ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { apiGetAllHistory, apiGetUsers } from "../services/api";
import type { HistoryEntry, UserInfo } from "../types/Head";
import { translateAction, translateStatus } from "../utils/translations";

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

  if (loading) return <div className="page-loader">Зареждане на история...</div>;

  const filtered = entries.filter(
    (e) =>
      e.headSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.changedByDisplayName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.mechanicDisplayName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "Added": return "badge badge-blue";
      case "WorkingOn": return "badge badge-orange";
      case "Completed": return "badge badge-green";
      case "GivenToClient": return "badge badge-gray";
      default: return "badge";
    }
  };

  const formatDateParts = (d: string) => {
    const date = new Date(d);
    return {
      day: date.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" }),
      time: date.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const renderTable = (items: HistoryEntry[]) => (
    <div className="table-wrapper">
      <table className="data-table history-data-table">
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "23%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Глава</th>
            <th>Действие</th>
            <th>Описание</th>
            <th>Променено от</th>
            <th>Механик</th>
            <th>Статус</th>
            <th>Цена</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-row">Няма записи в историята</td>
            </tr>
          ) : (
            items.map((e) => {
              const { day, time } = formatDateParts(e.timestamp);
              return (
                <tr key={e.id}>
                  <td className="history-date">
                    <div className="history-date-day">{day}</div>
                    <div className="history-date-time">{time}</div>
                  </td>
                  <td>
                    <span className="history-head-id">#{e.headId}</span>
                    <span className="history-head-summary">{e.headSummary}</span>
                  </td>
                  <td><span className={actionBadgeClass(e.action)}>{translateAction(e.action)}</span></td>
                  <td><div className="history-description">{e.description}</div></td>
                  <td>{e.changedByDisplayName ? <span className="history-name">{e.changedByDisplayName}</span> : <span className="history-name-empty">—</span>}</td>
                  <td>{e.mechanicDisplayName ? <span className="history-name">{e.mechanicDisplayName}</span> : <span className="history-name-empty">—</span>}</td>
                  <td><span className={statusBadgeClass(e.status)}>{translateStatus(e.status)}</span></td>
                  <td className="history-price">{e.price.toFixed(2)} €</td>
                </tr>
              );
            })
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
        map.set(mechId, { name: e.mechanicDisplayName || "Неизвестен", items: [] });
      map.get(mechId)!.items.push(e);
    });

    const result: [string, { name: string; items: HistoryEntry[] }][] = Array.from(
      map.entries()
    );
    if (unassigned.length > 0) {
      result.push(["unassigned", { name: "Без назначен механик", items: unassigned }]);
    }
    return result;
  };

  return (
    <div>
      <div className="page-header">
        <h2>История</h2>
        <span className="badge">{filtered.length} записа</span>
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          placeholder="Търсене в историята..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={groupMode} onChange={(e) => setGroupMode(e.target.value as GroupMode)}>
          <option value="all">Всички</option>
          <option value="byHead">Групиране по глава</option>
          <option value="byMechanic">Групиране по механик</option>
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
              <span className="badge">{items.length} записа</span>
            </div>
            {renderTable(items)}
          </div>
        ))}

      {groupMode === "byMechanic" &&
        groupedByMechanic().map(([mechId, { name, items }]) => (
          <div key={mechId} className="history-group">
            <div className="history-group-header">
              <h3>{name}</h3>
              <span className="badge">{items.length} записа</span>
            </div>
            {renderTable(items)}
          </div>
        ))}
    </div>
  );
}

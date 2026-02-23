import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Head } from "../types/Head";
import { apiGetMyHeads } from "../services/api";
import { useSignalR } from "../hooks/useSignalR";
import { translateStatus } from "../utils/translations";

export default function MechanicMyHeads() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHeads = async () => {
    try {
      const data = await apiGetMyHeads();
      setHeads(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadHeads(); }, []);

  const { connected } = useSignalR(
    undefined,
    (h) => {
      setHeads((prev) => {
        const exists = prev.find((x) => x.id === h.id);
        if (exists) {
          // If no longer mine, remove
          if (h.status === "Added" || h.status === "GivenToClient") {
            return prev.filter((x) => x.id !== h.id);
          }
          return prev.map((x) => (x.id === h.id ? h : x));
        }
        return prev;
      });
    },
    (id) => setHeads((prev) => prev.filter((x) => x.id !== id))
  );

  const statusColor = (s: string) => {
    switch (s) {
      case "WorkingOn": return "badge-orange";
      case "Completed": return "badge-green";
      default: return "";
    }
  };

  if (loading) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Моите глави</h2>
        <span className={`connection-dot ${connected ? "online" : "offline"}`} title={connected ? "На живо" : "Свързване..."} />
      </div>

      {heads.length === 0 ? (
        <div className="empty-state">
          <p>Нямате активни глави в момента.</p>
          <p className="text-muted">
            Отидете в <Link to="/mechanic">Налични глави</Link>, за да започнете работа.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {heads.map((h) => (
            <div key={h.id} className="head-card">
              <div className="head-card-header">
                <span className="head-card-id">#{h.id}</span>
                <span className={`badge ${statusColor(h.status)}`}>{translateStatus(h.status)}</span>
              </div>
              <h3>{h.make} {h.model} <span className="year">({h.year})</span></h3>
              <p className="part-number">Част: <code>{h.partNumber}</code></p>
              <p>Собственик: {h.ownerFirstName} {h.ownerLastName}</p>
              <div className="head-card-needs">
                {h.serviceNeeds.map((n) => {
                  const checked = h.checkedServiceNeeds.includes(n.id);
                  return (
                    <span key={n.id} className={`need-tag ${checked ? "need-tag-done" : ""}`}>
                      {checked ? "✅" : "⬜"} {n.name}
                    </span>
                  );
                })}
              </div>
              <div className="head-card-footer">
                <span className="price">{h.price.toFixed(2)} €</span>
                {h.status === "WorkingOn" && (
                  <Link to={`/mechanic/heads/${h.id}`} className="btn btn-primary">
                    ▶ Продължи работа
                  </Link>
                )}
                {h.status === "Completed" && (
                  <span className="badge badge-green">Завършена</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

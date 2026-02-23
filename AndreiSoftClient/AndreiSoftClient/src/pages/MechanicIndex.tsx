import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Head } from "../types/Head";
import { apiGetAvailableHeads, apiStartHead } from "../services/api";
import { useSignalR } from "../hooks/useSignalR";
import { translateStatus } from "../utils/translations";
import { AlertModal } from "../components/Modal";

export default function MechanicIndex() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState("");
  const navigate = useNavigate();

  const loadHeads = async () => {
    try {
      const data = await apiGetAvailableHeads();
      setHeads(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadHeads(); }, []);

  const { connected } = useSignalR(
    (h) => {
      if (h.status === "Added" && !h.mechanicId) {
        setHeads((prev) => {
          if (prev.find((x) => x.id === h.id)) return prev;
          return [h, ...prev];
        });
      }
    },
    (h) => {
      if (h.status === "Added" && !h.mechanicId) {
        // Head became available — add or update it
        setHeads((prev) => {
          const exists = prev.find((x) => x.id === h.id);
          if (exists) return prev.map((x) => (x.id === h.id ? h : x));
          return [h, ...prev];
        });
      } else {
        // Head is no longer available — remove it
        setHeads((prev) => prev.filter((x) => x.id !== h.id));
      }
    },
    (id) => setHeads((prev) => prev.filter((x) => x.id !== id))
  );

  const handleStart = async (id: number) => {
    setStartingId(id);
    try {
      await apiStartHead(id);
      navigate(`/mechanic/heads/${id}`);
    } catch (err) {
      setAlertMsg(err instanceof Error ? err.message : "Неуспешно започване на работа");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Налични глави</h2>
        <span className={`connection-dot ${connected ? "online" : "offline"}`} title={connected ? "На живо" : "Свързване..."} />
      </div>

      {heads.length === 0 ? (
        <div className="empty-state">
          <p>Няма налични глави в момента.</p>
          <p className="text-muted">Нови глави ще се появят тук в реално време.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {heads.map((h) => (
            <div key={h.id} className="head-card">
              <div className="head-card-header">
                <span className="head-card-id">#{h.id}</span>
                <span className="badge badge-blue">{translateStatus(h.status)}</span>
              </div>
              <h3>{h.make} {h.model} <span className="year">({h.year})</span></h3>
              <p className="part-number">Част: <code>{h.partNumber}</code></p>
              <p>Собственик: {h.ownerFirstName} {h.ownerLastName}</p>
              <p>Сервиз: {h.serviceName}</p>
              <div className="head-card-needs">
                {h.serviceNeeds.map((n) => (
                  <span key={n.id} className="need-tag">{n.name}</span>
                ))}
              </div>
              <div className="head-card-footer">
                <span className="price">{h.price.toFixed(2)} €</span>
                <button
                  className="btn btn-primary"
                  onClick={() => handleStart(h.id)}
                  disabled={startingId === h.id}
                >
                  {startingId === h.id ? "Започване..." : "▶ Започни работа"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertModal
        open={!!alertMsg}
        title="Грешка"
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
    </div>
  );
}

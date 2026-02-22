import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Head } from "../types/Head";
import { apiGetAvailableHeads, apiStartHead } from "../services/api";
import { useSignalR } from "../hooks/useSignalR";

export default function MechanicIndex() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
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
      // If head is no longer available, remove it
      if (h.status !== "Added" || h.mechanicId) {
        setHeads((prev) => prev.filter((x) => x.id !== h.id));
      } else {
        setHeads((prev) => prev.map((x) => (x.id === h.id ? h : x)));
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
      alert(err instanceof Error ? err.message : "Failed to start work");
    } finally {
      setStartingId(null);
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Available Heads</h2>
        <span className={`connection-dot ${connected ? "online" : "offline"}`} title={connected ? "Live" : "Connecting..."} />
      </div>

      {heads.length === 0 ? (
        <div className="empty-state">
          <p>No available heads at the moment.</p>
          <p className="text-muted">New heads will appear here in real-time.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {heads.map((h) => (
            <div key={h.id} className="head-card">
              <div className="head-card-header">
                <span className="head-card-id">#{h.id}</span>
                <span className="badge badge-blue">{h.status}</span>
              </div>
              <h3>{h.make} {h.model} <span className="year">({h.year})</span></h3>
              <p className="part-number">Part: <code>{h.partNumber}</code></p>
              <p>Owner: {h.ownerFirstName} {h.ownerLastName}</p>
              <p>Service: {h.serviceName}</p>
              <div className="head-card-needs">
                {h.serviceNeeds.map((n) => (
                  <span key={n} className="need-tag">{n}</span>
                ))}
              </div>
              <div className="head-card-footer">
                <span className="price">${h.price.toFixed(2)}</span>
                <button
                  className="btn btn-primary"
                  onClick={() => handleStart(h.id)}
                  disabled={startingId === h.id}
                >
                  {startingId === h.id ? "Starting..." : "▶ Start Work"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

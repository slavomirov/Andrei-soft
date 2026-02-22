import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Head, ServiceNeedInfo } from "../types/Head";
import {
  apiGetHead, apiGetServiceNeeds,
  apiAddServiceNeed, apiRemoveServiceNeed,
  apiCheckServiceNeed, apiFinishHead,
} from "../services/api";
import { useSignalR } from "../hooks/useSignalR";

export default function MechanicHeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [head, setHead] = useState<Head | null>(null);
  const [catalog, setCatalog] = useState<ServiceNeedInfo[]>([]);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    Promise.all([
      apiGetHead(Number(id)),
      apiGetServiceNeeds(),
    ]).then(([h, needs]) => {
      setHead(h);
      setCatalog(needs);
    }).catch(console.error);
  }, [id]);

  useSignalR(
    undefined,
    (h) => { if (h.id === Number(id)) setHead(h); },
  );

  if (!head) return <div className="page-loader">Loading...</div>;

  const allNeedNames = catalog.map((c) => c.name);
  const activeNeeds = head.serviceNeeds;
  const notSelectedNeeds = allNeedNames.filter((n) => !activeNeeds.includes(n));
  const allActiveChecked = activeNeeds.length > 0 &&
    activeNeeds.every((n) => head.checkedServiceNeeds.includes(n));

  const handleAdd = async (name: string) => {
    setBusy(name);
    try {
      const updated = await apiAddServiceNeed(head.id, name);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(""); }
  };

  const handleRemove = async (name: string) => {
    setBusy(name);
    try {
      const updated = await apiRemoveServiceNeed(head.id, name);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(""); }
  };

  const handleCheck = async (name: string) => {
    setBusy(name);
    try {
      const updated = await apiCheckServiceNeed(head.id, name);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Error"); }
    finally { setBusy(""); }
  };

  const handleFinish = async () => {
    if (!confirm("Mark this head as completed?")) return;
    try {
      await apiFinishHead(head.id);
      navigate("/mechanic");
    } catch (err) { alert(err instanceof Error ? err.message : "Error"); }
  };

  const getNeedDisplay = (name: string) => {
    const c = catalog.find((x) => x.name === name);
    return c ? c.displayName : name;
  };

  const getNeedPrice = (name: string) => {
    const c = catalog.find((x) => x.name === name);
    return c ? c.price : 0;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Working on Head #{head.id}</h2>
        <button className="btn btn-outline" onClick={() => navigate("/mechanic")}>← Back</button>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Vehicle Info</h3>
          <dl>
            <dt>Make</dt><dd>{head.make}</dd>
            <dt>Model</dt><dd>{head.model}</dd>
            <dt>Year</dt><dd>{head.year}</dd>
            <dt>Part #</dt><dd><code>{head.partNumber}</code></dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Owner</h3>
          <dl>
            <dt>Name</dt><dd>{head.ownerFirstName} {head.ownerLastName}</dd>
            <dt>Service</dt><dd>{head.serviceName}</dd>
            <dt>Phone</dt><dd>{head.servicePhoneNumber}</dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Financial</h3>
          <dl>
            <dt>Price</dt><dd className="price">${head.price.toFixed(2)}</dd>
            <dt>Your Salary (25%)</dt><dd>${head.mechanicSalary.toFixed(2)}</dd>
            <dt>Insurance (5%)</dt><dd>${head.insurance.toFixed(2)}</dd>
          </dl>
        </div>
      </div>

      {/* Active service needs */}
      <div className="detail-card" style={{ marginTop: "1.5rem" }}>
        <h3>Active Service Needs</h3>
        {activeNeeds.length === 0 ? (
          <p className="text-muted">No service needs. Add some below.</p>
        ) : (
          <div className="mechanic-needs-list">
            {activeNeeds.map((n) => {
              const isChecked = head.checkedServiceNeeds.includes(n);
              return (
                <div key={n} className={`mechanic-need-item ${isChecked ? "done" : ""}`}>
                  <button
                    className={`check-btn ${isChecked ? "checked" : ""}`}
                    onClick={() => handleCheck(n)}
                    disabled={busy === n}
                    title={isChecked ? "Uncheck" : "Mark as completed"}
                  >
                    {isChecked ? "✅" : "⬜"}
                  </button>
                  <span className="need-label">{getNeedDisplay(n)}</span>
                  <span className="need-price">${getNeedPrice(n).toFixed(2)}</span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemove(n)}
                    disabled={busy === n}
                    title="Remove need"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available service needs (not selected) */}
      {notSelectedNeeds.length > 0 && (
        <div className="detail-card" style={{ marginTop: "1rem" }}>
          <h3>Available Service Needs</h3>
          <div className="mechanic-needs-list">
            {notSelectedNeeds.map((n) => (
              <div key={n} className="mechanic-need-item unavailable">
                <span className="need-label strikethrough">{getNeedDisplay(n)}</span>
                <span className="need-price">${getNeedPrice(n).toFixed(2)}</span>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAdd(n)}
                  disabled={busy === n}
                  title="Add service need"
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Finish button */}
      {allActiveChecked && head.status === "WorkingOn" && (
        <div className="finish-section">
          <button className="btn btn-lg btn-success" onClick={handleFinish}>
            ✓ Finish Head
          </button>
        </div>
      )}
    </div>
  );
}

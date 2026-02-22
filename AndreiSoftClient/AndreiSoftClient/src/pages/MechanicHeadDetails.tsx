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
  const [busy, setBusy] = useState<number | null>(null);

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

  if (!head) return <div className="page-loader">Зареждане...</div>;

  const activeNeedIds = head.serviceNeeds.map((n) => n.id);
  const notSelectedNeeds = catalog.filter((c) => !activeNeedIds.includes(c.id));
  const allActiveChecked = head.serviceNeeds.length > 0 &&
    head.serviceNeeds.every((n) => head.checkedServiceNeeds.includes(n.id));

  const handleAdd = async (needId: number) => {
    setBusy(needId);
    try {
      const updated = await apiAddServiceNeed(head.id, needId);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Грешка"); }
    finally { setBusy(null); }
  };

  const handleRemove = async (needId: number) => {
    setBusy(needId);
    try {
      const updated = await apiRemoveServiceNeed(head.id, needId);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Грешка"); }
    finally { setBusy(null); }
  };

  const handleCheck = async (needId: number) => {
    setBusy(needId);
    try {
      const updated = await apiCheckServiceNeed(head.id, needId);
      setHead(updated);
    } catch (err) { alert(err instanceof Error ? err.message : "Грешка"); }
    finally { setBusy(null); }
  };

  const handleFinish = async () => {
    if (!confirm("Маркирай главата като завършена?")) return;
    try {
      await apiFinishHead(head.id);
      navigate("/mechanic");
    } catch (err) { alert(err instanceof Error ? err.message : "Грешка"); }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Работа по глава #{head.id}</h2>
        <button className="btn btn-outline" onClick={() => navigate("/mechanic")}>← Назад</button>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Информация за автомобил</h3>
          <dl>
            <dt>Марка</dt><dd>{head.make}</dd>
            <dt>Модел</dt><dd>{head.model}</dd>
            <dt>Година</dt><dd>{head.year}</dd>
            <dt>Част №</dt><dd><code>{head.partNumber}</code></dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Собственик</h3>
          <dl>
            <dt>Име</dt><dd>{head.ownerFirstName} {head.ownerLastName}</dd>
            <dt>Сервиз</dt><dd>{head.serviceName}</dd>
            <dt>Телефон</dt><dd>{head.servicePhoneNumber}</dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Финанси</h3>
          <dl>
            <dt>Цена</dt><dd className="price">{head.price.toFixed(2)} €</dd>
            <dt>Вашата заплата (25%)</dt><dd>{head.mechanicSalary.toFixed(2)} €</dd>
            <dt>Застраховка (5%)</dt><dd>{head.insurance.toFixed(2)} €</dd>
          </dl>
        </div>
      </div>

      {/* Active service needs */}
      <div className="detail-card" style={{ marginTop: "1.5rem" }}>
        <h3>Активни услуги</h3>
        {head.serviceNeeds.length === 0 ? (
          <p className="text-muted">Няма услуги. Добавете от по-долу.</p>
        ) : (
          <div className="mechanic-needs-list">
            {head.serviceNeeds.map((n) => {
              const isChecked = head.checkedServiceNeeds.includes(n.id);
              return (
                <div key={n.id} className={`mechanic-need-item ${isChecked ? "done" : ""}`}>
                  <button
                    className={`check-btn ${isChecked ? "checked" : ""}`}
                    onClick={() => handleCheck(n.id)}
                    disabled={busy === n.id}
                    title={isChecked ? "Отмаркирай" : "Маркирай като завършено"}
                  >
                    {isChecked ? "✅" : "⬜"}
                  </button>
                  <span className="need-label">{n.name}</span>
                  <span className="need-price">{n.price.toFixed(2)} €</span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemove(n.id)}
                    disabled={busy === n.id}
                    title="Премахни услуга"
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
          <h3>Налични услуги</h3>
          <div className="mechanic-needs-list">
            {notSelectedNeeds.map((n) => (
              <div key={n.id} className="mechanic-need-item unavailable">
                <span className="need-label strikethrough">{n.name}</span>
                <span className="need-price">{n.price.toFixed(2)} €</span>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAdd(n.id)}
                  disabled={busy === n.id}
                  title="Добави услуга"
                >
                  + Добави
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
            ✓ Завърши глава
          </button>
        </div>
      )}
    </div>
  );
}

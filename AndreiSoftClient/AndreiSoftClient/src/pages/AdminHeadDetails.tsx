import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiGetHead, apiGiveToClient } from "../services/api";
import type { Head } from "../types/Head";
import { useSignalR } from "../hooks/useSignalR";
import { translateStatus } from "../utils/translations";
import { ConfirmModal, AlertModal } from "../components/Modal";

export default function AdminHeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [head, setHead] = useState<Head | null>(null);
  const [showGiveConfirm, setShowGiveConfirm] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    apiGetHead(Number(id)).then(setHead).catch(console.error);
  }, [id]);

  useSignalR(
    undefined,
    (h) => { if (h.id === Number(id)) setHead(h); },
  );

  if (!head) return <div className="page-loader">Зареждане...</div>;

  const statusColor = (s: string) => {
    switch (s) {
      case "Added": return "badge-blue";
      case "WorkingOn": return "badge-orange";
      case "Completed": return "badge-green";
      case "GivenToClient": return "badge-gray";
      default: return "";
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Глава #{head.id}</h2>
        <Link to="/admin" className="btn btn-outline">← Назад</Link>
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
          <h3>Статус и назначение</h3>
          <dl>
            <dt>Статус</dt><dd><span className={`badge ${statusColor(head.status)}`}>{translateStatus(head.status)}</span></dd>
            <dt>Механик</dt><dd>{head.mechanicDisplayName || "—"}</dd>
            <dt>Създадена</dt><dd>{new Date(head.createDate).toLocaleString()}</dd>
            {head.completedDate && <><dt>Завършена</dt><dd>{new Date(head.completedDate).toLocaleString()}</dd></>}
          </dl>
        </div>

        <div className="detail-card">
          <h3>Финанси</h3>
          <dl>
            <dt>Цена</dt><dd className="price">{head.price.toFixed(2)} €</dd>
            <dt>Заплата на механик (25%)</dt><dd>{head.mechanicSalary.toFixed(2)} €</dd>
            <dt>Осигуровки (5%)</dt><dd>{head.insurance.toFixed(2)} €</dd>
          </dl>
        </div>
      </div>

      <div className="detail-card" style={{ marginTop: "1rem" }}>
        <h3>Необходими услуги</h3>
        <div className="needs-list">
          {head.serviceNeeds.map((n) => (
            <div key={n.id} className={`need-item ${head.checkedServiceNeeds.includes(n.id) ? "checked" : ""}`}>
              {head.checkedServiceNeeds.includes(n.id) ? "✅" : "⬜"} {n.name}
            </div>
          ))}
          {head.serviceNeeds.length === 0 && <p className="text-muted">Няма избрани услуги</p>}
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: "1rem" }}>
        <Link to={`/admin/heads/${head.id}/edit`} className="btn btn-primary">Редактирай глава</Link>
        {head.status === "Completed" && (
          <button className="btn btn-success" onClick={() => setShowGiveConfirm(true)}>
            ✔ Предай на клиент
          </button>
        )}
      </div>

      <ConfirmModal
        open={showGiveConfirm}
        title="Предаване на клиент"
        message="Сигурни ли сте, че искате да маркирате тази глава като предадена на клиент?"
        onConfirm={async () => {
          setShowGiveConfirm(false);
          try {
            const updated = await apiGiveToClient(head.id);
            setHead(updated);
          } catch (err) {
            setAlertMsg(err instanceof Error ? err.message : "Грешка");
          }
        }}
        onCancel={() => setShowGiveConfirm(false)}
      />

      <AlertModal
        open={!!alertMsg}
        title="Грешка"
        message={alertMsg}
        onClose={() => setAlertMsg("")}
      />
    </div>
  );
}

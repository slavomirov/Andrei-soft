import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetMyReport } from "../services/api";
import { translateStatus } from "../utils/translations";
import type { Head } from "../types/Head";

type Period = "week" | "month" | "year";

export default function MechanicReports() {
  const [period, setPeriod] = useState<Period>("week");
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiGetMyReport(period)
      .then(setHeads)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const periodLabel = (p: Period) => {
    switch (p) {
      case "week": return "Седмица";
      case "month": return "Месец";
      case "year": return "Година";
    }
  };

  const totalPrice = heads.reduce((s, h) => s + h.price, 0);
  const totalSalary = heads.reduce((s, h) => s + h.mechanicSalary, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Моят отчет</h2>
      </div>

      <div className="report-tabs">
        {(["week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            className={`btn ${period === p ? "btn-primary" : "btn-outline"}`}
            onClick={() => setPeriod(p)}
          >
            {periodLabel(p)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader">Зареждане...</div>
      ) : heads.length === 0 ? (
        <div className="empty-state">
          <p>Няма завършени глави за избрания период.</p>
        </div>
      ) : (
        <>
          <div className="report-summary-bar">
            <span>Завършени глави: <strong>{heads.length}</strong></span>
            <span>Общ приход: <strong>{totalPrice.toFixed(2)} €</strong></span>
            <span>Вашата заплата: <strong>{totalSalary.toFixed(2)} €</strong></span>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Марка / Модел</th>
                  <th>Година</th>
                  <th>Част №</th>
                  <th>Собственик</th>
                  <th>Статус</th>
                  <th>Цена</th>
                  <th>Вашата заплата</th>
                  <th>Завършена</th>
                </tr>
              </thead>
              <tbody>
                {heads.map((h) => (
                  <tr
                    key={h.id}
                    className="report-row clickable"
                    onClick={() => navigate(`/mechanic/heads/${h.id}`)}
                  >
                    <td>{h.id}</td>
                    <td><strong>{h.make}</strong> {h.model}</td>
                    <td>{h.year}</td>
                    <td><code>{h.partNumber}</code></td>
                    <td>{h.ownerFirstName} {h.ownerLastName}</td>
                    <td><span className="badge badge-green">{translateStatus(h.status)}</span></td>
                    <td className="price">{h.price.toFixed(2)} €</td>
                    <td>{h.mechanicSalary.toFixed(2)} €</td>
                    <td>{h.completedDate ? new Date(h.completedDate).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

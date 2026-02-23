import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGetReport } from "../services/api";
import { translateStatus } from "../utils/translations";
import type { Head } from "../types/Head";

type Period = "week" | "month" | "year";

interface MechanicGroup {
  mechanicId: string;
  mechanicName: string;
  heads: Head[];
  totalPrice: number;
  mechanicSalary: number;
  insurance: number;
}

export default function AdminReports() {
  const [period, setPeriod] = useState<Period>("week");
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMechanic, setExpandedMechanic] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiGetReport(period)
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

  // Group heads by mechanic
  const groups: MechanicGroup[] = [];
  const map = new Map<string, MechanicGroup>();

  for (const h of heads) {
    const mid = h.mechanicId || "unassigned";
    const mname = h.mechanicDisplayName || "Неназначен";
    if (!map.has(mid)) {
      const g: MechanicGroup = {
        mechanicId: mid,
        mechanicName: mname,
        heads: [],
        totalPrice: 0,
        mechanicSalary: 0,
        insurance: 0,
      };
      map.set(mid, g);
      groups.push(g);
    }
    const g = map.get(mid)!;
    g.heads.push(h);
    g.totalPrice += h.price;
    g.mechanicSalary += h.mechanicSalary;
    g.insurance += h.insurance;
  }

  const grandTotalPrice = groups.reduce((s, g) => s + g.totalPrice, 0);
  const grandTotalSalary = groups.reduce((s, g) => s + g.mechanicSalary, 0);
  const grandTotalInsurance = groups.reduce((s, g) => s + g.insurance, 0);

  return (
    <div>
      <div className="page-header">
        <h2>Отчети на механици</h2>
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
            <span>Общо глави: <strong>{heads.length}</strong></span>
            <span>Общ приход: <strong>{grandTotalPrice.toFixed(2)} €</strong></span>
            <span>Общо заплати: <strong>{grandTotalSalary.toFixed(2)} €</strong></span>
            <span>Общо осигуровки: <strong>{grandTotalInsurance.toFixed(2)} €</strong></span>
          </div>

          {groups.map((g) => (
            <div key={g.mechanicId} className="report-mechanic-group">
              <div
                className="report-mechanic-header"
                onClick={() => setExpandedMechanic(expandedMechanic === g.mechanicId ? null : g.mechanicId)}
              >
                <div className="report-mechanic-info">
                  <h3>{g.mechanicName}</h3>
                  <span className="badge">{g.heads.length} {g.heads.length === 1 ? "глава" : "глави"}</span>
                </div>
                <div className="report-mechanic-totals">
                  <span className="report-total">Приход: <strong>{g.totalPrice.toFixed(2)} €</strong></span>
                  <span className="report-salary">Заплата: <strong>{g.mechanicSalary.toFixed(2)} €</strong></span>
                  <span className="report-insurance">Осигуровки: <strong>{g.insurance.toFixed(2)} €</strong></span>
                  <span className="expand-arrow">{expandedMechanic === g.mechanicId ? "▼" : "▶"}</span>
                </div>
              </div>

              {expandedMechanic === g.mechanicId && (
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
                        <th>Заплата</th>
                        <th>Осигуровки</th>
                        <th>Завършена</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.heads.map((h) => (
                        <tr
                          key={h.id}
                          className="report-row clickable"
                          onClick={() => navigate(`/admin/heads/${h.id}`)}
                        >
                          <td>{h.id}</td>
                          <td><strong>{h.make}</strong> {h.model}</td>
                          <td>{h.year}</td>
                          <td><code>{h.partNumber}</code></td>
                          <td>{h.ownerFirstName} {h.ownerLastName}</td>
                          <td><span className="badge badge-green">{translateStatus(h.status)}</span></td>
                          <td className="price">{h.price.toFixed(2)} €</td>
                          <td>{h.mechanicSalary.toFixed(2)} €</td>
                          <td>{h.insurance.toFixed(2)} €</td>
                          <td>{h.completedDate ? new Date(h.completedDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

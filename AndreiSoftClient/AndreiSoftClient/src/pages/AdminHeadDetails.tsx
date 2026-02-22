import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetHead } from "../services/api";
import type { Head } from "../types/Head";
import { useSignalR } from "../hooks/useSignalR";

export default function AdminHeadDetails() {
  const { id } = useParams<{ id: string }>();
  const [head, setHead] = useState<Head | null>(null);

  useEffect(() => {
    apiGetHead(Number(id)).then(setHead).catch(console.error);
  }, [id]);

  useSignalR(
    undefined,
    (h) => { if (h.id === Number(id)) setHead(h); },
  );

  if (!head) return <div className="page-loader">Loading...</div>;

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
        <h2>Head #{head.id}</h2>
        <Link to="/admin" className="btn btn-outline">← Back</Link>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>Vehicle Info</h3>
          <dl>
            <dt>Make</dt><dd>{head.make}</dd>
            <dt>Model</dt><dd>{head.model}</dd>
            <dt>Year</dt><dd>{head.year}</dd>
            <dt>Part Number</dt><dd><code>{head.partNumber}</code></dd>
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
          <h3>Status & Assignment</h3>
          <dl>
            <dt>Status</dt><dd><span className={`badge ${statusColor(head.status)}`}>{head.status}</span></dd>
            <dt>Mechanic</dt><dd>{head.mechanicDisplayName || "—"}</dd>
            <dt>Created</dt><dd>{new Date(head.createDate).toLocaleString()}</dd>
            {head.completedDate && <><dt>Completed</dt><dd>{new Date(head.completedDate).toLocaleString()}</dd></>}
          </dl>
        </div>

        <div className="detail-card">
          <h3>Financial</h3>
          <dl>
            <dt>Price</dt><dd className="price">${head.price.toFixed(2)}</dd>
            <dt>Mechanic Salary (25%)</dt><dd>${head.mechanicSalary.toFixed(2)}</dd>
            <dt>Insurance (5%)</dt><dd>${head.insurance.toFixed(2)}</dd>
          </dl>
        </div>
      </div>

      <div className="detail-card" style={{ marginTop: "1rem" }}>
        <h3>Service Needs</h3>
        <div className="needs-list">
          {head.serviceNeeds.map((n) => (
            <div key={n} className={`need-item ${head.checkedServiceNeeds.includes(n) ? "checked" : ""}`}>
              {head.checkedServiceNeeds.includes(n) ? "✅" : "⬜"} {n}
            </div>
          ))}
          {head.serviceNeeds.length === 0 && <p className="text-muted">No service needs selected</p>}
        </div>
      </div>

      <div className="form-actions" style={{ marginTop: "1rem" }}>
        <Link to={`/admin/heads/${head.id}/edit`} className="btn btn-primary">Edit Head</Link>
      </div>
    </div>
  );
}

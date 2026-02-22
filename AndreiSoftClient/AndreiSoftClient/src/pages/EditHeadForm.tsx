import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetHead, apiUpdateHead, apiGetServiceNeeds } from "../services/api";
import type { Head, ServiceNeedInfo } from "../types/Head";

export default function EditHeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ServiceNeedInfo[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [head, setHead] = useState<Head | null>(null);

  const [form, setForm] = useState({
    make: "", model: "", year: 2024, partNumber: "",
    ownerFirstName: "", ownerLastName: "",
    serviceName: "", servicePhoneNumber: "",
    status: "Added",
  });

  useEffect(() => {
    Promise.all([
      apiGetHead(Number(id)),
      apiGetServiceNeeds(),
    ]).then(([h, needs]) => {
      setHead(h);
      setCatalog(needs);
      setForm({
        make: h.make, model: h.model, year: h.year, partNumber: h.partNumber,
        ownerFirstName: h.ownerFirstName, ownerLastName: h.ownerLastName,
        serviceName: h.serviceName, servicePhoneNumber: h.servicePhoneNumber,
        status: h.status,
      });
      setSelectedNeeds(new Set(h.serviceNeeds));
    }).catch(console.error);
  }, [id]);

  const toggleNeed = (name: string) => {
    setSelectedNeeds((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const totalPrice = catalog
    .filter((n) => selectedNeeds.has(n.name))
    .reduce((s, n) => s + n.price, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiUpdateHead(Number(id), {
        ...form,
        serviceNeeds: Array.from(selectedNeeds),
        status: form.status,
      });
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "year" ? parseInt(e.target.value) || 0 : e.target.value,
    }));
  };

  if (!head) return <div className="page-loader">Loading...</div>;

  return (
    <div>
      <div className="page-header"><h2>Edit Head #{head.id}</h2></div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Vehicle / Part Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Make</label>
              <input value={form.make} onChange={handleChange("make")} required />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input value={form.model} onChange={handleChange("model")} required />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.year} onChange={handleChange("year")} required />
            </div>
            <div className="form-group">
              <label>Part Number</label>
              <input value={form.partNumber} onChange={handleChange("partNumber")} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Owner Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input value={form.ownerFirstName} onChange={handleChange("ownerFirstName")} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={form.ownerLastName} onChange={handleChange("ownerLastName")} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Service Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Service Name</label>
              <input value={form.serviceName} onChange={handleChange("serviceName")} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.servicePhoneNumber} onChange={handleChange("servicePhoneNumber")} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Status</h3>
          <select value={form.status} onChange={handleChange("status")}>
            <option value="Added">Added</option>
            <option value="WorkingOn">Working On</option>
            <option value="Completed">Completed</option>
            <option value="GivenToClient">Given To Client</option>
          </select>
        </div>

        <div className="form-section">
          <h3>Service Needs</h3>
          <div className="service-needs-grid">
            {catalog.map((n) => (
              <label key={n.name} className={`need-checkbox ${selectedNeeds.has(n.name) ? "selected" : ""}`}>
                <input type="checkbox" checked={selectedNeeds.has(n.name)} onChange={() => toggleNeed(n.name)} />
                <span className="need-name">{n.displayName}</span>
                <span className="need-price">${n.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
          <div className="price-summary"><strong>Total Price: ${totalPrice.toFixed(2)}</strong></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

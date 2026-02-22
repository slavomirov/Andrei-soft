import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateHead, apiGetServiceNeeds } from "../services/api";
import type { ServiceNeedInfo } from "../types/Head";

export default function CreateHeadForm() {
  const navigate = useNavigate();
  const [serviceNeedsCatalog, setServiceNeedsCatalog] = useState<ServiceNeedInfo[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    partNumber: "",
    ownerFirstName: "",
    ownerLastName: "",
    serviceName: "",
    servicePhoneNumber: "",
  });

  useEffect(() => {
    apiGetServiceNeeds().then(setServiceNeedsCatalog).catch(console.error);
  }, []);

  const toggleNeed = (name: string) => {
    setSelectedNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const totalPrice = serviceNeedsCatalog
    .filter((n) => selectedNeeds.has(n.name))
    .reduce((s, n) => s + n.price, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiCreateHead({
        ...form,
        serviceNeeds: Array.from(selectedNeeds),
      });
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create head");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "year" ? parseInt(e.target.value) || 0 : e.target.value,
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h2>Create New Head</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Vehicle / Part Info</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Make</label>
              <input value={form.make} onChange={handleChange("make")} required placeholder="e.g. Toyota" />
            </div>
            <div className="form-group">
              <label>Model</label>
              <input value={form.model} onChange={handleChange("model")} required placeholder="e.g. 2JZ-GTE" />
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={form.year} onChange={handleChange("year")} required min={1950} max={2030} />
            </div>
            <div className="form-group">
              <label>Part Number</label>
              <input value={form.partNumber} onChange={handleChange("partNumber")} required placeholder="e.g. 11101-49686" />
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
              <input value={form.servicePhoneNumber} onChange={handleChange("servicePhoneNumber")} required placeholder="+359..." />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Service Needs</h3>
          <div className="service-needs-grid">
            {serviceNeedsCatalog.map((n) => (
              <label key={n.name} className={`need-checkbox ${selectedNeeds.has(n.name) ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={selectedNeeds.has(n.name)}
                  onChange={() => toggleNeed(n.name)}
                />
                <span className="need-name">{n.displayName}</span>
                <span className="need-price">${n.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
          <div className="price-summary">
            <strong>Total Price: ${totalPrice.toFixed(2)}</strong>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Head"}
          </button>
        </div>
      </form>
    </div>
  );
}

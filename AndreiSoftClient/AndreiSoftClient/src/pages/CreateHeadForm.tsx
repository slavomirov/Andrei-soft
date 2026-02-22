import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateHead, apiGetServiceNeeds } from "../services/api";
import type { ServiceNeedInfo } from "../types/Head";

export default function CreateHeadForm() {
  const navigate = useNavigate();
  const [serviceNeedsCatalog, setServiceNeedsCatalog] = useState<ServiceNeedInfo[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<Set<number>>(new Set());
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

  const toggleNeed = (id: number) => {
    setSelectedNeeds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPrice = serviceNeedsCatalog
    .filter((n) => selectedNeeds.has(n.id))
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
      setError(err instanceof Error ? err.message : "Неуспешно създаване на глава");
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
        <h2>Създаване на нова глава</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Информация за автомобил / Част</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Марка</label>
              <input value={form.make} onChange={handleChange("make")} required placeholder="напр. Toyota" />
            </div>
            <div className="form-group">
              <label>Модел</label>
              <input value={form.model} onChange={handleChange("model")} required placeholder="напр. 2JZ-GTE" />
            </div>
            <div className="form-group">
              <label>Година</label>
              <input type="number" value={form.year} onChange={handleChange("year")} required min={1950} max={2030} />
            </div>
            <div className="form-group">
              <label>Част №</label>
              <input value={form.partNumber} onChange={handleChange("partNumber")} required placeholder="напр. 11101-49686" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Информация за собственик</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Име</label>
              <input value={form.ownerFirstName} onChange={handleChange("ownerFirstName")} required />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input value={form.ownerLastName} onChange={handleChange("ownerLastName")} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Контакт за сервиз</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Име на сервиз</label>
              <input value={form.serviceName} onChange={handleChange("serviceName")} required />
            </div>
            <div className="form-group">
              <label>Телефонен номер</label>
              <input value={form.servicePhoneNumber} onChange={handleChange("servicePhoneNumber")} required placeholder="+359..." />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Необходими услуги</h3>
          <div className="service-needs-grid">
            {serviceNeedsCatalog.map((n) => (
              <label key={n.id} className={`need-checkbox ${selectedNeeds.has(n.id) ? "selected" : ""}`}>
                <input
                  type="checkbox"
                  checked={selectedNeeds.has(n.id)}
                  onChange={() => toggleNeed(n.id)}
                />
                <span className="need-name">{n.name}</span>
                <span className="need-price">{n.price.toFixed(2)} €</span>
              </label>
            ))}
          </div>
          <div className="price-summary">
            <strong>Обща цена: {totalPrice.toFixed(2)} €</strong>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>Отказ</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Създаване..." : "Създай глава"}
          </button>
        </div>
      </form>
    </div>
  );
}

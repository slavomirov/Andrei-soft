import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGetHead, apiUpdateHead, apiGetServiceNeeds, apiGetUsers } from "../services/api";
import type { Head, ServiceNeedInfo, UserInfo } from "../types/Head";

export default function EditHeadForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<ServiceNeedInfo[]>([]);
  const [selectedNeeds, setSelectedNeeds] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [head, setHead] = useState<Head | null>(null);
  const [mechanics, setMechanics] = useState<UserInfo[]>([]);

  const [form, setForm] = useState({
    make: "", model: "", year: 2024, partNumber: "",
    ownerFirstName: "", ownerLastName: "",
    serviceName: "", servicePhoneNumber: "",
    status: "Added",
    mechanicId: "" as string | null,
  });

  useEffect(() => {
    Promise.all([
      apiGetHead(Number(id)),
      apiGetServiceNeeds(),
      apiGetUsers(),
    ]).then(([h, needs, users]) => {
      setHead(h);
      setCatalog(needs);
      setMechanics(users.filter((u: UserInfo) => u.role === "Mechanic" && u.isActive));
      setForm({
        make: h.make, model: h.model, year: h.year, partNumber: h.partNumber,
        ownerFirstName: h.ownerFirstName, ownerLastName: h.ownerLastName,
        serviceName: h.serviceName, servicePhoneNumber: h.servicePhoneNumber,
        status: h.status,
        mechanicId: h.mechanicId || "",
      });
      setSelectedNeeds(new Set(h.serviceNeeds.map((sn: ServiceNeedInfo) => sn.id)));
    }).catch(console.error);
  }, [id]);

  const toggleNeed = (id: number) => {
    setSelectedNeeds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalPrice = catalog
    .filter((n) => selectedNeeds.has(n.id))
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
        mechanicId: head?.mechanicId ? form.mechanicId : undefined,
      });
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неуспешно актуализиране");
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

  if (!head) return <div className="page-loader">Зареждане...</div>;

  return (
    <div>
      <div className="page-header"><h2>Редактиране на глава #{head.id}</h2></div>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <h3>Информация за автомобил / Част</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Марка</label>
              <input value={form.make} onChange={handleChange("make")} />
            </div>
            <div className="form-group">
              <label>Модел</label>
              <input value={form.model} onChange={handleChange("model")} />
            </div>
            <div className="form-group">
              <label>Година</label>
              <input type="number" value={form.year} onChange={handleChange("year")} />
            </div>
            <div className="form-group">
              <label>Част №</label>
              <input value={form.partNumber} onChange={handleChange("partNumber")} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Информация за собственик</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Име</label>
              <input value={form.ownerFirstName} onChange={handleChange("ownerFirstName")} />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input value={form.ownerLastName} onChange={handleChange("ownerLastName")} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Контакт за сервиз</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Име на сервиз</label>
              <input value={form.serviceName} onChange={handleChange("serviceName")} />
            </div>
            <div className="form-group">
              <label>Телефонен номер</label>
              <input value={form.servicePhoneNumber} onChange={handleChange("servicePhoneNumber")} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Статус</h3>
          <select value={form.status} onChange={handleChange("status")}>
            <option value="Added">Добавена</option>
            <option value="WorkingOn">В обработка</option>
            <option value="Completed">Завършена</option>
            <option value="GivenToClient">Предадена на клиент</option>
          </select>
        </div>

        {head.mechanicId && (
          <div className="form-section">
            <h3>Назначен механик</h3>
            <select
              value={form.mechanicId || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, mechanicId: e.target.value }))}
            >
              <option value="">— Без механик —</option>
              {mechanics.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.userName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-section">
          <h3>Необходими услуги</h3>
          <div className="service-needs-grid">
            {catalog.map((n) => (
              <label key={n.id} className={`need-checkbox ${selectedNeeds.has(n.id) ? "selected" : ""}`}>
                <input type="checkbox" checked={selectedNeeds.has(n.id)} onChange={() => toggleNeed(n.id)} />
                <span className="need-name">{n.name}</span>
                <span className="need-price">{n.price.toFixed(2)} €</span>
              </label>
            ))}
          </div>
          <div className="price-summary"><strong>Обща цена: {totalPrice.toFixed(2)} €</strong></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate("/admin")}>Отказ</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Запазване..." : "Запази промените"}
          </button>
        </div>
      </form>
    </div>
  );
}

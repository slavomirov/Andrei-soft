import API_BASE from "../config";

function getToken(): string {
  return localStorage.getItem("token") ?? "";
}

function headers(json = true): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${getToken()}`,
  };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function handleResponse(res: Response) {
  if (res.status === 401) {
    // Try refresh
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const parsed = JSON.parse(authUser);
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: parsed.refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("authUser", JSON.stringify(data));
        localStorage.setItem("token", data.accessToken);
        // Caller should retry
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || res.statusText);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") return null;
  return res.json();
}

// ── Auth ────────────────────────────────────────────────────────
export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
}

export async function apiChangePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });
  return handleResponse(res);
}

// ── Users (admin) ───────────────────────────────────────────────
export async function apiGetUsers() {
  const res = await fetch(`${API_BASE}/users`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiCreateUser(dto: {
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export async function apiUpdateUser(id: string, dto: {
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export async function apiDeactivateUser(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: headers(false),
  });
  return handleResponse(res);
}

// ── Heads ───────────────────────────────────────────────────────
export async function apiGetAllHeads() {
  const res = await fetch(`${API_BASE}/heads`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiGetAvailableHeads() {
  const res = await fetch(`${API_BASE}/heads/available`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiGetHead(id: number) {
  const res = await fetch(`${API_BASE}/heads/${id}`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiCreateHead(dto: {
  make: string;
  model: string;
  year: number;
  partNumber: string;
  ownerFirstName: string;
  ownerLastName: string;
  serviceName: string;
  servicePhoneNumber: string;
  serviceNeeds: string[];
}) {
  const res = await fetch(`${API_BASE}/heads`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export async function apiUpdateHead(id: number, dto: {
  make: string;
  model: string;
  year: number;
  partNumber: string;
  ownerFirstName: string;
  ownerLastName: string;
  serviceName: string;
  servicePhoneNumber: string;
  serviceNeeds: string[];
  status?: string;
}) {
  const res = await fetch(`${API_BASE}/heads/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(dto),
  });
  return handleResponse(res);
}

export async function apiDeleteHead(id: number) {
  const res = await fetch(`${API_BASE}/heads/${id}`, {
    method: "DELETE",
    headers: headers(false),
  });
  return handleResponse(res);
}

export async function apiStartHead(id: number) {
  const res = await fetch(`${API_BASE}/heads/${id}/start`, {
    method: "POST",
    headers: headers(false),
  });
  return handleResponse(res);
}

export async function apiFinishHead(id: number) {
  const res = await fetch(`${API_BASE}/heads/${id}/finish`, {
    method: "POST",
    headers: headers(false),
  });
  return handleResponse(res);
}

export async function apiAddServiceNeed(id: number, serviceNeed: string) {
  const res = await fetch(`${API_BASE}/heads/${id}/add-service-need`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ serviceNeed }),
  });
  return handleResponse(res);
}

export async function apiRemoveServiceNeed(id: number, serviceNeed: string) {
  const res = await fetch(`${API_BASE}/heads/${id}/remove-service-need`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ serviceNeed }),
  });
  return handleResponse(res);
}

export async function apiCheckServiceNeed(id: number, serviceNeed: string) {
  const res = await fetch(`${API_BASE}/heads/${id}/check-service-need`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ serviceNeed }),
  });
  return handleResponse(res);
}

export async function apiGetServiceNeeds() {
  const res = await fetch(`${API_BASE}/heads/service-needs`, { headers: headers(false) });
  return handleResponse(res);
}

// ── History ─────────────────────────────────────────────────────
export async function apiGetAllHistory() {
  const res = await fetch(`${API_BASE}/history`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiGetHistoryByHead(headId: number) {
  const res = await fetch(`${API_BASE}/history/by-head/${headId}`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiGetHistoryByMechanic(mechanicId: string) {
  const res = await fetch(`${API_BASE}/history/by-mechanic/${mechanicId}`, { headers: headers(false) });
  return handleResponse(res);
}

export async function apiGetMyWorkHistory() {
  const res = await fetch(`${API_BASE}/history/my-work`, { headers: headers(false) });
  return handleResponse(res);
}

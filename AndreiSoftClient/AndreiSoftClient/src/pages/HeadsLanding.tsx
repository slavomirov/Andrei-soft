import { useEffect, useState } from "react";
import type { Head } from "../types/Head";
import { createHeadsHubConnection } from "../signalr/headsHub";

const apiBase = "https://localhost:5001/api"; // промени към твоя бекенд

export function HeadsLanding() {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(true);
  const [hubConnected, setHubConnected] = useState(false);

  // TODO: вземи токена от localStorage или твоя auth flow
  const token = localStorage.getItem("token") ?? "";

  // 1) Load initial data
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${apiBase}/heads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setHeads(data);
      setLoading(false);
    };

    load();
  }, []);

  // 2) SignalR live updates
  useEffect(() => {
    const connection = createHeadsHubConnection(token);

    connection.on("HeadAdded", (head: Head) => {
      setHeads(prev => [...prev, head]);
    });

    connection.on("HeadUpdated", (updated: Head) => {
      setHeads(prev => prev.map(h => (h.id === updated.id ? updated : h)));
    });

    connection.on("HeadDeleted", (id: number) => {
      setHeads(prev => prev.filter(h => h.id !== id));
    });

    const start = async () => {
      try {
        await connection.start();
        setHubConnected(true);
      } catch (err) {
        console.error("Hub error:", err);
        setTimeout(start, 3000);
      }
    };

    start();

    return () => {
      connection.stop();
    };
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Зареждане...</div>;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Heads</h1>
      <p style={{ color: hubConnected ? "green" : "gray" }}>
        Hub: {hubConnected ? "Свързан" : "Свързване..."}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Status</th>
            <th>Price</th>
            <th>Actions</th>
            <th>Worker</th>
          </tr>
        </thead>
        <tbody>
          {heads.map(h => (
            <tr key={h.id}>
              <td>{h.id}</td>
              <td>{h.description}</td>
              <td>{h.status}</td>
              <td>{h.price}</td>
              <td>{h.actions}</td>
              <td>{h.assignedWorkerId ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

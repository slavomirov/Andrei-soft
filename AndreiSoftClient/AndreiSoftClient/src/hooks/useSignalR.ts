import { useEffect, useRef, useState } from "react";
import type { HubConnection } from "@microsoft/signalr";
import { createHeadsHubConnection } from "../signalr/headsHub";
import { useAuth } from "../context/AuthContext";
import type { Head } from "../types/Head";

export function useSignalR(
  onHeadCreated?: (h: Head) => void,
  onHeadUpdated?: (h: Head) => void,
  onHeadDeleted?: (id: number) => void,
) {
  const { user } = useAuth();
  const connRef = useRef<HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const conn = createHeadsHubConnection(user.accessToken);
    connRef.current = conn;

    if (onHeadCreated) conn.on("HeadCreated", onHeadCreated);
    if (onHeadUpdated) conn.on("HeadUpdated", onHeadUpdated);
    conn.on("HeadAssignedToMechanic", (h: Head) => onHeadUpdated?.(h));
    conn.on("HeadStatusChanged", (h: Head) => onHeadUpdated?.(h));
    if (onHeadDeleted) conn.on("HeadDeleted", onHeadDeleted);

    const start = async () => {
      try {
        await conn.start();
        setConnected(true);
      } catch {
        setTimeout(start, 3000);
      }
    };

    start();

    return () => {
      conn.stop();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  return { connected };
}

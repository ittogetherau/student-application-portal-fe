"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const url = `ws://application.churchill.edu.au/api/v1/notifications/ws`;

export function useNotificationsWs() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const ws = new WebSocket(`${url}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("ws connected");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log(data);
    };

    ws.onerror = (e) => {
      console.error(e);
    };

    ws.onclose = () => {
      console.log("ws closed");
    };

    return () => {
      ws.close();
    };
  }, [token]);

  const send = (payload: unknown) => {
    wsRef.current?.send(JSON.stringify(payload));
  };

  return { send };
}

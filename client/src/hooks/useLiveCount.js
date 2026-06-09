import { useState, useEffect, useRef } from 'react';

const SESSION_KEY = '_va_live_sid';

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useLiveCount(apiBase) {
  const [count, setCount] = useState(0);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch(`${apiBase}/analytics/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sessionId.current }),
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.live || 0);
        }
      } catch {}
    };

    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, [apiBase]);

  return count;
}

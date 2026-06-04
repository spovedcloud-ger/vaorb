import { useState, useCallback, useRef } from 'react';

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm ABot, your VA Orbit assistant. Ask me about web design, development, pricing, or how we can help your business grow!",
};

export function useChat(apiBase) {
  const [messages, setMessages] = useState([WELCOME]);
  const [loading, setLoading] = useState(false);
  const msgsRef = useRef([WELCOME]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text.trim() };
    const updated = [...msgsRef.current, userMsg];
    msgsRef.current = updated;
    setMessages(updated);
    setLoading(true);

    try {
      const body = {
        messages: updated.filter((m) => m.role !== 'system').slice(-12),
      };

      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't process that. Please try again or use the contact form.";
      const next = [...msgsRef.current, { role: 'assistant', content: reply }];
      msgsRef.current = next;
      setMessages(next);
    } catch {
      const next = [
        ...msgsRef.current,
        { role: 'assistant', content: 'Connection error. Please try again or email accounts@thevaorbit.com.' },
      ];
      msgsRef.current = next;
      setMessages(next);
    } finally {
      setLoading(false);
    }
  }, [apiBase, loading]);

  const resetChat = useCallback(() => {
    msgsRef.current = [WELCOME];
    setMessages([WELCOME]);
    setLoading(false);
  }, []);

  return { messages, loading, sendMessage, resetChat };
}

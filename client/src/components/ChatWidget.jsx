import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

export default function ChatWidget({ apiBase }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, resetChat } = useChat(apiBase);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}

      <div className={`chat-widget ${open ? 'chat-open' : ''}`}>
        {open && (
          <div className="chat-window">
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar">AB</div>
                <div>
                  <div className="chat-header-name">ABot</div>
                  <div className="chat-header-status">Online</div>
                </div>
              </div>
              <div className="chat-header-actions">
                <button className="chat-header-btn" onClick={resetChat} title="New conversation">&#x21bb;</button>
                <button className="chat-header-btn chat-minimize-btn" onClick={() => setOpen(false)} title="Minimize">&minus;</button>
                <button className="chat-header-btn chat-close-btn" onClick={() => setOpen(false)} title="Close">&times;</button>
              </div>
            </div>

            <div className="chat-body">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
                  {msg.role === 'assistant' && <div className="chat-msg-avatar">AB</div>}
                  <div className="chat-msg-bubble">
                    <div className="chat-msg-text">{msg.content}</div>
                    <div className="chat-msg-time">{msg.role === 'user' ? 'You' : 'ABot'}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-msg chat-msg-bot">
                  <div className="chat-msg-avatar">AB</div>
                  <div className="chat-msg-bubble">
                    <div className="chat-typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-footer">
              <input
                ref={inputRef}
                className="chat-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button className="chat-send-btn" onClick={handleSend} disabled={loading || !input.trim()}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        )}

        <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle chat">
          {open ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/></svg>
          )}
        </button>
      </div>
    </>
  );
}

'use client';

import { FormEvent, useState } from 'react';

type Message = { role: 'user' | 'assistant'; text: string };

export function ChatClient() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const onSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/chat/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || 'Request failed');
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: payload.reply }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unable to send message';
      setMessages((prev) => [...prev, { role: 'assistant', text }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ marginTop: 0 }}>Chat</h1>
      <p style={{ color: '#9fb4df' }}>Ask anything and receive a response.</p>
      <div style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 12, minHeight: 280, marginBottom: 12 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#8ca2cc' }}>No messages yet. Send your first prompt.</p>
        ) : (
          messages.map((message, index) => (
            <p key={`${message.role}-${index}`} style={{ margin: '10px 0' }}>
              <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.text}
            </p>
          ))
        )}
      </div>
      <form onSubmit={onSend} style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your message..." style={{ flex: 1 }} />
        <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
      </form>
    </div>
  );
}

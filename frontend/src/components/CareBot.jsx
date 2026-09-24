import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Bot, X, Send, Star, Tag, ArrowRight } from 'lucide-react';

const STARTERS = ['How does CareConnect work?', 'My kitchen sink is leaking', 'Any discount coupons?', 'Track my latest booking'];

export default function CareBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi, I'm CareBot 👋 Describe a home problem and I'll estimate the cost and suggest the best pros." },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text: message }]);
    setBusy(true);
    try {
      const res = await API.post('/assistant/chat', { message });
      setMessages((m) => [...m, { from: 'bot', text: res.data.reply, data: res.data }]);
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: err.response?.data?.message || 'Sorry, I could not reach the server.' }]);
    } finally {
      setBusy(false);
    }
  };

  const Extras = ({ data }) => {
    if (!data) return null;
    return (
      <div className="mt-2 space-y-2">
        {data.providers?.length > 0 && data.providers.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
            <div>
              <div className="font-bold text-slate-900">{p.businessName || p.name}</div>
              <div className="text-slate-500 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-400" />{Number(p.rating).toFixed(1)} · ${p.hourlyRate}/hr</div>
            </div>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 font-bold text-brand-700">{p.matchScore}%</span>
          </div>
        ))}
        {data.coupons?.map((c) => (
          <div key={c.code} className="flex items-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs">
            <Tag className="w-4 h-4 text-amber-600" />
            <div><span className="font-extrabold text-amber-700">{c.code}</span> <span className="text-slate-600">{c.description}</span></div>
          </div>
        ))}
        {data.bookings?.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            <span className="font-bold text-slate-900">{b.status.replace('_', ' ')}</span> · {b.date} · {b.slot} · ${b.price}
          </div>
        ))}
        {data.action && (
          <Link to={data.action.to} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline">
            {data.action.label} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-96 h-[32rem] max-h-[75vh] card rounded-3xl flex flex-col overflow-hidden animate-pop">
          <div className="bg-teal-gradient px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot className="w-4 h-4" /></span>
              <div className="leading-tight">
                <div className="text-sm font-bold">CareBot</div>
                <div className="text-[11px] text-white/80">AI home-service assistant</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 rounded-lg hover:bg-white/15"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.from === 'user' ? 'bg-brand-600 text-white rounded-br-md' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'}`}>
                  {m.text}
                  {m.from === 'bot' && <Extras data={m.data} />}
                </div>
              </div>
            ))}
            {busy && <div className="text-xs text-slate-400 pl-1">CareBot is typing…</div>}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">{s}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your problem…" className="input !py-2.5" maxLength={500} />
            <button disabled={busy || !input.trim()} className="btn-primary !px-3 !py-2.5" aria-label="Send"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open CareBot assistant"
        className="fixed bottom-5 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full bg-teal-gradient text-white shadow-lift flex items-center justify-center hover:scale-105 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </>
  );
}

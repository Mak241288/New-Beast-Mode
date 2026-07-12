import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { translations } from '../utils/translations';

interface ConsultationProps {
  lang: 'ar' | 'en';
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onLanguageChange?: (lang: 'ar' | 'en') => void;
}

export const Consultation: React.FC<ConsultationProps> = ({ lang, onNavigate, onLogout, onLanguageChange }) => {
  const t = translations[lang] || translations.ar;
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      const history = await api.getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error('فشل تحميل محادثات الاستشارة:', err);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');

    // Optimistically add user message to UI
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'USER', text: userMsg, timestamp: new Date() }]);
    setLoading(true);

    try {
      const reply = await api.sendChatMessage({ text: userMsg });
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'AI',
          text: 'عذراً يا بني، واجهت مشكلة في الاتصال بالشبكة حالياً. يرجى إعادة إرسال رسالتك وسأجيبك فوراً.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderRadius: '0 0 20px 20px', borderTop: 'none', flexShrink: 0 }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          BEASTMODE
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => onNavigate('dashboard')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.workout}</button>
          <button onClick={() => onNavigate('nutrition')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.nutrition}</button>
          <button onClick={() => onNavigate('stats')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.stats}</button>
          <button onClick={() => onNavigate('chat')} className="glow-btn" style={{ padding: '8px 16px' }}>{t.consultation}</button>
          <button onClick={() => onNavigate('profile')} className="secondary-btn" style={{ padding: '8px 16px' }}>{t.profile}</button>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onLanguageChange && (
            <select
              value={lang}
              onChange={(e) => onLanguageChange(e.target.value as 'ar' | 'en')}
              className="input-field"
              style={{ width: 'fit-content', padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <option value="ar" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>🌐 ع</option>
              <option value="en" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>🌐 EN</option>
            </select>
          )}
          <ThemeToggle />
          <button onClick={onLogout} className="secondary-btn" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>{t.logout}</button>
        </div>
      </header>

      {/* Main chat window */}
      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 16px', overflow: 'hidden', height: 'calc(100vh - 180px)' }}>
        
        {/* Chat Intro Card */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '10px', borderRadius: '50%' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold' }}>مستشارك الرياضي: الكابتن د. صخر (خبرة 66 عاماً)</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>اسألني عن استبدال التمارين، تفادي الإصابات، تعديل الوجبات، أو أي استشارات طبية ورياضية.</p>
          </div>
        </div>

        {/* Chat Messages Log */}
        <div
          className="glass-panel"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', maxWidth: '380px' }}>
              <MessageSquare size={48} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px' }}>مرحباً بك يا بني!</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                بصفتي طبيب علاج طبيعي ومدرب أبطال لعقود طويلة، أنا هنا لأصيغ لك أفضل النصائح وأجيب على أي مخاوف برياضة وصحة جسدك. اسألني أي شيء!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isAI = msg.sender === 'AI';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isAI ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div
                  style={{
                    background: isAI ? 'var(--bg-card)' : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: isAI ? '1px solid var(--border-color)' : 'none',
                    color: '#ffffff',
                    padding: '12px 16px',
                    borderRadius: isAI ? '12px 12px 12px 0px' : '12px 12px 0px 12px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line',
                    boxShadow: isAI ? 'none' : '0 4px 10px var(--primary-glow)',
                  }}
                >
                  {msg.text}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    alignSelf: isAI ? 'flex-start' : 'flex-end',
                  }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '12px 16px',
                borderRadius: '12px 12px 12px 0px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }} />
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }} />
              <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input message form */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', marginTop: '16px', flexShrink: 0 }}>
          <input
            type="text"
            placeholder="اسأل الكابتن د. صخر عن بدائل التمارين، آلام العضلات، تغذية اليوم..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="input-field"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading} className="glow-btn" style={{ padding: '12px 18px' }}>
            <Send size={18} />
          </button>
        </form>
      </main>
    </div>
  );
};

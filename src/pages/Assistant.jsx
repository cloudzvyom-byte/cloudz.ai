import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getGroqResponse } from '../lib/ai';
import { 
  Send, Paperclip, Mic, Square, 
  Sparkles, Bot, User, Trash2,
  Copy, Check, MoreVertical, Activity,
  Zap, Command, Cpu
} from 'lucide-react';
import { useChatContext } from '../context/ChatContext';

/* ── Simple markdown-like text renderer ─────────────────────────── */
const MessageContent = ({ content, role }) => {
  const lines = content.split('\n');
  const elements = [];
  let inCode = false;
  let codeLines = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      } else {
        elements.push(
          <pre key={`code-${i}`} className="bg-[#0D0D0D] border border-[var(--border)] rounded-[16px] p-6 overflow-x-auto text-sm font-mono text-[var(--accent)] my-8 leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        inCode = false;
        codeLines = [];
      }
      return;
    }
    if (inCode) { codeLines.push(line); return; }

    if (line.startsWith('### '))
      elements.push(<h3 key={i} className="text-xl font-bold text-white mt-10 mb-5 tracking-tight">{line.slice(4)}</h3>);
    else if (line.startsWith('## '))
      elements.push(<h2 key={i} className="text-2xl font-bold text-white mt-12 mb-6 tracking-tight">{line.slice(3)}</h2>);
    else if (line.startsWith('# '))
      elements.push(<h1 key={i} className="text-3xl font-bold text-white mt-16 mb-8 tracking-tighter">{line.slice(2)}</h1>);
    else if (line.startsWith('- ') || line.startsWith('* '))
      elements.push(<li key={i} className="ml-5 mb-3 text-[17px] leading-[1.6] text-[var(--text-secondary)] list-disc decoration-[var(--accent)]">{renderInline(line.slice(2))}</li>);
    else if (line.trim() === '')
      elements.push(<div key={i} className="h-6" />);
    else
      elements.push(<p key={i} className={`mb-6 text-[17px] leading-[1.6] ${role === 'user' ? 'text-white font-medium' : 'text-[var(--text-secondary)]'}`}>{renderInline(line)}</p>);
  });

  return <div className="selection:bg-[var(--accent)] selection:text-[#0A0A0A] assistant-chat-text">{elements}</div>;
};

const renderInline = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-[var(--bg-input)] text-[var(--accent)] px-2 py-0.5 rounded-[6px] text-sm font-mono border border-[var(--border)]">{part.slice(1, -1)}</code>;
    return part;
  });
};

/* ── Typing indicator ────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="flex items-center gap-2 px-2 py-4">
    {[0, 1, 2].map(i => (
      <div key={i} className={`w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

/* ── WELCOME SCREEN ─────────────────────────────────────────────── */
const WelcomeScreen = ({ onSuggestion }) => {
  const suggestions = [
    { text: 'Help me write a high-conversion cold outreach email', icon: <Send size={16} />, color: 'text-purple-400' },
    { text: 'Summarize neural telemetry from my active agents', icon: <Activity size={16} />, color: 'text-cyan-400' },
    { text: 'Initialize a new sales script protocol for SaaS', icon: <Cpu size={16} />, color: 'text-orange-400' },
    { text: 'Diagnostics: Voice Agent installation workflow', icon: <Zap size={16} />, color: 'text-blue-400' },
  ];
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-6 text-center animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-[28px] flex items-center justify-center mb-10 shadow-2xl relative group">
        <Bot size={40} className="text-[var(--accent)] relative z-10" />
      </div>
      <h2 className="text-4xl font-medium mb-4 tracking-tight text-white">How can I assist your <span className="text-[var(--accent)]">Workflow</span>?</h2>
      <p className="text-[var(--text-secondary)] text-base mb-14 max-w-md leading-relaxed font-medium">
        Your Cloud Neural Assistant is online. I can manage campaigns, initialize scripts, and optimize agent protocols.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="flex items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] text-sm text-left hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all duration-300 group shadow-lg"
          >
            <div className={`w-10 h-10 rounded-[14px] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center flex-shrink-0 transition-transform ${s.color}`}>
              {s.icon}
            </div>
            <span className="text-[var(--text-secondary)] font-bold group-hover:text-white transition-colors leading-tight uppercase tracking-widest text-[10px]">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Assistant = () => {
  const {
    activeChat, activeChatId, createChat,
    isGenerating, setIsGenerating, updateChat
  } = useChatContext();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from('workspaces').select('*').eq('user_id', user.id).single();
          setWorkspace(data);
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (activeChat) setMessages(activeChat.messages || []);
    else setMessages([]);
  }, [activeChatId, activeChat]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleInput = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 240) + 'px'; }
  };

  const handleSend = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading) return;

    let chatId = activeChatId;
    if (!chatId) chatId = await createChat(null, text.slice(0, 48));

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setLoading(true);
    setIsGenerating(true);

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));
      const aiContent = await getGroqResponse(history, workspace);
      const aiMsg = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      await updateChat(chatId, finalMessages);
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: `⚠️ Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...newMessages, errMsg]);
    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  }, [activeChatId, input, loading, messages, workspace, createChat, setIsGenerating, updateChat]);

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e) => setInput(prev => prev + e.results[0][0].transcript);
    isListening ? recognition.stop() : recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-app)] relative selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-10 py-20 scroll-smooth relative z-10 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestion={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-20">
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700`}
              >
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-[var(--bg-card)] border border-[var(--border)] text-white' : 'bg-[var(--accent-tint)] border border-[var(--accent)]/30 text-[var(--accent)]'}`}>
                  {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{m.role === 'user' ? 'You' : 'Cloud AI'}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{m.timestamp}</span>
                  </div>
                  <div className="min-w-0">
                    <MessageContent content={m.content} role={m.role} />
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-10 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-[12px] bg-[var(--accent-tint)] border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Operon AI is thinking</span>
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-10 pb-12 flex-shrink-0 relative z-20">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] shadow-2xl focus-within:border-[var(--accent)] transition-all duration-500 overflow-hidden">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message Cloud..."
              className="w-full bg-transparent border-none outline-none resize-none px-8 py-6 text-[16px] max-h-[240px] min-h-[80px] leading-relaxed placeholder-[var(--text-muted)] text-white font-medium"
            />
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-1">
                <button className="p-3 text-[var(--text-muted)] hover:text-white transition-all">
                  <Paperclip size={18} />
                </button>
                <button 
                  onClick={handleMic}
                  className={`p-3 transition-all ${isListening ? 'text-[var(--error)] animate-pulse' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                  {isListening ? <Square size={18} /> : <Mic size={18} />}
                </button>
              </div>
              <div className="flex items-center gap-6">
                <span className="hidden sm:block text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-40">Pro v2.4.0</span>
                <button 
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className={`p-3 rounded-[12px] transition-all ${input.trim() && !loading ? 'bg-white text-black hover:bg-gray-200' : 'bg-transparent text-[var(--text-muted)] opacity-30 cursor-not-allowed'}`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Assistant;

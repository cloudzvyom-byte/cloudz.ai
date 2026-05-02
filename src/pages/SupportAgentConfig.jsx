import React, { useState, useEffect, useCallback } from 'react';
import { Headset, Phone, Upload, Settings, Check, FileText, Clock, MessageSquare, Save, Loader2, PhoneCall, PhoneOff, ChevronDown, ChevronUp, RefreshCw, User, Calendar, TrendingUp, X } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { getVapiAssistant, updateVapiAssistant, getVapiCallsByAssistant, triggerSupportCall } from '../lib/vapi';
import { supabase } from '../lib/supabase';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI)' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' }
];
const fmt = (s) => {
  if (!s) return '--';
  const d = new Date(s);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const dur = (start, end) => {
  if (!start || !end) return '--';
  const s = Math.floor((new Date(end) - new Date(start)) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s/60)}m ${s%60}s`;
};
const outcome = (call) => {
  const t = (call.analysis?.summary || call.transcript || '').toLowerCase();
  if (t.includes('book') || t.includes('appointment') || t.includes('meeting') || t.includes('schedule') || t.includes('yes')) return 'booked';
  if (t.includes('not interested') || t.includes('no thank') || t.includes('callback')) return 'callback';
  if (call.status === 'ended') return 'completed';
  return call.status || 'unknown';
};
const OutcomeBadge = ({ call }) => {
  const o = outcome(call);
  const map = { booked: 'bg-green-500/15 text-green-400 border-green-500/20', callback: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', completed: 'bg-blue-500/15 text-blue-400 border-blue-500/20' };
  const cls = map[o] || 'bg-white/5 text-[var(--text-muted)] border-white/10';
  return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${cls}`}>{o}</span>;
};

const SupportAgentConfig = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [agentLive, setAgentLive] = useState(null); // null=loading, true=live, false=offline
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [selectedCall, setSelectedCall] = useState(null);
  const [userAssistantId, setUserAssistantId] = useState(null);
  const [assignedNumber, setAssignedNumber] = useState(null);
  const [phoneNumberId, setPhoneNumberId] = useState(null);
  const [testPhone, setTestPhone] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [config, setConfig] = useState({
    name: 'Support Agent',
    firstMessage: 'Hi there! Thanks for calling. How can I help you today?',
    prompt: 'You are a helpful customer support agent. Be polite, concise, and empathetic.',
    forwardingNumber: '',
    handoffEnabled: false,
    businessHoursEnabled: false,
    voice: 'jennifer-playht',
    model: 'gpt-4o',
    manualKnowledge: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('vapi_assistant_id').eq('id', user.id).single();
        const assistantId = profile?.vapi_assistant_id || user.user_metadata?.vapi_assistant_id;
        setUserAssistantId(assistantId);
        if (assistantId) {
          const data = await getVapiAssistant(assistantId);
          if (data) {
            setConfig(prev => ({ 
              ...prev, 
              name: data.name || prev.name, 
              voice: data.voice?.provider === 'playht' ? `${data.voice.voiceId}-playht` : prev.voice,
              prompt: data.model?.messages?.[0]?.content || prev.prompt,
              model: data.model?.model || prev.model,
              firstMessage: data.firstMessage || prev.firstMessage
            }));
            
            const numberObj = data.phoneNumbers?.[0] || (data.phoneNumberId ? { number: 'Linked', id: data.phoneNumberId } : null);
            setAssignedNumber(numberObj?.number || null);
            setPhoneNumberId(data.phoneNumberId || numberObj?.id || null);
            setAgentLive(!!numberObj);
          } else { setAgentLive(false); }
        } else { setAgentLive(false); }
      } catch (err) { console.error(err); setAgentLive(false); } finally { setFetching(false); }
    };
    fetchConfig();
  }, []);

  const fetchCalls = useCallback(async () => {
    if (!userAssistantId) return;
    setCallsLoading(true);
    try {
      const data = await getVapiCallsByAssistant(userAssistantId);
      setCalls(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); } finally { setCallsLoading(false); }
  }, [userAssistantId]);

  useEffect(() => { if (activeTab === 'logs' && userAssistantId) fetchCalls(); }, [activeTab, userAssistantId, fetchCalls]);

  const handleSave = async () => {
    let assistantId = userAssistantId;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const assistantData = { 
        name: config.name, 
        firstMessage: config.firstMessage, 
        model: {
          provider: config.model.includes('claude') ? 'anthropic' : 'openai',
          model: config.model,
          messages: [{ role: 'system', content: config.prompt }]
        }
      };

      if (!assistantId) {
        const { createVapiAssistant } = await import('../lib/vapi');
        const va = await createVapiAssistant(assistantData);
        assistantId = va.id;
        setUserAssistantId(assistantId);
        await supabase.from('profiles').upsert({ id: user.id, vapi_assistant_id: assistantId });
        await supabase.auth.updateUser({ data: { vapi_assistant_id: assistantId } });
      } else {
        await updateVapiAssistant(assistantData, assistantId);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { alert('Failed to save: ' + err.message); } finally { setLoading(false); }
  };

  const handleTestCall = async () => {
    if (!userAssistantId) return alert('Please deploy first.');
    if (!testPhone) return alert('Please enter your phone number.');
    if (!phoneNumberId) return alert('Error: No active VAPI phone number found! Please assign a phone number to your assistant in the VAPI dashboard first.');
    setIsCalling(true);
    try {
      await triggerSupportCall(testPhone, 'Developer Test', userAssistantId, phoneNumberId);
      alert(`Calling ${testPhone}... Pick up to talk to your agent!`);
    } catch (err) {
      alert('Test Call Error: ' + err.message);
    } finally {
      setIsCalling(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userAssistantId) { alert('Please deploy first.'); return; }
    setUploading(true);
    try {
      const { uploadVapiFile, updateVapiAssistant: uva, getVapiAssistant: gva } = await import('../lib/vapi');
      const vf = await uploadVapiFile(file);
      const cur = await gva(userAssistantId);
      const existing = cur.model?.knowledgeBase?.fileIds || [];
      await uva({ model: { knowledgeBase: { provider: 'canonical', fileIds: [...existing, vf.id] } } }, userAssistantId);
      alert(`"${file.name}" synced to knowledge base!`);
    } catch (err) { alert('Upload error: ' + err.message); } finally { setUploading(false); }
  };

  const TABS = [
    { id: 'identity', label: 'Identity & Voice', icon: <User size={16} /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database size={16} /> },
    { id: 'routing', label: 'Call Routing', icon: <Phone size={16} /> },
    { id: 'logs', label: 'Call Logs', icon: <Activity size={16} /> },
    { id: 'advanced', label: 'Advanced', icon: <Settings size={16} /> },
  ];

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-10 h-full overflow-y-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/30 rounded-full mb-4">
            <Headset size={14} className="text-[var(--accent)]" />
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Inbound Architecture</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-[var(--text-primary)] mb-3">Customer Support <span className="text-[var(--accent)]">Agent</span>.</h1>
          <div className="flex items-center gap-3">
            {agentLive === null ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Checking Status...</span>
              </div>
            ) : agentLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
                  {assignedNumber && assignedNumber !== 'Linked' ? `Live — ${assignedNumber}` : 'Agent Live — Calls Active'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--warning)]">No Phone Number — Assign in VAPI Dashboard</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} className="px-8 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[16px] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all shadow-xl flex items-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {loading ? 'Compiling...' : saved ? 'Deployed' : 'Deploy'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-[16px] text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)] shadow-lg' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 min-h-[500px]">

            {activeTab === 'identity' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2"><MessageSquare className="text-[var(--accent)]" /> Identity & System Prompt</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Agent Identity Name</label>
                    <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1">Neural Engine (Model)</label>
                    <select 
                      value={config.model} 
                      onChange={e => setConfig({...config, model: e.target.value})}
                      className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all appearance-none cursor-pointer"
                    >
                      {MODELS.map(m => (
                        <option key={m.id} value={m.id} className="bg-[var(--bg-card)]">{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">First Message Greeting</label>
                  <input type="text" value={config.firstMessage} onChange={e => setConfig({...config, firstMessage: e.target.value})} className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">System Prompt & Personality</label>
                  <textarea rows={8} value={config.prompt} onChange={e => setConfig({...config, prompt: e.target.value})} placeholder="Define how your agent should behave, its tone of voice, and its primary mission..." className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] p-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all resize-none leading-relaxed placeholder:opacity-30" />
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2"><FileText className="text-[var(--accent)]" /> Neural Context Engine</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Feed your agent PDFs, text, or manual instructions to enhance its accuracy.</p>
                <div className="relative bg-[var(--bg-input)] border border-[var(--border)] rounded-[24px] overflow-hidden focus-within:border-[var(--accent)] transition-all">
                  <textarea rows={10} value={config.manualKnowledge || ''} onChange={e => setConfig({...config, manualKnowledge: e.target.value})} placeholder="Type or paste business rules, FAQs, or knowledge here..." className="w-full bg-transparent p-8 text-[var(--text-primary)] text-sm outline-none resize-none leading-relaxed placeholder:opacity-30" />
                  <div className="px-8 pb-6 flex items-center justify-between">
                    <label className={`relative z-10 flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all cursor-pointer`}>
                      <Upload size={14} className="text-[var(--accent)]" />
                      {uploading ? 'Uploading...' : 'Attach File (.pdf, .txt, .csv)'}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.txt,.csv" />
                    </label>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all">Sync Context</button>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTING TAB */}
            {activeTab === 'routing' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2"><Phone className="text-[var(--accent)]" /> Call Routing & Provisioning</h3>
                
                {/* Browser Testing Section */}
                <div className="p-8 bg-[var(--bg-input)] border border-[var(--accent)]/10 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-[var(--text-primary)] mb-1">Developer Sandbox</h4>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-60">Test agent logic via browser (uses device mic)</p>
                  </div>
                  <button onClick={async () => {
                    if (!userAssistantId) { alert('Please Deploy first.'); return; }
                    try {
                      const VapiConstructor = Vapi.default || Vapi;
                      const vapi = new VapiConstructor(import.meta.env.VITE_VAPI_PUBLIC_KEY || '');
                      await vapi.start(userAssistantId);
                    } catch (err) { alert('Web Call Error: ' + err.message); }
                  }} className="px-8 py-3 bg-white/5 text-[var(--text-primary)] border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl hover-pop active:scale-95">
                    Start Neural Session (Browser)
                  </button>
                </div>

                {/* Mobile Testing Section */}
                <div className="p-8 bg-[var(--bg-input)] border border-[var(--accent)]/10 rounded-[24px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-[var(--text-primary)] mb-1">Mobile Testing</h4>
                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-60">Send a test call to your actual phone</p>
                    <div className="mt-4 flex gap-3 max-w-md">
                      <input 
                        type="text" 
                        placeholder="Your Phone (e.g. +91...)" 
                        value={testPhone} 
                        onChange={e => setTestPhone(e.target.value)}
                        className="flex-1 h-11 bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] px-4 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleTestCall} 
                    disabled={isCalling}
                    className="px-8 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-all shadow-xl hover-pop active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCalling ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
                    {isCalling ? 'Connecting...' : 'Call My Phone'}
                  </button>
                </div>

                {assignedNumber && assignedNumber !== 'Linked' && (
                  <div className="p-6 bg-[var(--accent-tint)] border border-[var(--accent)]/20 rounded-[24px] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">Active Inbound Number</p>
                      <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{assignedNumber}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] border border-white/10">
                      Primary Line
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-[var(--bg-input)] rounded-[20px] border border-[var(--border)]">
                    <div>
                      <h4 className="text-white font-medium mb-1">Human Handoff (Call Forwarding)</h4>
                      <p className="text-[var(--text-muted)] text-sm">Transfer to a human agent when requested.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={config.handoffEnabled} onChange={() => setConfig({...config, handoffEnabled: !config.handoffEnabled})} />
                      <div className="w-12 h-6 bg-[#1A1A1A] border border-[var(--border)] rounded-full peer peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </div>
                  {config.handoffEnabled && (
                    <input type="text" placeholder="Forwarding Number (e.g. +91 98765 43210)" value={config.forwardingNumber} onChange={e => setConfig({...config, forwardingNumber: e.target.value})} className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-6 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all animate-in slide-in-from-top-2 duration-300" />
                  )}
                </div>
              </div>
            )}

            {/* CALL LOGS TAB */}
            {activeTab === 'calllogs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2"><PhoneCall className="text-[var(--accent)]" /> Call Logs</h3>
                  <button onClick={fetchCalls} disabled={callsLoading} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition-all">
                    <RefreshCw size={12} className={callsLoading ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>

                {/* STATS ROW */}
                {calls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Calls', value: calls.length, icon: PhoneCall },
                      { label: 'Meetings Booked', value: calls.filter(c => outcome(c) === 'booked').length, icon: Calendar },
                      { label: 'Avg Duration', value: (() => { const valid = calls.filter(c => c.startedAt && c.endedAt); if (!valid.length) return '--'; const avg = valid.reduce((acc, c) => acc + (new Date(c.endedAt) - new Date(c.startedAt)), 0) / valid.length / 1000; return avg < 60 ? `${Math.floor(avg)}s` : `${Math.floor(avg/60)}m`; })(), icon: Clock }
                    ].map(s => (
                      <div key={s.label} className="p-4 bg-[var(--bg-input)] border border-[var(--border)] rounded-[20px] text-center">
                        <s.icon size={18} className="text-[var(--accent)] mx-auto mb-2" />
                        <div className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {callsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Loader2 size={28} className="animate-spin text-[var(--accent)] mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Fetching call records...</p>
                  </div>
                ) : calls.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <PhoneOff size={36} className="mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)]">No calls yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">Calls will appear here once your agent starts receiving them.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {calls.map(call => (
                      <div key={call.id} className="group bg-[var(--bg-input)] border border-[var(--border)] rounded-[20px] overflow-hidden hover:border-[var(--accent)]/50 transition-all cursor-pointer" onClick={() => setSelectedCall(selectedCall?.id === call.id ? null : call)}>
                        <div className="flex items-center justify-between px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center">
                              <User size={16} className="text-[var(--text-muted)]" />
                            </div>
                            <div>
                              <p className="text-[var(--text-primary)] font-semibold text-sm">{call.customer?.number || call.customer?.name || 'Unknown Caller'}</p>
                              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-0.5">{fmt(call.createdAt || call.startedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[var(--text-muted)] text-xs font-medium">{dur(call.startedAt, call.endedAt)}</span>
                            <OutcomeBadge call={call} />
                            {selectedCall?.id === call.id ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                          </div>
                        </div>

                        {/* TRANSCRIPT PANEL */}
                        {selectedCall?.id === call.id && (
                          <div className="border-t border-[var(--border)] px-6 py-5 space-y-4 animate-in slide-in-from-top-2 duration-300" onClick={e => e.stopPropagation()}>
                            {call.analysis?.summary && (
                              <div className="p-4 bg-[var(--bg-card)] rounded-[14px] border border-[var(--border)]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mb-2">AI Summary</p>
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{call.analysis.summary}</p>
                              </div>
                            )}
                            {call.transcript ? (
                              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Full Transcript</p>
                                {call.transcript.split('\n').filter(Boolean).map((line, i) => {
                                  const isAgent = line.toLowerCase().startsWith('assistant') || line.toLowerCase().startsWith('ai') || line.toLowerCase().startsWith('agent');
                                  return (
                                    <div key={i} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                                      <div className={`max-w-[80%] px-4 py-2.5 rounded-[14px] text-sm leading-relaxed ${isAgent ? 'bg-[var(--accent-tint)] text-[var(--accent)] border border-[var(--accent)]/20' : 'bg-white/10 text-[var(--text-primary)]'}`}>
                                        {line.replace(/^(assistant|ai|agent|user|customer):\s*/i, '')}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-[var(--text-muted)] italic text-center py-4">No transcript available for this call.</p>
                            )}
                            {call.recordingUrl && (
                              <div className="pt-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Recording</p>
                                <audio controls src={call.recordingUrl} className="w-full h-10 rounded-full" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2"><Settings className="text-[var(--accent)]" /> Advanced Settings</h3>
                <div className="p-6 bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-[20px]">
                  <h4 className="text-[var(--error)] font-bold uppercase tracking-widest text-xs mb-2">Danger Zone</h4>
                  <p className="text-[var(--text-muted)] text-sm mb-6">Deactivating this agent will permanently disconnect the inbound number and delete its knowledge base vectors.</p>
                  <button className="px-6 py-3 bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20 rounded-[12px] text-xs font-bold uppercase tracking-widest hover:bg-[var(--error)] hover:text-white transition-all">Deactivate Agent</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAgentConfig;

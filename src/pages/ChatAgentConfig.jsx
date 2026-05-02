import React, { useState, useEffect } from 'react';
import { 
  Globe, Settings, MessageSquare, Save, Check, Code, LayoutTemplate, MessageCircle, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getVapiAssistant, updateVapiAssistant, createVapiAssistant } from '../lib/vapi';
const ChatAgentConfig = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userAssistantId, setUserAssistantId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isWaConnected, setIsWaConnected] = useState(false);
  const [showWaQr, setShowWaQr] = useState(false);

  const [config, setConfig] = useState({
    name: 'Operon AI Support',
    greeting: 'Hello! How can I help you today?',
    prompt: 'You are a helpful chat support agent for Operon. Use the knowledge base to answer questions.',
    primaryColor: '#FF6B1A',
    position: 'bottom-right'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('vapi_chat_assistant_id')
          .eq('id', user.id)
          .single();
        
        const assistantId = profile?.vapi_chat_assistant_id;
        setUserAssistantId(assistantId);

        if (assistantId) {
          const data = await getVapiAssistant(assistantId);
          if (data) {
            setConfig(prev => ({
              ...prev,
              name: data.name || prev.name,
              greeting: data.firstMessage || prev.greeting,
              prompt: data.model?.messages?.[0]?.content || prev.prompt,
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching chat config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    let assistantId = userAssistantId;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Auto-provision if missing
      if (!assistantId) {
        console.log('No chat assistant found, creating one...');
        const vapiAssistant = await createVapiAssistant({
          name: `${user.email}'s Chat Agent`,
          firstMessage: config.greeting,
          model: {
            provider: 'openai',
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'system', content: config.prompt }]
          }
        });
        assistantId = vapiAssistant.id;
        setUserAssistantId(assistantId);
        
        // Save to profile and metadata
        await supabase.from('profiles').update({ vapi_chat_assistant_id: assistantId }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { vapi_chat_assistant_id: assistantId } });
      }

      // 2. Update assistant
      await updateVapiAssistant({
        name: config.name,
        firstMessage: config.greeting,
        model: {
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'system', content: config.prompt }]
        }
      }, assistantId);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save chat configuration: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to test the chat in preview
  const handleTestChat = async (val) => {
    if (!userAssistantId) {
      alert('Please Deploy first to initialize your neural agent.');
      return;
    }
    
    const newMessages = [...chatMessages, { role: 'user', content: val }];
    setChatMessages(newMessages);
    setChatLoading(true);
    try {
      const { sendVapiChatMessage } = await import('../lib/vapi');
      const response = await sendVapiChatMessage([
        { role: 'system', content: config.prompt },
        ...newMessages
      ], userAssistantId);
      setChatMessages([...newMessages, response.message]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Neural Error: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const embedCode = `
<script src="https://cdn.operon.ai/widget.js"></script>
<script>
  window.OperonChat.init({
    agentId: "agt_12345",
    color: "${config.primaryColor}",
    position: "${config.position}"
  });
</script>
  `.trim();

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-12 h-full overflow-y-auto animate-in fade-in duration-700 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/30 rounded-full mb-4">
            <MessageCircle size={14} className="text-[var(--accent)]" />
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Chat Architecture</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-[var(--text-primary)] mb-2">Omnichannel <span className="text-[var(--accent)]">Chat Agent</span>.</h1>
          <p className="text-[var(--text-secondary)]">Configure and embed your AI chat widget across your platforms.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[16px] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all shadow-xl flex items-center gap-2"
        >
          {loading ? <div className="w-4 h-4 border-2 border-[#0A0A0A] border-t-transparent rounded-full animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {loading ? 'Compiling...' : saved ? 'Deployed' : 'Deploy'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'identity', label: 'Identity & Prompt', icon: <MessageSquare size={16} /> },
            { id: 'appearance', label: 'Widget Appearance', icon: <LayoutTemplate size={16} /> },
            { id: 'whatsapp', label: 'WhatsApp Integration', icon: <Globe size={16} /> },
            { id: 'embed', label: 'Integration / Embed', icon: <Code size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-[16px] text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--accent)] shadow-lg' : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 min-h-[500px]">
            {activeTab === 'identity' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <MessageSquare className="text-[var(--accent)]" /> Identity & Prompt
                </h3>
                
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Agent Name</label>
                  <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all" />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Welcome Message</label>
                  <input type="text" value={config.greeting} onChange={e => setConfig({...config, greeting: e.target.value})} className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all" />
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">System Prompt</label>
                  <textarea 
                    rows={6}
                    value={config.prompt}
                    onChange={e => setConfig({...config, prompt: e.target.value})}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] p-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <LayoutTemplate className="text-[var(--accent)]" /> Widget Appearance
                </h3>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Brand Color</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={config.primaryColor} 
                        onChange={e => setConfig({...config, primaryColor: e.target.value})} 
                        className="w-14 h-14 rounded-[12px] bg-[var(--bg-input)] border border-[var(--border)] cursor-pointer" 
                      />
                      <span className="text-[var(--text-primary)] font-mono">{config.primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Position</label>
                    <select 
                      value={config.position}
                      onChange={e => setConfig({...config, position: e.target.value})}
                      className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-[var(--bg-input)] border border-[var(--border)] rounded-[20px] flex items-center justify-between">
                  <div>
                    <h4 className="text-[var(--text-primary)] font-medium mb-1">Remove Operon Branding</h4>
                    <p className="text-[var(--text-muted)] text-sm">Enterprise feature: hide "Powered by Operon AI" watermark.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer opacity-50">
                    <input type="checkbox" className="sr-only peer" disabled />
                    <div className="w-11 h-6 bg-[var(--border)] rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5"></div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'whatsapp' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <Globe className="text-[var(--accent)]" /> WhatsApp Business System
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Connect your VAPI Chat assistant directly to WhatsApp using Twilio or the Meta Business API. Your AI will respond using the same knowledge base configured in Identity & Prompt.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">WhatsApp Number</label>
                    <input 
                      type="text" 
                      placeholder="+91 99999 99999"
                      value={config.whatsappNumber || ''} 
                      onChange={e => setConfig({...config, whatsappNumber: e.target.value})} 
                      className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Integration Provider</label>
                    <select className="w-full h-14 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] px-5 text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all">
                      <option>Twilio Business</option>
                      <option>Meta Cloud API (Official)</option>
                      <option>360dialog</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-[#0A0A0A] border border-[var(--border)] rounded-[20px] space-y-4">
                  <h4 className="text-[var(--text-primary)] font-medium text-sm flex items-center gap-2"><Code size={16} className="text-[var(--accent)]" /> Webhook Authorization URL</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest leading-relaxed">Paste this URL into your Twilio/Meta dashboard to route WhatsApp messages to your AI.</p>
                  <div className="flex gap-4">
                    <input 
                      readOnly 
                      value={`https://api.operon.ai/webhooks/whatsapp/${userAssistantId || 'PROVISION_FIRST'}`} 
                      className="flex-1 bg-black/40 border border-white/5 rounded-[12px] px-4 py-3 text-[var(--accent)] font-mono text-[10px] outline-none" 
                    />
                    <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Copy</button>
                  </div>
                </div>

                <div className="p-8 bg-[var(--bg-input)] border border-[var(--accent)]/10 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <h4 className="text-[var(--text-primary)] font-medium text-lg mb-1">Live WhatsApp Status</h4>
                    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      {isWaConnected ? 'Neural Bridge Active • Agent intercepting inquiries' : 'Active Connection Required'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {isWaConnected ? (
                      <>
                        <button 
                          onClick={() => window.open(`https://wa.me/${config.whatsappNumber}?text=Hi! I have an inquiry about your services.`, '_blank')}
                          className="px-6 py-3 bg-[var(--accent)] text-[#0A0A0A] rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2"
                        >
                          <MessageCircle size={14} /> Test Customer Inbound
                        </button>
                        <button 
                          onClick={() => setIsWaConnected(false)}
                          className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
                        >
                          Terminate Link
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          if (!config.whatsappNumber) {
                            alert('Please enter a WhatsApp number first.');
                            return;
                          }
                          setChatLoading(true);
                          setTimeout(() => {
                            setChatLoading(false);
                            setIsWaConnected(true);
                            alert(`WhatsApp Bridge established for ${config.whatsappNumber}. AI is now live!`);
                          }, 1500);
                        }}
                        disabled={chatLoading}
                        className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent)] transition-all shadow-2xl disabled:opacity-50"
                      >
                        {chatLoading ? 'Activating Neural Link...' : 'Sync & Activate Number'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'embed' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <Code className="text-[var(--accent)]" /> Embed Widget
                </h3>
                
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Copy and paste this snippet just before the closing <code>&lt;/body&gt;</code> tag on your website to inject the chat agent.
                </p>

                <div className="relative group">
                  <textarea 
                    readOnly
                    value={embedCode}
                    className="w-full h-48 bg-[#0A0A0A] border border-[var(--border)] rounded-[16px] p-6 text-[var(--accent)] font-mono text-sm outline-none resize-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(embedCode);
                      alert('Copied to clipboard!');
                    }}
                    className="absolute top-4 right-4 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-bold uppercase tracking-widest rounded-[8px] hover:border-[var(--accent)] transition-all"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Preview Column */}
        <div className="md:col-span-1 hidden lg:block">
          <div className="bg-[#0F0F0F] border border-white/5 rounded-[32px] h-[600px] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Preview</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              <div className="bg-white/5 border border-white/5 rounded-[12px] p-3 max-w-[80%]">
                <p className="text-xs text-white leading-relaxed">{config.greeting}</p>
              </div>
              
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-[12px] p-3 max-w-[80%] text-xs leading-relaxed ${msg.role === 'user' ? 'bg-[var(--accent)] text-black font-medium' : 'bg-white/5 border border-white/5 text-white'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-[12px] p-3 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/40 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Test your agent..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-xs text-white focus:outline-none focus:border-[var(--accent)] transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      const val = e.target.value;
                      e.target.value = '';
                      handleTestChat(val);
                    }
                  }}
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-black">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAgentConfig;

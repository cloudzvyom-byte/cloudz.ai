import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageSquare, Headset, Mail, 
  Check, ShieldCheck, X, Zap,
  Star, Cpu, Activity,
  Globe, Sparkles, TrendingUp, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createVapiAssistant } from '../lib/vapi';

const AGENTS = [
  {
    id: 'voice-support',
    name: 'Customer Voice Support Agent',
    price: '₹11,000',
    priceNum: 11000,
    description: 'High-fidelity AI receptionist with < 200ms latency. Handles appointments and lead qualification in 14+ languages.',
    icon: Phone,
    ramp: 'purple',
    comingSoon: false,
    includes: ['Bilingual Latency Optimization', 'Recursive Memory System', 'CRM Auto-Synchronization']
  },
  {
    id: 'chat-support',
    name: 'Customer Chat Support Agent',
    price: '₹4,999',
    priceNum: 4999,
    description: 'Instant web & app support agent. Learns from your entire knowledge base to provide expert-level technical support.',
    icon: MessageSquare,
    ramp: 'teal',
    comingSoon: true,
    includes: ['Real-time Doc Learning', 'Multi-Platform Handover', 'Sentiment-Based Routing']
  },
  {
    id: 'sales-dialer',
    name: 'Sales Dialer Agent',
    price: '₹11,999',
    priceNum: 11999,
    description: 'Autonomous outbound dialing engine. Scales your sales reach with parallel calling and automated objection handling.',
    icon: Headset,
    ramp: 'coral',
    comingSoon: true,
    includes: ['Parallel Line Scaling', 'DNC Compliance Shield', 'Automated Dispositioning']
  },
  {
    id: 'email-outreach',
    name: 'AI Outreach Agent',
    price: '₹5,999',
    priceNum: 5999,
    description: 'Hyper-personalized email outreach. Researches every prospect using real-time social data to maximize conversion.',
    icon: Mail,
    ramp: 'blue',
    comingSoon: true,
    includes: ['Prospect Data Scraping', 'Deliverability Monitoring', 'Infinite Follow-up Loops']
  }
];

const Marketplace = () => {
  const navigate = useNavigate();
  const [provisionedAgents, setProvisionedAgents] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setProvisionedAgents(user?.user_metadata?.provisioned_agents || []);
    };
    fetchUser();
  }, []);

  return (
    <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="mb-20 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/20 rounded-full">
          <Cpu size={12} className="text-[var(--accent)]" />
          <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Neural Marketplace v4.0</span>
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-white">Provision <span className="text-[var(--accent)]">Intelligence</span>.</h1>
        <p className="text-[var(--text-secondary)] text-base max-w-2xl leading-relaxed font-medium">
          Select from our tier-1 pre-trained AI agents to automate complex business workflows and outbound operations.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {AGENTS.map((agent) => (
          <div 
            key={agent.id}
            className={`group bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-8 flex flex-col hover:border-[var(--accent)] transition-all duration-300 relative overflow-hidden ${agent.comingSoon ? 'opacity-90' : ''}`}
          >
            {/* Subtle background glow based on ramp */}
            <div className="absolute -right-20 -top-20 w-48 h-48 opacity-[0.02] rounded-full blur-[60px]" style={{ backgroundColor: `var(--ramp-${agent.ramp}-text)` }} />
            
            {agent.comingSoon && (
              <div className="absolute top-6 left-6 z-20">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white backdrop-blur-md">
                  In Development
                </span>
              </div>
            )}

            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-14 h-14 rounded-[14px] flex items-center justify-center bg-[var(--bg-input)] border border-[var(--border)]" style={{ color: `var(--ramp-${agent.ramp}-text)` }}>
                <agent.icon size={28} />
              </div>
              <div className="text-right">
                <span className="block text-2xl font-medium text-white tracking-tight">{agent.comingSoon ? '---' : 'FREE'}</span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{agent.comingSoon ? 'TBA' : 'Testing Mode'}</span>
              </div>
            </div>
            
            <div className="flex-1 relative z-10 mb-8">
              <h3 className="text-xl font-medium mb-3 text-white group-hover:text-[var(--accent)] transition-colors tracking-tight">{agent.name}</h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 font-medium opacity-80">
                {agent.description}
              </p>
              
              <div className="space-y-3">
                {agent.includes.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `var(--ramp-${agent.ramp}-text)` }} />
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest opacity-60">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {agent.comingSoon ? (
              <div className="w-full py-4 rounded-[12px] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center justify-center gap-3 cursor-not-allowed">
                Coming Soon <Sparkles size={14} className="opacity-50" />
              </div>
            ) : (
              <button 
                onClick={async () => {
                  try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) throw new Error('User not authenticated');

                    const provisioned = user?.user_metadata?.provisioned_agents || [];
                    
                    if (!provisioned.includes(agent.id)) {
                      let vapiId = null;
                      
                      // Handle Voice Support
                      if (agent.id === 'voice-support') {
                        const vapiAssistant = await createVapiAssistant({
                          name: `${user.email}'s Voice Agent`,
                          firstMessage: 'Hi! How can I help you today?',
                          model: {
                            provider: 'openai',
                            model: 'gpt-4-turbo-preview',
                            messages: [{ role: 'system', content: 'You are a helpful voice support assistant.' }]
                          }
                        });
                        vapiId = vapiAssistant.id;
                        await supabase.from('profiles').update({ vapi_assistant_id: vapiId }).eq('id', user.id);
                      }

                      // Handle Chat Support
                      if (agent.id === 'chat-support') {
                        const vapiAssistant = await createVapiAssistant({
                          name: `${user.email}'s Chat Agent`,
                          firstMessage: 'Hello! I am your AI chat assistant. How can I help?',
                          model: {
                            provider: 'openai',
                            model: 'gpt-4-turbo-preview',
                            messages: [{ role: 'system', content: 'You are a helpful chat support assistant.' }]
                          }
                        });
                        vapiId = vapiAssistant.id;
                        await supabase.from('profiles').update({ vapi_chat_assistant_id: vapiId }).eq('id', user.id);
                      }

                      const { error } = await supabase.auth.updateUser({
                        data: { 
                          provisioned_agents: [...provisioned, agent.id],
                          [agent.id === 'chat-support' ? 'vapi_chat_assistant_id' : 'vapi_assistant_id']: vapiId
                        }
                      });
                      
                      if (error) throw error;
                      alert(`${agent.name} has been provisioned! VAPI ID: ${vapiId || 'N/A'}`);
                      window.location.reload();
                    } else {
                      const agentRoutes = {
                        'voice-support': '/support-agent',
                        'chat-support': '/support-agent',
                        'sales-dialer': '/campaigns',
                        'email-outreach': '/outreach',
                      };
                      navigate(agentRoutes[agent.id] || '/dashboard');
                    }
                  } catch (err) {
                    alert('Provisioning failed: ' + err.message);
                  }
                }}
                className="relative z-10 w-full py-4 rounded-[12px] bg-[var(--bg-input)] border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-[#0A0A0A] hover:border-[var(--accent)] transition-all duration-300 flex items-center justify-center gap-3"
              >
                {provisionedAgents.includes(agent.id) ? 'Access Agent' : 'Initialize Agent'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      

    </div>
  );
};

export default Marketplace;

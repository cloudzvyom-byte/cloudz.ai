import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Phone, MessageSquare, Headset, 
  Mail, Zap, Sparkles, TrendingUp,
  ArrowRight, Activity, ShieldCheck
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

const AGENTS = [
  {
    id: 'voice-support',
    name: 'Customer Support Agent',
    desc: 'Bilingual AI with advanced emotion detection and scheduling.',
    icon: Phone,
    color: 'text-purple-400',
    monthly: 9999,
    annual: 99990,
    savings: 19998,
    features: ['24/7 Inbound Latency < 200ms', 'Multi-Calendar Sync (GCal/iCal)', 'Contextual Memory Retention', 'Real-time Sentiment Analysis']
  },
  {
    id: 'chat-support',
    name: 'CSA Chat Based',
    desc: 'Instant web and app support with high-fidelity reasoning.',
    icon: MessageSquare,
    color: 'text-cyan-400',
    monthly: 9999,
    annual: 99990,
    savings: 19998,
    comingSoon: true,
    features: ['Zero-Knowledge Auto-Learning', 'Instant Lead Qualification', 'Dynamic Routing Logic', 'Custom JSON Knowledge Base']
  },
];

const Plans = () => {
  const navigate = useNavigate();
  const [billing, setBilling] = useState('monthly');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="p-12 max-w-7xl mx-auto h-full overflow-y-auto animate-in fade-in duration-700 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--accent-tint)] border border-[var(--accent)]/30 rounded-full mb-4">
          <Activity size={14} className="text-[var(--accent)]" />
          <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.2em]">Deployment Tier Selection</span>
        </div>
        <h1 className="text-5xl font-medium tracking-tighter text-[var(--text-primary)]">Choose your <span className="text-[var(--accent)]">Neural</span> Workforce.</h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto leading-relaxed">
          Select the specialized AI agents required for your operational scale. All plans include 256-bit encryption and 99.9% uptime.
        </p>

        <div className="flex items-center justify-center pt-8">
          <div className="flex p-1.5 bg-[var(--bg-input)] rounded-[20px] border border-[var(--border)] shadow-inner">
            <button 
              onClick={() => setBilling('monthly')}
              className={`px-10 py-3 rounded-[14px] text-xs font-bold uppercase tracking-widest transition-all duration-300 ${billing === 'monthly' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xl' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Interval: Monthly
            </button>
            <button 
              onClick={() => setBilling('annual')}
              className={`px-10 py-3 rounded-[14px] text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${billing === 'annual' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-xl' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Interval: Annual <span className="px-2 py-0.5 bg-[var(--success)]/10 text-[var(--success)] rounded-full text-[9px]">Best Value</span>
            </button>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        plan={selectedPlan} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {AGENTS.map((agent) => (
          <div 
            key={agent.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 flex flex-col hover:border-[var(--accent)] transition-all duration-500 group relative overflow-hidden"
          >
            {/* Background Accent Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] rounded-full blur-[60px] -mr-16 -mt-16 group-hover:opacity-10 transition-opacity bg-current ${agent.color}`} />

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-[14px] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center ${agent.color} group-hover:scale-110 transition-transform`}>
                <agent.icon size={24} />
              </div>
              <h3 className="font-bold text-base tracking-tight text-[var(--text-primary)] leading-tight">{agent.name}</h3>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-8 flex-1">{agent.desc}</p>

            <div className="mb-10">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-medium tracking-tighter text-[var(--text-primary)]">
                  {billing === 'monthly' ? formatPrice(agent.monthly) : formatPrice(agent.annual / 12)}
                </span>
                <span className="text-[var(--text-muted)] text-sm font-medium">/mo</span>
              </div>
              {billing === 'annual' && (
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Billed as {formatPrice(agent.annual)} / yr</p>
                  <p className="text-[10px] font-bold text-[var(--success)] uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp size={10} /> Saved {formatPrice(agent.savings)}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5 mb-10">
              {agent.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                  <span className="text-[11px] font-medium text-[var(--text-secondary)] leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {agent.comingSoon ? (
              <div className="w-full py-4 rounded-[18px] bg-white/5 border border-white/5 text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-not-allowed">
                Coming Soon <Sparkles size={14} className="opacity-50" />
              </div>
            ) : (
              <button 
                onClick={() => window.open('mailto:sales@operon.ai')}
                className="w-full py-4 rounded-[18px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-[#0A0A0A] hover:border-[var(--accent)] transition-all flex items-center justify-center gap-2 group/btn shadow-lg"
              >
                Contact Sales <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        ))}
      </div>


    </div>
  );
};

export default Plans;



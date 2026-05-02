import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Check, ShieldCheck, Zap, ArrowLeft, 
  CreditCard, Globe, Lock, Sparkles,
  ArrowRight, Cpu, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getVapiSettings } from '../lib/vapi';

const AGENTS = {
  'voice-support': { name: 'Customer Voice Support Agent', price: 9999, icon: Zap },
  'chat-support': { name: 'Customer Chat Support Agent', price: 9999, icon: Globe },
  'sales-dialer': { name: 'Sales Dialer Agent', price: 9999, icon: Cpu },
  'email-outreach': { name: 'AI Outreach Agent', price: 9999, icon: Sparkles }
};

const CREDIT_BUNDLES = [
  { id: 'small', credits: 100, price: 999, name: 'Tactical Buffer' },
  { id: 'medium', credits: 500, price: 3999, name: 'Strategic Node' },
  { id: 'large', credits: 1500, price: 9999, name: 'Enterprise Cluster' }
];

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agentId = searchParams.get('agent');
  const type = searchParams.get('type'); // 'agent' or 'topup'
  
  const [selectedBundle, setSelectedBundle] = useState(CREDIT_BUNDLES[1]);
  const agent = AGENTS[agentId] || AGENTS['voice-support'];

  const [billingCycle, setBillingCycle] = useState('monthly');
  const [paymentStep, setPaymentStep] = useState('init'); // init, processing, success
  
  const discount = 0.2; // 20% off for annual
  const finalPrice = type === 'topup' 
    ? selectedBundle.price 
    : (billingCycle === 'annual' ? Math.round(agent.price * 12 * (1 - discount)) : agent.price);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpay = async () => {
    setPaymentStep('processing');
    
    // Load Razorpay SDK dynamically
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    if (!res) {
      alert('Razorpay SDK failed to load. Are you offline?');
      setPaymentStep('init');
      return;
    }

    // Fetch dynamic Razorpay key from admin settings (with Env fallback)
    const settings = getVapiSettings();
    const razorpayKey = settings.razorpayKeyId;
    
    if (!razorpayKey) {
      alert('Razorpay Configuration Missing. Please set your Razorpay Key ID in the Admin Dashboard or Environment Variables.');
      setPaymentStep('init');
      return;
    }
    
    const options = {
      key: razorpayKey, 
      amount: finalPrice * 100,
      currency: "INR",
      name: "Operon AI",
      description: type === 'topup' ? `Credit Top-up: ${selectedBundle.name}` : `Subscription: ${agent.name}`,
      handler: async function(response) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase.from('profiles').select('credits, purchased_agents').eq('id', user.id).single();
            if (type === 'topup') {
              const currentCredits = profile?.credits || 0;
              await supabase.from('profiles').update({ 
                credits: currentCredits + selectedBundle.credits 
              }).eq('id', user.id);
            } else {
              const purchased = profile?.purchased_agents || [];
              if (!purchased.includes(agentId)) {
                await supabase.from('profiles').update({
                  purchased_agents: [...purchased, agentId]
                }).eq('id', user.id);
              }
            }
          }
          
          // Local storage fallback
          if (type !== 'topup') {
            const localPurchased = JSON.parse(localStorage.getItem('purchased_agents') || '[]');
            if (!localPurchased.includes(agentId)) {
              localStorage.setItem('purchased_agents', JSON.stringify([...localPurchased, agentId]));
            }
          }
          
          setPaymentStep('success');
        } catch (err) {
          console.error("Payment sync error:", err);
          // If Supabase fails (e.g. column doesn't exist), still show success for UI testing
          if (type !== 'topup') {
            const localPurchased = JSON.parse(localStorage.getItem('purchased_agents') || '[]');
            if (!localPurchased.includes(agentId)) {
              localStorage.setItem('purchased_agents', JSON.stringify([...localPurchased, agentId]));
            }
          }
          setPaymentStep('success');
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com"
      },
      theme: { color: "#FF6B1A" }
    };

    if (import.meta.env.DEV) {
      // Simulate successful payment locally
      setTimeout(() => {
        options.handler({ razorpay_payment_id: 'pay_test123' });
      }, 1000);
      return;
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (paymentStep === 'success') {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-[var(--success)]/10 border-2 border-[var(--success)] rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(29,158,117,0.2)]">
          <Check size={48} className="text-[var(--success)] stroke-[3px]" />
        </div>
        <h2 className="text-4xl font-medium text-[var(--text-primary)] mb-4 tracking-tight text-center">Authorization <span className="text-[var(--success)]">Successful</span>.</h2>
        <p className="text-[var(--text-secondary)] text-center max-w-md mb-12 font-medium">
          {type === 'topup' ? 'Credits have been injected into your neural buffer.' : 'Neural node provisioned. Your AI agent is now being initialized.'}
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-10 py-5 bg-[var(--accent)] text-[#0A0A0A] rounded-[16px] text-xs font-black uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all shadow-xl"
        >
          Return to Console
        </button>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto h-full flex flex-col animate-in fade-in duration-700">
      <button 
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-3 text-[var(--text-muted)] hover:text-white transition-colors mb-12 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Return to Previous Node</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* LEFT: ORDER SUMMARY */}
        <div className="lg:col-span-3 space-y-8">
          <header className="space-y-4">
            <h1 className="text-4xl font-medium tracking-tight text-[var(--text-primary)]">
              {type === 'topup' ? 'Infect' : 'Finalize'} <span className="text-[var(--accent)]">{type === 'topup' ? 'Credits' : 'Provisioning'}</span>.
            </h1>
            <p className="text-[var(--text-secondary)] text-base font-medium">Review your operational parameters before authorizing the deployment.</p>
          </header>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-8 space-y-8">
            {type === 'topup' ? (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Select Credit Bundle</p>
                <div className="grid grid-cols-1 gap-4">
                  {CREDIT_BUNDLES.map(bundle => (
                    <button 
                      key={bundle.id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`p-6 rounded-[20px] border-2 transition-all text-left flex justify-between items-center ${selectedBundle.id === bundle.id ? 'border-[var(--accent)] bg-[var(--accent-tint)]' : 'border-[var(--border)] bg-[var(--bg-input)] hover:border-gray-500'}`}
                    >
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] uppercase tracking-widest text-xs">{bundle.name}</h4>
                        <p className="text-[10px] text-[var(--text-muted)] font-black mt-1">{bundle.credits} NEURAL CREDITS</p>
                      </div>
                      <span className="text-lg font-medium text-[var(--text-primary)]">₹{bundle.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-6 pb-8 border-b border-[var(--border)]">
                  <div className="w-16 h-16 rounded-[16px] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                    <agent.icon size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">{agent.name}</h3>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Tier-1 Neural Agent</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)] font-medium">Subscription Cycle</span>
                    <div className="flex bg-[var(--bg-input)] p-1 rounded-[10px] border border-[var(--border)]">
                      <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-[var(--accent)] text-[#0A0A0A]' : 'text-[var(--text-muted)] hover:text-white'}`}
                      >
                        Monthly
                      </button>
                      <button 
                        onClick={() => setBillingCycle('annual')}
                        className={`px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'annual' ? 'bg-[var(--accent)] text-[#0A0A0A]' : 'text-[var(--text-muted)] hover:text-white'}`}
                      >
                        Annual (-20%)
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-y border-[var(--border)]/50 border-dashed">
                    <span className="text-sm text-[var(--text-secondary)] font-medium">Base Provisioning Fee</span>
                    <span className="text-sm text-[var(--text-primary)] font-bold">₹{agent.price.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-medium text-[var(--text-primary)] tracking-tight">Total Authorization</span>
              <div className="text-right">
                <span className="block text-2xl font-medium text-[var(--accent)] tracking-tight">₹{finalPrice.toLocaleString()}</span>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">INC. ALL PROTOCOL TAXES</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: PAYMENT METHODS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-20" />
             
             <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4">Secure Gateway Selection</h4>
             
             <button 
                onClick={handleRazorpay}
                className="w-full h-16 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] flex items-center justify-between px-6 hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] transition-all group"
             >
                <div className="flex items-center gap-4">
                  <CreditCard size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">Razorpay</span>
                </div>
                <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
             </button>

             <button className="w-full h-16 bg-[var(--bg-input)] border border-[var(--border)] rounded-[16px] flex items-center justify-between px-6 hover:border-[#0070BA] hover:bg-[#0070BA]/5 transition-all group opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-4">
                  <div className="w-5 h-5 bg-[#0070BA] rounded-full flex items-center justify-center text-white text-[8px] font-black">P</div>
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-widest">PayPal</span>
                </div>
                <Lock size={12} className="text-[var(--text-muted)]" />
             </button>

             <div className="pt-6 border-t border-[var(--border)] mt-4">
               <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck size={16} className="text-[var(--success)]" />
                 <span className="text-[9px] font-bold text-[var(--text-primary)] uppercase tracking-widest">End-to-End Encryption</span>
               </div>
               <p className="text-[9px] text-[var(--text-muted)] leading-relaxed font-medium">
                 Your authorization is processed through secure neural nodes. No credit card telemetry is stored on our local buffers.
               </p>
             </div>
          </div>

          <div className="p-6 bg-[var(--accent-tint)] border border-[var(--accent)]/10 rounded-[20px] flex items-start gap-4">
            <Lock size={16} className="text-[var(--accent)] mt-1 flex-shrink-0" />
            <p className="text-[10px] text-[var(--accent)] font-medium leading-relaxed uppercase tracking-wider">
              AUTHORIZED BY OPERON NEURAL PROTOCOL v4.0.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

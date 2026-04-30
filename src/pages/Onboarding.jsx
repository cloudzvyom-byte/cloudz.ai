import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Zap, Building2, MapPin, Phone, ArrowRight, Cpu, Sparkles } from 'lucide-react';

const INDUSTRIES = [
  'SKIN CLINIC', 'HAIR CLINIC', 'DENTAL CLINIC', 
  'REAL ESTATE', 'LUXURY SALON', 'E-COMMERCE', 'OTHER'
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspace_name: '',
    industry: INDUSTRIES[0],
    city: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('workspaces')
        .insert([{ ...formData, user_id: user.id }]);

      if (error) throw error;
      navigate('/plans');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-8 lg:p-12 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      <div className="w-full max-w-2xl animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-16 space-y-6">
          <div className="w-24 h-24 bg-[var(--bg-input)] border border-[var(--border)] rounded-[32px] flex items-center justify-center mx-auto shadow-2xl relative group">
            <div className="absolute inset-0 bg-[var(--accent)] opacity-[0.05] group-hover:opacity-[0.1] transition-opacity blur-xl" />
            <Cpu size={48} className="text-[var(--accent)] relative z-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-medium tracking-tighter text-white">Setup <span className="text-[var(--accent)]">Workspace</span>.</h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-md mx-auto">Initialize your autonomous operational cluster for neural agent orchestration.</p>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[56px] p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                  <Building2 size={16} className="text-[var(--accent)]" /> Workspace Designation
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.G. OPERON REALTY HUB"
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--border)] rounded-[28px] px-8 py-6 text-lg focus:border-[var(--accent)] transition-all outline-none text-white font-medium placeholder-[var(--text-muted)] shadow-inner"
                  value={formData.workspace_name}
                  onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Industry Domain</label>
                  <div className="relative">
                    <select
                      className="w-full bg-[var(--bg-input)] border-2 border-[var(--border)] rounded-[28px] px-8 py-6 text-sm font-bold focus:border-[var(--accent)] transition-all outline-none appearance-none text-white cursor-pointer"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                    <ArrowRight size={18} className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-[var(--text-muted)]" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                    <MapPin size={16} className="text-[var(--accent)]" /> Global Hub / City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. MUMBAI"
                    className="w-full bg-[var(--bg-input)] border-2 border-[var(--border)] rounded-[28px] px-8 py-6 text-sm font-bold focus:border-[var(--accent)] transition-all outline-none text-white placeholder-[var(--text-muted)]"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                  <Phone size={16} className="text-[var(--accent)]" /> Neural Bridge Contact
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--border)] rounded-[28px] px-8 py-6 text-lg font-bold focus:border-[var(--accent)] transition-all outline-none text-white placeholder-[var(--text-muted)]"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 rounded-[28px] bg-[var(--accent)] text-[#0A0A0A] text-xs font-black uppercase tracking-[0.4em] hover:bg-[var(--accent-hover)] transition-all shadow-[0_25px_60px_var(--accent-tint)] flex items-center justify-center gap-3 group disabled:opacity-30"
            >
              {loading ? (
                <span className="flex items-center gap-3"><Cpu size={20} className="animate-spin" /> Synchronizing...</span>
              ) : (
                <>
                  Initialize Protocol <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform stroke-[3px]" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="text-center mt-12 flex items-center justify-center gap-4 text-[var(--text-muted)]">
          <div className="w-12 h-[1px] bg-[var(--border)]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">
            Zero-Trust Security • End-to-End Encryption
          </p>
          <div className="w-12 h-[1px] bg-[var(--border)]" />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;



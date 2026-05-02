import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  User, Palette, Bell, Shield, 
  CreditCard, Link, Globe, Save,
  Check, ChevronRight, Activity, Zap, 
  Trash2, ExternalLink, Phone, AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Cloud AI Support', icon: User },
    { id: 'appearance', name: 'Display System', icon: Palette },
    { id: 'numbers', name: 'Connected Numbers', icon: Phone },
    { id: 'integrations', name: 'Neural Links', icon: Link },
    { id: 'security', name: 'Vault Security', icon: Shield },
  ];

  const themes = [
    { id: 'orange-black', name: 'Obsidian Orange', desc: 'High-contrast industrial aesthetic.', colors: ['#0A0A0A', '#FF6B1A'] },
    { id: 'navy-beige', name: 'Midnight Gold', desc: 'Sophisticated corporate interface.', colors: ['#0D1B2A', '#C8A97E'] },
    { id: 'white-cherry', name: 'Frost Cherry', desc: 'Minimalist high-light environment.', colors: ['#FAFAFA', '#C41E3A'] },
    { id: 'black-white', name: 'Pure Contrast', desc: 'Classic brutalist monochrome.', colors: ['#000000', '#FFFFFF'] },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  const handleNuclearDelete = async () => {
    const confirmed = window.confirm("WARNING: SYSTEM WIPE ENGAGED.\n\nThis will permanently delete your account, all agents, call logs, and knowledge base data. This action CANNOT be undone.\n\nDo you wish to proceed?");
    if (confirmed) {
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').delete().eq('id', user.id);
          await supabase.auth.signOut();
          window.location.href = '/landing';
        }
      } catch (err) {
        alert("Deletion failed: " + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col md:flex-row gap-12 overflow-y-auto animate-in fade-in duration-500 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 flex-shrink-0">
        <div className="mb-10">
          <h1 className="text-3xl font-medium tracking-tight mb-2">System Config</h1>
          <p className="text-sm text-[var(--text-muted)] font-medium uppercase tracking-widest">Environment v4.2.0</p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[18px] text-sm transition-all duration-300 group ${activeTab === tab.id ? 'bg-[var(--accent)] text-[#0A0A0A] shadow-lg shadow-[var(--accent-tint)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-[#0A0A0A]' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors'} />
              <span className={`font-medium ${activeTab === tab.id ? 'font-bold' : ''}`}>{tab.name}</span>
              {activeTab === tab.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="mt-12 p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)]">System Health: Optimal</span>
          </div>
          <div className="w-full h-1 bg-[var(--bg-input)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--success)] w-[98%]" />
          </div>
        </div>
      </aside>

      {/* Main Configuration Surface */}
      <div className="flex-1 max-w-3xl">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          {activeTab === 'profile' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <header className="mb-8">
                  <h2 className="text-2xl font-medium tracking-tight mb-1">Account Identity</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Manage your personal and organizational profile settings.</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center gap-8 mb-4">
                    <div className="w-24 h-24 rounded-[28px] bg-[var(--bg-input)] border-2 border-dashed border-[var(--border)] flex items-center justify-center group cursor-pointer hover:border-[var(--accent)] transition-all">
                      <User size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    </div>
                    <div>
                      <button className="px-5 py-2 bg-[var(--bg-input)] border border-[var(--border)] rounded-[12px] text-xs font-bold uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all mb-2">Upload Avatar</button>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">Recommended: 400x400px. JPG or PNG.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Legal Name</label>
                      <input type="text" placeholder="Vyom Jain" className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[14px] px-5 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Email Vector</label>
                      <input type="email" placeholder="vyom@clouds.ai" className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[14px] px-5 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Operational Entity</label>
                    <input type="text" placeholder="Clouds AI Technologies" className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[14px] px-5 py-3.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner" />
                  </div>
                </div>
              </section>

              <section className="pt-8 border-t border-[var(--border)]">
                <h3 className="text-lg font-medium mb-6">Global Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-[var(--bg-input)] rounded-[20px] border border-transparent hover:border-[var(--border)] transition-all">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                        <Bell size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Priority Telemetry</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Get real-time alerts for campaign anomalies.</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-[var(--accent)] rounded-full p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-[#0A0A0A] rounded-full translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-[var(--bg-input)] rounded-[20px] border border-transparent hover:border-[var(--border)] transition-all">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                        <Globe size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Primary Interface Language</p>
                        <p className="text-[11px] text-[var(--text-muted)] font-medium">Current selection: Global English (EN-US).</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">Change</button>
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSave}
                  className="px-10 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[18px] font-bold text-sm hover:bg-[var(--accent-hover)] transition-all flex items-center gap-3 shadow-lg shadow-[var(--accent-tint)] active:scale-95"
                >
                  {saving ? <><Activity size={18} className="animate-spin" /> Synchronizing...</> : <><Save size={18} /> Commit Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <header className="mb-10">
                  <h2 className="text-2xl font-medium tracking-tight mb-2">Display System</h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Customize the architectural look and feel of your command center.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`text-left p-6 rounded-[24px] border-2 transition-all duration-500 relative overflow-hidden group ${theme === t.id ? 'border-[var(--accent)] bg-[var(--accent-tint)]' : 'border-[var(--border)] bg-[var(--bg-input)] hover:border-[var(--border-active)]'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex -space-x-1.5">
                          {t.colors.map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border-2 border-[var(--bg-card)] shadow-sm" style={{ background: c }}></div>
                          ))}
                        </div>
                        {theme === t.id && (
                          <div className="w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent-tint)]">
                            <Check size={14} className="text-[#0A0A0A] stroke-[3px]" />
                          </div>
                        )}
                      </div>
                      <p className={`text-base font-bold mb-1 ${theme === t.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{t.name}</p>
                      <p className="text-[var(--text-muted)] text-sm">Enterprise feature: hide "Powered by Cloud AI" watermark.</p>

                      {/* Hover effect indicator */}
                      <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Zap size={14} className="text-[var(--accent)]" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="p-8 bg-[var(--bg-input)] rounded-[28px] border border-[var(--border)] shadow-inner">
                <div className="flex items-center gap-3 mb-6">
                  <Activity size={18} className="text-[var(--accent)]" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)]">Render Optimization</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold block mb-0.5">Motion Suppression</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">Disable complex animations to save GPU resources.</span>
                    </div>
                    <div className="w-10 h-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-full p-1 cursor-pointer">
                      <div className="w-3 h-3 bg-[var(--text-muted)] rounded-full" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-bold block mb-0.5">High-Definition Borders</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">Add emphasis to UI elements via high-contrast lines.</span>
                    </div>
                    <div className="w-10 h-5 bg-[var(--accent)] rounded-full p-1 cursor-pointer flex justify-end">
                      <div className="w-3 h-3 bg-[#0A0A0A] rounded-full" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'numbers' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <header className="flex justify-between items-end mb-10">
                  <div>
                    <h2 className="text-2xl font-medium tracking-tight mb-2">Connected Numbers</h2>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">Assign your business phone numbers to the AI Support agent.</p>
                  </div>
                  <button className="px-6 py-3 bg-[var(--accent)] text-[#0A0A0A] rounded-[14px] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-hover)] transition-all shadow-lg flex items-center gap-2">
                    <Zap size={14} /> + Add Number
                  </button>
                </header>

                <div className="space-y-4">
                  <div className="p-6 bg-[var(--bg-input)] border border-[var(--border)] rounded-[24px] flex items-center justify-between group hover:border-[var(--accent)]/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[16px] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                        <Phone size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-white">+91 98765 43210</p>
                          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Main Clinic Line · Active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all">Test Call</button>
                      <button className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] text-[10px] font-bold uppercase tracking-widest text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-all">Disconnect</button>
                    </div>
                  </div>

                  <div className="p-10 border-2 border-dashed border-[var(--border)] rounded-[32px] flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-muted)] mb-6">
                      <Link size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Connect more numbers</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-8">Each number can be assigned a specific assistant for custom handling.</p>
                    <button className="text-[var(--accent)] font-bold uppercase tracking-widest text-xs hover:underline">Browse VAPI Numbers</button>
                  </div>
                </div>
              </section>

              <section className="p-8 bg-[var(--accent-tint)] rounded-[28px] border border-[var(--accent)]/10">
                <div className="flex items-center gap-3 mb-4">
                  <Activity size={18} className="text-[var(--accent)]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Inbound Routing Logic</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">Incoming calls are intercepted at the carrier level and routed to your neural agent within 200ms of the first ring.</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--success)]" />
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">0 Ring Pick-up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-[var(--success)]" />
                    <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Auto-Scale Support</span>
                  </div>
                </div>
              </section>
            </div>
          )}



          {activeTab === 'integrations' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-2xl font-medium tracking-tight mb-2">Neural Link Center</h2>
                <p className="text-sm text-[var(--text-secondary)]">Bridge Cloud AI with your existing software stack.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { name: 'Google Workspace', prompt: 'You are a helpful chat support agent for Cloud. Use the knowledge base to answer questions.', connected: true, icon: Globe },
                  { name: 'WhatsApp Business', desc: 'Outbound engagement gateway.', connected: false, icon: Zap },
                  { name: 'GoHighLevel CRM', desc: 'Lead pipeline synchronization.', connected: true, icon: Activity },
                  { name: 'Zapier Webhooks', desc: 'Connect to 5,000+ external triggers.', connected: false, icon: Link },
                ].map((app) => (
                  <div key={app.name} className="p-6 bg-[var(--bg-input)] border border-[var(--border)] rounded-[24px] flex items-center justify-between group hover:bg-[var(--bg-hover)] transition-all">
                    <div className="flex gap-5">
                      <div className="w-14 h-14 rounded-[18px] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-sm group-hover:scale-105 transition-transform">
                        <app.icon size={28} />
                      </div>
                      <div>
                        <p className="text-base font-bold mb-0.5">{app.name}</p>
                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest">{app.desc}</p>
                      </div>
                    </div>
                    <button className={`px-6 py-2.5 rounded-[14px] text-[10px] font-bold uppercase tracking-widest transition-all ${app.connected ? 'bg-transparent border border-[var(--border)] text-[var(--text-muted)]' : 'bg-[var(--accent)] text-[#0A0A0A] shadow-md shadow-[var(--accent-tint)]'}`}>
                      {app.connected ? 'Active' : 'Authorize'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-10">
                <h2 className="text-2xl font-medium tracking-tight mb-2">Vault Security</h2>
                <p className="text-sm text-[var(--text-secondary)]">Manage encryption methods and access vectors.</p>
              </header>

              <div className="space-y-6">
                <div className="p-8 bg-[var(--bg-input)] rounded-[28px] border border-[var(--border)]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-[14px] bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-widest">Multi-Factor Authentication</h3>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium">Add an extra layer of protection to your account.</p>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[18px] font-bold text-xs uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all">
                    Initialize MFA System
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px]">
                    <div>
                      <p className="text-sm font-bold">API Access Token</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest mt-1">Used for programmatic access.</p>
                    </div>
                    <button className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest hover:underline">Revoke</button>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px]">
                    <div>
                      <p className="text-sm font-bold">Active Sessions</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest mt-1">2 devices currently authenticated.</p>
                    </div>
                    <button className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--error)] transition-colors">Clear All</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;



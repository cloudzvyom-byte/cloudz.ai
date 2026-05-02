import React, { useState } from 'react';
import { 
  Plus, Phone, Users, Upload, Check, 
  ChevronRight, Play, Pause, MoreVertical,
  BarChart3, Clock, Calendar, Search, 
  Rocket, Activity, Zap, ArrowLeft,
  Shield, Target, Layers, Cpu, Sparkles,
  Trash2, Edit2, ChevronDown, ListVideo, CloudUpload,
  Grid3x3, X, PhoneCall
} from 'lucide-react';
import CampaignDetail from '../components/CampaignDetail';

const CampaignList = ({ onNew, campaigns, onToggleStatus, onDelete, onOpenDialer, onSelectCampaign }) => (
  <div className="p-10 max-w-6xl mx-auto animate-in fade-in duration-700">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/20 rounded-full">
          <Rocket size={12} className="text-[var(--accent)]" />
          <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Outbound Engine Active</span>
        </div>
        <h1 className="text-4xl font-medium tracking-tight text-[var(--text-primary)]">Campaign <span className="text-[var(--accent)]">Center</span>.</h1>
        <p className="text-[var(--text-secondary)] text-base font-medium max-w-xl">Orchestrate and scale your autonomous Sales Dialer operations with real-time telemetry.</p>
      </div>
      <button 
        onClick={onNew}
        className="px-8 py-4 rounded-[12px] bg-[var(--accent)] text-[#0A0A0A] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all flex items-center gap-3 shadow-xl group"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform stroke-[3px]" /> Initialize Campaign
      </button>
    </div>

    {campaigns.length === 0 ? (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] p-24 text-center">
        <div className="w-16 h-16 bg-[var(--bg-input)] rounded-[16px] flex items-center justify-center mx-auto mb-8 border border-[var(--border)]">
          <Cpu size={32} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="text-2xl font-medium mb-3 text-[var(--text-primary)] tracking-tight">No Operational Campaigns</h2>
        <p className="text-[var(--text-secondary)] max-w-xs mx-auto mb-10 font-medium text-sm">
          Initialize a new deployment to begin high-velocity lead engagement via neural voice nodes.
        </p>
        <button 
          onClick={onNew}
          className="px-10 py-4 rounded-[12px] bg-transparent border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
        >
          Authorize First Deployment
        </button>
      </div>
    ) : (
      <div className="space-y-10">

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search campaigns"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] py-3.5 pl-12 pr-6 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={onOpenDialer}
            className="px-8 py-3.5 rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--text-muted)] transition-all flex items-center gap-3 font-medium text-sm shadow-sm"
          >
            <Grid3x3 size={16} className="text-[var(--text-muted)]" /> Dial
          </button>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111111]/50">
              <tr className="border-b border-[var(--border)]">
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Deployment Identity</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">State</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Dials</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Progress</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--bg-hover)] transition-all group cursor-pointer" onClick={() => onSelectCampaign(c)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] group-hover:border-[var(--accent)] transition-all">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-primary)] text-sm tracking-tight">{c.name}</p>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Sales Dialer • {c.created}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {c.status === 'paused' ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning)]/10 text-[var(--warning)] text-[9px] font-black uppercase tracking-widest border border-[var(--warning)]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" /> Paused
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-[9px] font-black uppercase tracking-widest border border-[var(--success)]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Running
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 font-bold text-[var(--text-primary)] tracking-widest">{c.dials || '0'}</td>
                  <td className="px-8 py-6">
                    <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div className={`h-full rounded-full ${c.status === 'paused' ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'}`} style={{ width: c.progress || '0%' }} />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onToggleStatus(c.id); }} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors" title={c.status === 'paused' ? "Resume" : "Pause"}>
                        {c.status === 'paused' ? <Play size={18} /> : <Pause size={18} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

const NewCampaignForm = ({ onCancel, onCreated }) => {
  const [formData, setFormData] = useState({
    name: 'Untitled Campaign',
    dialerType: 'power',
    callVia: 'Specific numbers only',
    selectedNumber: '+12546934939',
    cooldown: 30,
    audienceType: 'list',
    recordCalls: true,
    respectDNC: true,
    useLocalTimeZone: false
  });

  const [isEditingName, setIsEditingName] = useState(false);

  const handleCreate = () => {
    onCreated({ 
      ...formData, 
      id: Date.now(), 
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase(),
      status: 'running',
      dials: '0',
      progress: '0%'
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg-app)] animate-in slide-in-from-right-8 duration-700">
      {/* Header */}
      <div className="px-10 py-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--bg-app)] z-10">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                autoFocus
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="bg-transparent border-b border-[var(--accent)] text-xl font-medium tracking-tight text-[var(--text-primary)] focus:outline-none"
              />
            ) : (
              <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">{formData.name}</h2>
            )}
            <button onClick={() => setIsEditingName(true)} className="p-1 text-[var(--text-muted)] hover:text-white transition-colors rounded-full hover:bg-[var(--bg-hover)]">
              <Edit2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-12 pb-20 mt-4">
          
          {/* Dialer Type */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dialer Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({...formData, dialerType: 'power'})}
                className={`text-left p-5 rounded-[12px] border-2 transition-all relative ${formData.dialerType === 'power' ? 'border-[var(--text-primary)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Activity size={20} className="text-[var(--text-secondary)] mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">Power Dialer</p>
                      <p className="text-xs text-[var(--text-muted)] font-medium mt-1.5 leading-relaxed">Power dialer dials one prospect at a time, connecting you only if the prospect picks up, minimising disconnected calls.</p>
                    </div>
                  </div>
                  {formData.dialerType === 'power' && <Check size={16} className="text-white flex-shrink-0" />}
                </div>
              </button>
              
              <button
                onClick={() => setFormData({...formData, dialerType: 'parallel'})}
                className={`text-left p-5 rounded-[12px] border-2 transition-all relative ${formData.dialerType === 'parallel' ? 'border-[var(--text-primary)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <Zap size={20} className="text-[var(--text-secondary)] mt-0.5" />
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">Parallel Dialer</p>
                      <p className="text-xs text-[var(--text-muted)] font-medium mt-1.5 leading-relaxed">Parallel Dialer dials multiple prospects simultaneously, connecting you only if the prospect picks up, minimising downtime.</p>
                    </div>
                  </div>
                  {formData.dialerType === 'parallel' && <Check size={16} className="text-white flex-shrink-0" />}
                </div>
              </button>
            </div>
          </div>

          {/* Call Via */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Call Via</label>
            <div className="relative">
              <select 
                value={formData.callVia}
                onChange={(e) => setFormData({...formData, callVia: e.target.value})}
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[8px] px-4 py-3.5 text-sm text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--accent)] transition-all"
              >
                <option value="Specific numbers only">Specific numbers only</option>
                <option value="Round Robin">Round Robin</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1.5"><Shield size={12} /> Calls will use only the numbers you select below.</p>
          </div>

          {/* Select numbers */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Select numbers to dial from</label>
            <div className="relative">
              <select 
                value={formData.selectedNumber}
                onChange={(e) => setFormData({...formData, selectedNumber: e.target.value})}
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[8px] px-4 py-3.5 text-sm text-[var(--text-primary)] appearance-none focus:outline-none focus:border-[var(--accent)] transition-all"
              >
                <option value="+12546934939">+12546934939</option>
                <option value="+19876543210">+19876543210</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          {/* Cooldown duration */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Cooldown duration between two calls</label>
            <div className="relative">
              <input 
                type="number"
                value={formData.cooldown}
                onChange={(e) => setFormData({...formData, cooldown: parseInt(e.target.value) || 0})}
                className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[8px] px-4 py-3.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">second(s)</span>
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">Audience</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setFormData({...formData, audienceType: 'list'})}
                className={`text-left p-5 rounded-[12px] border transition-all ${formData.audienceType === 'list' ? 'border-[var(--text-primary)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'}`}
              >
                <div className="flex gap-4 items-center">
                  <ListVideo size={20} className="text-[var(--text-secondary)]" />
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Select a list</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Select an existing list</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setFormData({...formData, audienceType: 'upload'})}
                className={`text-left p-5 rounded-[12px] border transition-all ${formData.audienceType === 'upload' ? 'border-[var(--text-primary)] bg-[var(--bg-hover)]' : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--text-muted)]'}`}
              >
                <div className="flex gap-4 items-center">
                  <CloudUpload size={20} className="text-[var(--text-secondary)]" />
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">Upload leads</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Provide a CSV of leads</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Settings Checkboxes */}
          <div className="space-y-5 pt-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${formData.recordCalls ? 'bg-white border-white text-black' : 'bg-transparent border-[var(--border)] group-hover:border-[var(--text-muted)]'}`}>
                {formData.recordCalls && <Check size={14} strokeWidth={3} />}
              </div>
              <input type="checkbox" className="hidden" checked={formData.recordCalls} onChange={() => setFormData({...formData, recordCalls: !formData.recordCalls})} />
              <span className="text-sm font-medium text-[var(--text-primary)]">Enable default call recording for all calls in this campaign</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${formData.respectDNC ? 'bg-white border-white text-black' : 'bg-transparent border-[var(--border)] group-hover:border-[var(--text-muted)]'}`}>
                {formData.respectDNC && <Check size={14} strokeWidth={3} />}
              </div>
              <input type="checkbox" className="hidden" checked={formData.respectDNC} onChange={() => setFormData({...formData, respectDNC: !formData.respectDNC})} />
              <span className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">Respect Do-Not-Call (DNC) lists <Shield size={14} className="text-[var(--text-muted)]" /></span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${formData.useLocalTimeZone ? 'bg-white border-white text-black' : 'bg-transparent border-[var(--border)] group-hover:border-[var(--text-muted)]'}`}>
                {formData.useLocalTimeZone && <Check size={14} strokeWidth={3} />}
              </div>
              <input type="checkbox" className="hidden" checked={formData.useLocalTimeZone} onChange={() => setFormData({...formData, useLocalTimeZone: !formData.useLocalTimeZone})} />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Use the lead/contact's local time zone to call during their active hours</span>
            </label>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="px-10 py-5 border-t border-[var(--border)] bg-[var(--bg-app)] flex justify-end gap-3 sticky bottom-0 z-10">
        <button onClick={onCancel} className="px-6 py-2.5 rounded-[8px] bg-transparent text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all">
          Cancel
        </button>
        <button onClick={handleCreate} className="px-6 py-2.5 rounded-[8px] bg-[#E0E0E0] text-sm font-medium text-black hover:bg-white transition-all shadow-sm">
          Create Campaign
        </button>
      </div>
    </div>
  );
};

const Campaigns = () => {
  const [view, setView] = useState('list');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'B2B Enterprise Outreach', status: 'paused', created: '2026-04-20', leads: 450, cooldown: 2, dials: 0, progress: '0%' },
    { id: 2, name: 'Q3 Product Demo Followups', status: 'completed', created: '2026-04-18', leads: 120, cooldown: 5, dials: 120, progress: '100%' }
  ]);
  const [showDialer, setShowDialer] = useState(false);
  const [dialNumber, setDialNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleCreated = (campaign) => {
    setCampaigns([campaign, ...campaigns]);
    setView('list');
  };

  const handleUpdateStatus = (id, status) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    if (selectedCampaign && selectedCampaign.id === id) {
      setSelectedCampaign({ ...selectedCampaign, status });
    }
  };

  const handleToggleStatus = (id) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    const newStatus = campaign.status === 'paused' ? 'running' : 'paused';
    handleUpdateStatus(id, newStatus);
  };

  const handleSelectCampaign = (c) => {
    setSelectedCampaign(c);
    setView('detail');
  };

  const handleDelete = (id) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const handleCall = async () => {
    if (!dialNumber) return;
    setIsCalling(true);
    try {
      const { makeVapiCall } = await import('../lib/vapi');
      const dummyLead = { id: 'manual', name: 'Manual Test User', phone: dialNumber };
      const dummyCampaign = { id: 'manual', name: 'Manual Call Test' };
      
      await makeVapiCall(dummyLead, dummyCampaign);
      
      setIsCalling(false);
      setShowDialer(false);
      setDialNumber('');
      alert('VAPI call initiated successfully! You should receive a call shortly.');
    } catch (err) {
      setIsCalling(false);
      alert('Failed to initiate VAPI call: ' + err.message);
    }
  };

  if (view === 'new') return <NewCampaignForm onCancel={() => setView('list')} onCreated={handleCreated} />;
  if (view === 'detail') return <CampaignDetail campaign={selectedCampaign} onBack={() => setView('list')} onUpdateStatus={handleUpdateStatus} />;
  
  return (
    <>
      <CampaignList 
        onNew={() => setView('new')} 
        campaigns={campaigns} 
        onToggleStatus={handleToggleStatus} 
        onDelete={handleDelete} 
        onOpenDialer={() => setShowDialer(true)}
        onSelectCampaign={handleSelectCampaign}
      />

      {showDialer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-tint)] flex items-center justify-center border border-[var(--accent)]/20">
                  <Grid3x3 size={18} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight">Manual Dial</h3>
              </div>
              <button onClick={() => setShowDialer(false)} className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-1 mb-2 block">Phone Number</label>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="+1 (555) 000-0000"
                  value={dialNumber}
                  onChange={(e) => setDialNumber(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[12px] px-6 py-4 text-lg font-medium text-[var(--text-primary)] tracking-wider focus:outline-none focus:border-[var(--accent)] transition-all text-center"
                />
              </div>

              <button 
                onClick={handleCall}
                disabled={isCalling || !dialNumber}
                className="w-full py-4 bg-[var(--success)] text-white rounded-[12px] text-sm font-black uppercase tracking-widest hover:bg-[#208a46] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              >
                {isCalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calling...
                  </>
                ) : (
                  <>
                    <PhoneCall size={18} /> Initiate Call
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Campaigns;

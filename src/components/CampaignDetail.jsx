import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw,
  MoreVertical, Download, Phone, 
  CheckCircle2, AlertCircle, Clock,
  PlayCircle, Activity, Users, Target, Zap
} from 'lucide-react';
import { makeVapiCall } from '../lib/vapi';
import { supabase } from '../lib/supabase';
import CreditPopup from './CreditPopup';

const MOCK_LEADS = [
  { id: 1, name: 'Rahul Kapoor', phone: '+919988776655', email: 'rahul@example.com' },
  { id: 2, name: 'Sneha Rao', phone: '+918877665544', email: 'sneha@example.com' },
  { id: 3, name: 'Amit Singh', phone: '+917766554433', email: 'amit@example.com' },
  { id: 4, name: 'Pooja Sharma', phone: '+916655443322', email: 'pooja@example.com' },
  { id: 5, name: 'Vikram Patel', phone: '+915544332211', email: 'vikram@example.com' }
];

const CampaignDetail = ({ campaign, onBack, onUpdateStatus }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: MOCK_LEADS.length, made: 0, answered: 0, booked: 0 });
  const [isRunning, setIsRunning] = useState(campaign.status === 'running');
  const isRunningRef = useRef(isRunning);
  
  const [userCredits, setUserCredits] = useState(0);
  const [showCreditPopup, setShowCreditPopup] = useState(false);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
        setUserCredits(profile?.credits || 0);
      }
    } catch (err) {
      console.error("Credit fetch error:", err);
    }
  };

  const runCampaign = async () => {
    // Check credits before starting
    // Bypass credits for testing
    /*
    if (userCredits <= 0) {
      setShowCreditPopup(true);
      return;
    }
    */

    setIsRunning(true);
    onUpdateStatus(campaign.id, 'running');
    
    const isParallel = campaign.dialerType === 'parallel';
    const leadsToCall = MOCK_LEADS.filter(lead => !logs.find(l => l.leadId === lead.id));

    if (isParallel) {
      // Parallel Dialer Logic
      const callPromises = leadsToCall.map(async (lead, index) => {
        if (!isRunningRef.current) return;
        
        // Slight stagger to avoid rate limits
        await new Promise(r => setTimeout(r, index * 300));
        if (!isRunningRef.current) return;

        // Final check before each call in parallel
        // Bypass credits for testing
        /*
        if (userCredits <= 0) {
          setIsRunning(false);
          setShowCreditPopup(true);
          return;
        }
        */

        return initiateCall(lead);
      });
      
      await Promise.all(callPromises);
    } else {
      // Power Dialer Logic (Sequential)
      for (const lead of leadsToCall) {
        if (!isRunningRef.current) break;
        
        // Final check before each call
        // Bypass credits for testing
        /*
        if (userCredits <= 0) {
          setIsRunning(false);
          setShowCreditPopup(true);
          break;
        }
        */

        await initiateCall(lead);
        
        if (isRunningRef.current) {
          // Use campaign cooldown or default to 2s
          const cooldown = (campaign.cooldown || 2) * 1000;
          await new Promise(r => setTimeout(r, cooldown));
        }
      }
    }
    
    if (isRunningRef.current) {
      setIsRunning(false);
      onUpdateStatus(campaign.id, 'completed');
    }
  };

  const initiateCall = async (lead) => {
    const newLog = {
      id: Date.now() + Math.random(),
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      status: 'Calling',
      response: '-',
      booked: false,
      duration: '0s',
      time: new Date().toLocaleTimeString()
    };
    
    setLogs(prev => [newLog, ...prev]);
    setStats(prev => ({ ...prev, made: prev.made + 1 }));

    try {
      await makeVapiCall(lead, campaign, {
        dialerType: campaign.dialerType,
        recordCalls: campaign.recordCalls
      });
      
      // Simulating webhook response delay
      await new Promise(r => setTimeout(r, 4000));
      
      // Post-call credit deduction (simulated for UI)
      setUserCredits(prev => {
        const next = Math.max(0, prev - 1);
        // Persist to Supabase if possible
        updateRemoteCredits(next);
        return next;
      });
      
      setLogs(prev => prev.map(l => l.id === newLog.id ? { 
        ...l, 
        status: 'Answered', 
        response: 'Call connected successfully via VAPI.', 
        duration: '14s' 
      } : l));
      setStats(prev => ({ ...prev, answered: prev.answered + 1 }));
      return true;
    } catch (e) {
      setLogs(prev => prev.map(l => l.id === newLog.id ? { ...l, status: 'Failed', response: e.message } : l));
      return false;
    }
  };

  const updateRemoteCredits = async (val) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ credits: val }).eq('id', user.id);
      }
    } catch (err) {
      console.error("Failed to update remote credits:", err);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    onUpdateStatus(campaign.id, 'paused');
  };

  const StatusBadge = ({ status }) => {
    const map = {
      'Calling': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      'Answered': 'bg-teal-500/10 text-teal-500 border-teal-500/30',
      'Failed': 'bg-red-500/10 text-red-500 border-red-500/30',
      'No Answer': 'bg-gray-500/10 text-gray-500 border-gray-500/30'
    };
    return (
      <span className={`px-2 py-1 rounded-[6px] border text-[9px] font-black uppercase tracking-widest ${map[status] || map['No Answer']}`}>
        {status}
      </span>
    );
  };

  const progress = (stats.made / stats.total) * 100 || 0;

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
      <CreditPopup 
        isOpen={showCreditPopup} 
        onClose={() => setShowCreditPopup(false)} 
        balance={userCredits}
      />

      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-white transition-all group">
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Back to Campaigns
        </button>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full mr-4">
             <Zap size={14} className={userCredits < 50 ? "text-red-500" : "text-orange-500"} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white">{userCredits} Credits</span>
          </div>
          {isRunning ? (
            <button onClick={handlePause} className="px-8 py-3 bg-[var(--warning)] text-black rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:opacity-90 flex items-center gap-2 transition-all shadow-[0_10px_30px_var(--warning)]/20">
              <Pause size={14} fill="currentColor" /> Pause Dialing
            </button>
          ) : (
            <button onClick={runCampaign} className="px-8 py-3 bg-[var(--accent)] text-black rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--accent-hover)] flex items-center gap-2 transition-all shadow-[0_10px_30px_var(--accent-tint)]">
              <Play size={14} fill="currentColor" /> {logs.length > 0 ? 'Resume Dialing' : 'Run Campaign'}
            </button>
          )}
          <button className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] text-[var(--text-muted)] hover:text-white transition-all">
            <MoreVertical size={16} />
          </button>
        </div>
      </header>

      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-medium tracking-tight text-white">{campaign.name}</h1>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isRunning ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30' : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border)]'}`}>
              {isRunning ? 'Running' : campaign.status}
            </span>
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-sm flex items-center gap-2">
            VAPI Sales Agent <span className="px-2 py-0.5 rounded-md bg-[var(--bg-input)] border border-[var(--border)] text-[var(--accent)] text-[10px] font-black uppercase">{campaign.dialerType || 'Power'} Dialer</span>
          </p>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Leads', val: stats.total, icon: Users },
          { label: 'Calls Made', val: stats.made, icon: Phone },
          { label: 'Answered', val: stats.answered, icon: Activity },
          { label: 'Booked', val: stats.booked, icon: Target, highlight: true }
        ].map((s, i) => (
          <div key={i} className={`bg-[var(--bg-card)] border ${s.highlight ? 'border-[var(--accent)]/50 shadow-[0_10px_30px_var(--accent-tint)]/10' : 'border-[var(--border)]'} rounded-[20px] p-4 lg:p-6 transition-transform hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-[10px] flex items-center justify-center ${s.highlight ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg-input)] text-[var(--text-muted)]'}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-[9px] lg:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-2xl lg:text-3xl font-medium tracking-tighter ${s.highlight ? 'text-[var(--accent)]' : 'text-white'}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-6 mb-8">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Dialer Progress</p>
          <p className="text-xs font-bold text-white">{stats.made} of {stats.total} leads called</p>
        </div>
        <div className="h-2 w-full bg-[var(--bg-input)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-[#111111]/50">
              <tr className="border-b border-[var(--border)]">
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Identity</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Status</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Response</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Duration</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px] text-right">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">No calls initiated yet.</p>
                  </td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-[var(--bg-hover)] transition-all animate-in fade-in slide-in-from-left-4 duration-500">
                  <td className="px-8 py-5">
                    <p className="font-bold text-white text-sm tracking-tight">{log.name}</p>
                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{log.phone}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {log.status === 'Calling' && <div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />}
                      <StatusBadge status={log.status} />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-[var(--text-secondary)] truncate max-w-[250px]">{log.response}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-[var(--text-muted)]">{log.duration}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-[var(--text-muted)] hover:text-white transition-colors disabled:opacity-30" disabled={log.status === 'Calling' || log.status === 'Failed'}>
                      <PlayCircle size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;

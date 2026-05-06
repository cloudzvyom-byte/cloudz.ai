import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Headset, Phone, Play, Download, PhoneCall, Loader2, User, Calendar, Clock, Activity, Check, X } from 'lucide-react';
import { getVapiAssistant, getVapiCallsByAssistant, triggerSupportCall } from '../lib/vapi';
import { supabase } from '../lib/supabase';

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

const SupportAgentConfig = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [agentLive, setAgentLive] = useState(null);
  const [calls, setCalls] = useState([]);
  const [callsLoading, setCallsLoading] = useState(false);
  const [userAssistantId, setUserAssistantId] = useState(null);
  const [assignedNumber, setAssignedNumber] = useState(null);
  const [phoneNumberId, setPhoneNumberId] = useState(null);
  const [testPhone, setTestPhone] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [agentName, setAgentName] = useState('Sarah');

  const fetchConfigAndCalls = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('vapi_assistant_id').eq('id', user.id).single();
      const assistantId = profile?.vapi_assistant_id || user.user_metadata?.vapi_assistant_id;
      
      setUserAssistantId(assistantId);
      
      if (assistantId) {
        const data = await getVapiAssistant(assistantId);
        if (data) {
          setAgentName(data.name || 'Sarah');
          const numberObj = data.phoneNumbers?.[0] || (data.phoneNumberId ? { number: 'Linked', id: data.phoneNumberId } : null);
          setAssignedNumber(numberObj?.number || null);
          setPhoneNumberId(data.phoneNumberId || numberObj?.id || null);
          setAgentLive(!!numberObj);
          
          // Initial fetch of calls
          const callData = await getVapiCallsByAssistant(assistantId);
          setCalls(callData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } else {
          setAgentLive(false);
        }
      } else {
        setAgentLive(false);
      }
    } catch (err) {
      console.error(err);
      setAgentLive(false);
    } finally {
      setFetching(false);
    }
  }, []);

  const pollStats = useCallback(async () => {
    if (!userAssistantId) return;
    try {
      const callData = await getVapiCallsByAssistant(userAssistantId);
      setCalls(callData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Polling failed:', err);
    }
  }, [userAssistantId]);

  useEffect(() => {
    fetchConfigAndCalls();
  }, [fetchConfigAndCalls]);

  useEffect(() => {
    const interval = setInterval(pollStats, 30000);
    return () => clearInterval(interval);
  }, [pollStats]);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayCalls = calls.filter(c => new Date(c.createdAt).getTime() >= today);
    const bookedToday = todayCalls.filter(c => outcome(c) === 'booked');
    return {
      totalToday: todayCalls.length,
      bookedToday: bookedToday.length
    };
  }, [calls]);

  const handleTestCall = async () => {
    if (!userAssistantId) return alert('Agent not active. Please contact support to provision your assistant.');
    if (!testPhone || testPhone.trim().length < 10) {
      return alert('Please enter a valid 10-digit phone number.');
    }
    if (!phoneNumberId) {
      return alert('Error: No active VAPI phone number is assigned to this assistant.');
    }

    setIsCalling(true);
    try {
      await triggerSupportCall(testPhone, 'Platform Test User', userAssistantId, phoneNumberId);
      alert(`Connection established! Calling ${testPhone}...`);
    } catch (err) {
      alert('Call Failed: ' + err.message);
    } finally {
      setIsCalling(false);
    }
  };

  const exportCSV = () => {
    const headers = ['#', 'Caller', 'Number', 'Status', 'Response', 'Booked', 'Duration', 'Date & Time'];
    const rows = calls.map((c, i) => [
      calls.length - i,
      c.customer?.name || 'Unknown',
      c.customer?.number || '--',
      c.status,
      outcome(c),
      outcome(c) === 'booked' ? 'Yes' : 'No',
      dur(c.startedAt, c.endedAt),
      fmt(c.createdAt)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "call_logs.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto space-y-8 h-full overflow-y-auto animate-in fade-in duration-700 custom-scrollbar">
      {/* PAGE HEADER */}
      <header className="flex justify-between items-start border-b border-[var(--border)] pb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-[var(--text-primary)]">Voice Support Agent</h1>
          <p className="text-[var(--text-secondary)] mt-1">AI receptionist that never misses a call</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${agentLive ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          <div className={`w-2 h-2 rounded-full ${agentLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{agentLive ? 'Live' : 'Inactive'}</span>
        </div>
      </header>

      {/* AGENT OVERVIEW CARD */}
      <div className="bg-[var(--bg-card)] rounded-[12px] border-[0.5px] border-[var(--border)] p-6 space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] text-[var(--text-primary)] font-medium">Your AI Receptionist is Live</h2>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-green-400">Active</span>
          </div>
        </div>

        <div className="border-b-[0.5px] border-[var(--border)]" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">AGENT NAME</p>
            <p className="text-[16px] text-[var(--text-primary)] font-medium">{agentName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">CALLS TODAY</p>
            <p className="text-[16px] text-[var(--accent)] font-medium">{stats.totalToday}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">BOOKED TODAY</p>
            <p className="text-[16px] text-green-400 font-medium">{stats.bookedToday}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">PHONE NUMBER</p>
            <p className="text-[14px] text-[var(--text-secondary)] font-medium">{assignedNumber || 'Not connected'}</p>
          </div>
        </div>

        <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
          Your AI receptionist {agentName} answers every call to your business automatically — 24 hours a day, 7 days a week. 
          She greets callers, answers questions about your services, and books appointments directly. 
          Every call is recorded and logged below. You don't need to do anything — she just works.
        </p>
      </div>

      {/* CALL LOGS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
            <Activity size={18} className="text-[var(--accent)]" /> Call Logs
          </h3>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">#</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Caller</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Number</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Response</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Booked</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Recording</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {callsLoading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-[var(--accent)] mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Loading Logs...</p>
                    </td>
                  </tr>
                ) : calls.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">No call records found</p>
                    </td>
                  </tr>
                ) : (
                  calls.map((call, index) => {
                    const isBooked = outcome(call) === 'booked';
                    return (
                      <tr key={call.id} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{calls.length - index}</td>
                        <td className="px-6 py-4 text-xs font-medium text-[var(--text-primary)]">{call.customer?.name || call.metadata?.customerName || 'Unknown Caller'}</td>
                        <td className="px-6 py-4 text-xs text-[var(--text-secondary)]">
                          {call.customer?.number || (call.type === 'webCall' ? 'Web Interface' : (call.phoneCallProviderDetails?.from || '--'))}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-tighter text-[var(--text-muted)]">{call.status}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{outcome(call)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isBooked ? 'bg-green-500/15 text-green-400 border-green-400/20' : 'bg-white/5 text-[var(--text-muted)] border-white/10'}`}>
                            {isBooked ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{dur(call.startedAt, call.endedAt)}</td>
                        <td className="px-6 py-4 text-xs text-[var(--text-muted)]">{fmt(call.createdAt)}</td>
                        <td className="px-6 py-4">
                          {call.recordingUrl ? (
                            <button onClick={() => window.open(call.recordingUrl, '_blank')} className="w-8 h-8 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all">
                              <Play size={14} fill="currentColor" />
                            </button>
                          ) : '--'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAgentConfig;

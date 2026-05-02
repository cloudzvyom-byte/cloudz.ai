import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Phone, 
  MessageSquare, Search, Filter, 
  Download, ArrowLeft, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight,
  MoreVertical, CalendarDays, Activity,
  Zap, Video, Share2, Trash2, MapPin,
  Loader2
} from 'lucide-react';
import { getVapiCalls } from '../lib/vapi';

const StatusBadge = ({ status }) => {
  const styles = {
    'Confirmed': { bg: 'bg-[var(--success)]/10', text: 'text-[var(--success)]', border: 'border-[var(--success)]/30', icon: CheckCircle2 },
    'Booked': { bg: 'bg-[var(--success)]/10', text: 'text-[var(--success)]', border: 'border-[var(--success)]/30', icon: CheckCircle2 },
    'Pending': { bg: 'bg-[var(--warning)]/10', text: 'text-[var(--warning)]', border: 'border-[var(--warning)]/30', icon: AlertCircle },
    'Cancelled': { bg: 'bg-[var(--error)]/10', text: 'text-[var(--error)]', border: 'border-[var(--error)]/30', icon: XCircle },
  };

  const style = styles[status] || styles.Pending;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${style.bg} ${style.text} ${style.border} border text-[9px] font-black uppercase tracking-[0.15em]`}>
      <Icon size={12} className="stroke-[3px]" /> {status}
    </span>
  );
};

const Meetings = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingsList, setMeetingsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const calls = await getVapiCalls();
      
      // Filter for calls that mention booking or have structured meeting data
      // In a real scenario, we'd check for call.analysis?.meetingDetails or similar
      const formattedMeetings = calls.filter(call => {
        const summary = (call.summary || '').toLowerCase();
        return summary.includes('book') || summary.includes('schedule') || summary.includes('appointment');
      }).map((call, index) => {
        const summary = call.summary || 'No summary available.';
        
        // Basic extraction logic from summary
        // Format: "Meeting booked for 25th April at 2:00 PM"
        const dateMatch = summary.match(/(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+|\d{4}-\d{2}-\d{2})/i);
        const timeMatch = summary.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/i);
        
        // Format transcript if available
        const transcript = call.transcript ? [
          { role: 'agent', content: 'Interaction analysis complete. Booking confirmed based on session.', time: 'System Generated' },
          { role: 'user', content: summary, time: 'Summary' }
        ] : [];

        return {
          id: call.id || index,
          client: call.customer?.name || 'Unknown Client',
          phone: call.customer?.number || 'Unknown Number',
          problem: summary,
          date: dateMatch ? dateMatch[0].toUpperCase() : (call.startedAt ? new Date(call.startedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : 'TBD'),
          time: timeMatch ? timeMatch[0].toUpperCase() : (call.startedAt ? new Date(call.startedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'),
          status: summary.toLowerCase().includes('confirm') ? 'Confirmed' : 'Booked',
          location: 'Neural Video Bridge',
          transcript: transcript,
          rawCall: call
        };
      });

      setMeetingsList(formattedMeetings);
    } catch (err) {
      console.error("Failed to fetch meeting data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this interaction node?')) {
      setMeetingsList(prev => prev.filter(m => m.id !== selectedMeeting.id));
      setSelectedMeeting(null);
    }
  };

  const filteredMeetings = meetingsList.filter(m => 
    m.client.toLowerCase().includes(search.toLowerCase()) || 
    m.problem.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedMeeting) {
    return (
      <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-500 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
        <header className="flex items-center justify-between mb-12">
          <button 
            onClick={() => setSelectedMeeting(null)}
            className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Appointment Stream
          </button>
          <div className="flex gap-4">
            <button className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] text-[var(--text-muted)] hover:text-white transition-all hover:border-[var(--accent)]">
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] text-[var(--error)] hover:bg-[var(--error)]/10 transition-all border-[var(--error)]/20"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 min-h-0">
          <div className="lg:col-span-8 bg-[var(--bg-card)] border border-[var(--border)] rounded-[40px] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />
            
            <div className="p-8 border-b border-[var(--border)] flex justify-between items-center bg-gradient-to-br from-[var(--bg-hover)] to-transparent">
              <h3 className="font-medium flex items-center gap-3 text-white">
                <MessageSquare size={20} className="text-[var(--accent)]" /> Booking Context
              </h3>
              <StatusBadge status={selectedMeeting.status} />
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {selectedMeeting.transcript.length > 0 ? (
                selectedMeeting.transcript.map((msg, i) => (
                  <div key={i} className={`flex gap-6 ${msg.role === 'agent' ? '' : 'flex-row-reverse text-right'}`}>
                    <div className={`w-12 h-12 rounded-[18px] flex-shrink-0 flex items-center justify-center text-xs font-black shadow-lg ${msg.role === 'agent' ? 'bg-[var(--accent)] text-[#0A0A0A]' : 'bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-secondary)]'}`}>
                      {msg.role === 'agent' ? 'AI' : 'CU'}
                    </div>
                    <div className={`max-w-[75%] space-y-3 ${msg.role === 'agent' ? 'items-start' : 'items-end'}`}>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{msg.role === 'agent' ? 'Clouds Analysis' : selectedMeeting.client}</p>
                      <div className={`p-6 rounded-[28px] text-[13px] leading-relaxed shadow-xl border ${msg.role === 'agent' ? 'bg-[#111111] rounded-tl-none border-[var(--border)] text-[var(--text-secondary)]' : 'bg-[var(--accent-tint)] rounded-tr-none border-[var(--accent)]/30 text-white font-medium'}`}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{msg.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
                  <CalendarDays size={48} className="opacity-20 animate-pulse" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No Context Logs Available</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl">
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <User size={14} className="text-[var(--accent)]" /> Client Interaction
              </h4>
              <div className="space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-inner">
                    <User size={32} />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-white tracking-tight">{selectedMeeting.client}</p>
                    <p className="text-xs font-bold text-[var(--text-muted)] mt-1">{selectedMeeting.phone}</p>
                  </div>
                </div>
                <div className="pt-8 border-t border-[var(--border)]">
                  <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">Requirement Summary</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium italic">"{selectedMeeting.problem}"</p>
                </div>
              </div>
            </section>

            <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[40px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                <Clock size={80} className="text-white" />
              </div>
              <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <Calendar size={14} className="text-[var(--accent)]" /> Schedule Node
              </h4>
              <div className="space-y-5 relative z-10">
                <div className="flex items-center gap-4 bg-[var(--bg-input)] p-4 rounded-[20px] border border-[var(--border)]">
                  <CalendarDays size={20} className="text-[var(--accent)]" />
                  <span className="text-sm font-bold text-white tracking-widest">{selectedMeeting.date}</span>
                </div>
                <div className="flex items-center gap-4 bg-[var(--bg-input)] p-4 rounded-[20px] border border-[var(--border)]">
                  <Clock size={20} className="text-[var(--accent)]" />
                  <span className="text-sm font-bold text-white tracking-widest">{selectedMeeting.time}</span>
                </div>
                <div className="flex items-center gap-4 bg-[var(--bg-input)] p-4 rounded-[20px] border border-[var(--border)]">
                  <MapPin size={20} className="text-[var(--accent)]" />
                  <span className="text-sm font-bold text-white tracking-widest">{selectedMeeting.location}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-700 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/30 rounded-full mb-2">
            <Activity size={12} className="text-[var(--accent)]" />
            <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest">Appointment Sync Active</span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-white">Appointments <span className="text-[var(--accent)]">& Sessions</span>.</h1>
          <p className="text-[var(--text-secondary)] text-lg">Centralized command for all meetings provisioned by your AI workforce.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:border-[var(--accent)] transition-all">
            <Download size={18} /> Export List
          </button>
          <button 
            onClick={fetchMeetings}
            className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all shadow-[0_20px_50px_var(--accent-tint)]"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />} Cloud Sync
          </button>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative group">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search by client, requirement payload, or node ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-[24px] pl-16 pr-8 py-5 text-sm focus:outline-none focus:border-[var(--accent)] transition-all placeholder-[var(--text-muted)] text-white font-medium shadow-xl"
          />
        </div>
        <button className="px-8 py-5 flex items-center gap-3 bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-white hover:border-[var(--accent)] transition-all shadow-xl">
          <Filter size={20} /> Advanced Filters
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[40px] overflow-hidden shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111111]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-10 py-6 font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-[9px]">Client Status</th>
              <th className="px-10 py-6 font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-[9px]">Requirement Summary</th>
              <th className="px-10 py-6 font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-[9px]">Schedule Node</th>
              <th className="px-10 py-6 font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-[9px]">Verification Status</th>
              <th className="px-10 py-6 font-black text-[var(--text-muted)] uppercase tracking-[0.2em] text-[9px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Appointment Buffers...</p>
                  </div>
                </td>
              </tr>
            ) : filteredMeetings.length > 0 ? (
              filteredMeetings.map((m) => (
                <tr 
                  key={m.id} 
                  className="hover:bg-[var(--bg-hover)] transition-all group cursor-pointer"
                  onClick={() => setSelectedMeeting(m)}
                >
                  <td className="px-10 py-6">
                    <div>
                      <p className="font-bold text-white text-base tracking-tight">{m.client}</p>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{m.phone}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium italic truncate max-w-[200px]">"{m.problem}"</p>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-white uppercase tracking-widest">{m.date}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-black">{m.time}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-3 hover:text-[var(--accent)] hover:bg-[var(--accent-tint)] rounded-xl transition-all"><MessageSquare size={18} /></button>
                      <button className="p-3 hover:text-white hover:bg-[var(--bg-input)] rounded-xl transition-all"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <CalendarDays size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Appointment Nodes Detected</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Meetings;



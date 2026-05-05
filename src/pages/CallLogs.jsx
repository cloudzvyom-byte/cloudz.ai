import React, { useState, useEffect } from 'react';
import { 
  Phone, Calendar, Clock, Search, 
  Download, Play, MoreVertical, Filter,
  CheckCircle2, XCircle, AlertCircle, PhoneIncoming,
  FileText, Database, User, Trash2, RotateCcw
} from 'lucide-react';
import { getVapiCalls } from '../lib/vapi';

const STATUS_MAP = {
  'Answered': { icon: CheckCircle2, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/10', border: 'border-[var(--success)]/20' },
  'No Answer': { icon: XCircle, color: 'text-[var(--error)]', bg: 'bg-[var(--error)]/10', border: 'border-[var(--error)]/20' },
  'Busy': { icon: AlertCircle, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning)]/10', border: 'border-[var(--warning)]/20' }
};

const CallLogs = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'appointments'
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const calls = await getVapiCalls();
      const formattedLogs = calls.map((call, index) => {
        let durationStr = '0m 00s';
        if (call.startedAt && call.endedAt) {
          const start = new Date(call.startedAt);
          const end = new Date(call.endedAt);
          const diffSecs = Math.floor((end - start) / 1000);
          const m = Math.floor(diffSecs / 60);
          const s = diffSecs % 60;
          durationStr = `${m}m ${s < 10 ? '0' : ''}${s}s`;
        }
        
        let statusStr = 'Answered';
        if (call.endedReason === 'customer-did-not-answer' || call.endedReason === 'voicemail') statusStr = 'No Answer';
        else if (call.endedReason === 'customer-busy') statusStr = 'Busy';
        
        const dateStr = call.startedAt ? new Date(call.startedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Unknown';

        const isOutbound = call.type === 'outboundPhoneCall' || call.direction === 'outbound';
        const summary = (call.summary || call.analysis?.summary || '').toLowerCase();
        const booked = summary.includes('book') || summary.includes('confirm') || summary.includes('scheduled');

        return {
          id: call.id || index,
          type: isOutbound ? 'Outbound' : 'Inbound',
          name: call.customer?.name || call.metadata?.customerName || 'Unknown Caller',
          number: call.customer?.number || (call.type === 'webCall' ? '[Web Call]' : (call.direction === 'inbound' ? call.phoneCallProviderDetails?.from : call.phoneCallProviderDetails?.to)) || 'Unknown',
          status: statusStr,
          response: call.summary || call.analysis?.summary || '-',
          booked: booked ? 'Yes' : 'No',
          duration: durationStr,
          date: dateStr,
          recordingUrl: call.recordingUrl,
          campaign: call.assistantOverrides?.variableValues?.campaignName || call.metadata?.campaignId || (isOutbound ? 'Outbound Campaign' : 'Direct Inbound')
        };
      });
      setLogs(formattedLogs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = (format) => {
    console.log(`Exporting as ${format}...`);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setLogs(logs.filter(log => log.id !== id));
  };

  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(search.toLowerCase()) || 
    log.number.toLowerCase().includes(search.toLowerCase())
  );

  const appointments = logs.filter(log => log.booked === 'Yes');

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--accent-tint)] border border-[var(--accent)]/20 rounded-full">
            <Database size={12} className="text-[var(--accent)]" />
            <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest">Neural Telemetry Data</span>
          </div>
          <h1 className="text-4xl font-medium tracking-tight text-white">Call <span className="text-[var(--accent)]">Intelligence</span>.</h1>
          <p className="text-[var(--text-secondary)] text-base font-medium max-w-xl">Comprehensive logs of all neural voice interactions and inbound/outbound engagement telemetry.</p>
        </div>
        
        <div className="flex gap-3 lg:gap-4 flex-wrap">
          <button 
            onClick={() => fetchLogs()}
            className="px-6 py-3 bg-[var(--accent)] text-black text-[10px] font-black uppercase tracking-widest rounded-[12px] hover:bg-[var(--accent-hover)] transition-all flex items-center gap-2 shadow-lg"
          >
            <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh Telemetry
          </button>
          <button 
            onClick={() => handleExport('CSV')}
            className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-white rounded-[12px] hover:bg-[var(--bg-hover)] transition-all flex items-center gap-2"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-[var(--border)] pb-1">
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'logs' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white'}`}
        >
          All Neural Logs
          {activeTab === 'logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-in slide-in-from-left duration-300" />}
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'appointments' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white'}`}
        >
          Booked Appointments
          {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] animate-in slide-in-from-left duration-300" />}
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[24px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111111]/30">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Filter nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-[12px] py-3 pl-12 pr-6 text-xs focus:outline-none focus:border-[var(--accent)] transition-all"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Showing {activeTab === 'logs' ? filteredLogs.length : appointments.length} Vector Points
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[1100px]">
            <thead className="bg-[#111111]/50 border-b border-[var(--border)]">
              <tr>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Type</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Identity</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Source/Campaign</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">State</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Booked</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Duration</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px]">Timestamp</th>
                <th className="px-8 py-5 font-black text-[var(--text-muted)] uppercase tracking-widest text-[9px] text-right">Telemetry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {(activeTab === 'logs' ? filteredLogs : appointments).map((log) => {
                const Status = STATUS_MAP[log.status];
                return (
                  <tr key={log.id} className="hover:bg-[var(--bg-hover)] transition-all group cursor-pointer animate-in fade-in duration-500">
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border w-fit ${log.type === 'Inbound' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {log.type === 'Inbound' ? <PhoneIncoming size={12} /> : <Phone size={12} className="rotate-[135deg]" />}
                        {log.type}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] group-hover:border-[var(--accent)] transition-all">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm tracking-tight">{log.name}</p>
                          <p className="text-[10px] font-medium text-[var(--text-muted)] tracking-wider mt-0.5">{log.number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        {log.campaign}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${Status?.color || 'text-[var(--text-muted)]'} ${Status?.bg || 'bg-[var(--bg-input)]'} ${Status?.border || 'border-[var(--border)]'}`}>
                        {Status && <Status.icon size={12} />} {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.booked === 'Yes' ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20' : 'bg-white/5 text-[var(--text-muted)] border-white/10'}`}>
                        {log.booked === 'Yes' && <CheckCircle2 size={12} />}
                        {log.booked === 'Yes' ? 'Confirmed' : 'No'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-xs">
                        <Clock size={12} /> {log.duration}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium text-xs">
                        <Calendar size={12} /> {log.date}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => log.recordingUrl && window.open(log.recordingUrl, '_blank')}
                          className={`p-3 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] transition-all shadow-sm ${log.recordingUrl ? 'text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#0A0A0A]' : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'}`}
                          title={log.recordingUrl ? "Play Recording" : "No Recording"}
                        >
                          <Play size={14} fill="currentColor" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(log.id, e)}
                          className="p-3 rounded-[10px] bg-[var(--bg-input)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--error)] hover:border-[var(--error)]/30 transition-all shadow-sm"
                          title="Delete Log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default CallLogs;

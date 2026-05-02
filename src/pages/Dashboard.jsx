import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Users, Phone, Zap, 
  TrendingUp, ArrowUpRight, ArrowDownRight,
  Calendar, MessageSquare, Play, ChevronRight,
  Activity, ShieldCheck, Target, Clock, Search,
  Loader2, PhoneIncoming, Sparkles
 } from 'lucide-react';
import { getVapiCalls } from '../lib/vapi';

const StatCard = ({ label, value, change, trend, icon: Icon, color }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 hover:border-[var(--accent)] transition-all duration-500 group relative overflow-hidden">
    {/* Decorative Glow */}
    <div className={`absolute top-0 right-0 w-24 h-24 opacity-[0.03] rounded-full blur-[40px] -mr-12 -mt-12 group-hover:opacity-10 transition-opacity bg-current ${color}`} />
    
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-[18px] ${color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={28} className="text-white" />
      </div>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full ${trend === 'up' ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20' : trend === 'down' ? 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20' : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--border)]'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : trend === 'down' ? <ArrowDownRight size={14} /> : null} {change}
      </div>
    </div>
    <div>
      <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-4xl font-medium tracking-tighter text-[var(--text-primary)]">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    conversion: '0.0%',
    throughput: '00',
    nodes: '00',
    hoursSaved: '0h',
    inboundToday: '0',
    appointmentsToday: '0',
    throughputTrend: 'neutral',
    throughputChange: '0.0%'
  });
  const [activity, setActivity] = useState([]);
  const [chartData, setChartData] = useState([5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
  const [isLoading, setIsLoading] = useState(true);
  const [liveCall, setLiveCall] = useState(null); // Mock live call

  const fetchTelemetry = async () => {
    setIsLoading(true);
    try {
      const calls = await getVapiCalls();
      
      const throughput = calls.length;
      const nodes = new Set(calls.map(c => c.assistantId)).size;
      
      const totalDurationSecs = calls.reduce((acc, call) => {
        if (call.startedAt && call.endedAt) {
          return acc + Math.floor((new Date(call.endedAt) - new Date(call.startedAt)) / 1000);
        }
        return acc;
      }, 0);
      const hoursSaved = Math.max(0, (totalDurationSecs / 3600)).toFixed(1);

      const successCalls = calls.filter(c => {
        const summary = (c.summary || c.analysis?.summary || '').toLowerCase();
        return summary.includes('book') || summary.includes('success') || summary.includes('confirm');
      }).length;
      const conversion = throughput > 0 ? ((successCalls / throughput) * 100).toFixed(1) : '0.0';

      const today = new Date().toDateString();
      const inboundToday = calls.filter(c => 
        (new Date(c.createdAt).toDateString() === today) && 
        (c.type === 'inboundPhoneCall' || c.direction === 'inbound')
      ).length;

      const appointmentsToday = calls.filter(c => {
        const summary = (c.summary || c.analysis?.summary || '').toLowerCase();
        return (new Date(c.createdAt).toDateString() === today) && 
               (summary.includes('book') || summary.includes('confirm'));
      }).length;

      setStats({
        conversion: `${conversion}%`,
        throughput: throughput.toString().padStart(2, '0'),
        nodes: nodes.toString().padStart(2, '0'),
        hoursSaved: `${hoursSaved}h`,
        inboundToday: inboundToday.toString(),
        appointmentsToday: appointmentsToday.toString(),
        throughputTrend: throughput > 0 ? 'up' : 'neutral',
        throughputChange: throughput > 0 ? `+${throughput}` : '0.0%'
      });

      const recentCalls = calls.slice(0, 5).map(c => ({
        id: c.id,
        type: c.type === 'inboundPhoneCall' || c.direction === 'inbound' ? 'Inbound' : 'Outbound',
        client: c.customer?.name || c.customer?.number || 'Unknown',
        time: c.startedAt ? new Date(c.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        booked: (c.summary || c.analysis?.summary || '').toLowerCase().includes('book')
      }));
      setActivity(recentCalls);

      // Check for any "ongoing" calls (mocked if none found)
      const ongoing = calls.find(c => c.status === 'in-progress' || c.status === 'ringing');
      if (ongoing) setLiveCall(ongoing);

    } catch (err) {
      console.error("Dashboard Telemetry Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 h-full overflow-y-auto animate-in fade-in duration-700 selection:bg-[var(--accent)] selection:text-[#0A0A0A]">
      
      {/* Live Call Banner */}
      {liveCall && (
        <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-[20px] p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--success)]">Live Call In Progress</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">{liveCall.customer?.number || 'Private Caller'}</span>
          </div>
          <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Routing to Customer Support Assistant
          </div>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-full mb-2">
            <Activity size={12} className={isLoading ? "text-[var(--accent)] animate-pulse" : "text-[var(--text-muted)]"} />
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {isLoading ? "Synchronizing Telemetry..." : "Neural Grid Operational"}
            </span>
          </div>
          <h1 className="text-5xl font-medium tracking-tighter text-[var(--text-primary)]">System <span className="text-[var(--accent)]">Overview</span>.</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-xl">
            Vyom, your neural workforce is currently <span className="text-[var(--text-primary)] font-medium">active</span>. Monitoring <span className="text-[var(--accent)] font-bold">{stats.throughput}</span> total interaction nodes.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchTelemetry}
            className="px-8 py-4 bg-[var(--accent)] text-[#0A0A0A] rounded-[18px] text-xs font-bold uppercase tracking-[0.2em] hover:bg-[var(--accent-hover)] transition-all shadow-xl flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />} Refresh Intelligence
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Inbound Calls Today" 
          value={stats.inboundToday} 
          change="Real-time" 
          trend="up" 
          icon={Phone} 
          color="text-blue-400" 
        />
        <StatCard 
          label="Appointments Booked" 
          value={stats.appointmentsToday} 
          change="Conversion" 
          trend="up" 
          icon={Calendar} 
          color="text-green-400" 
        />
        <StatCard 
          label="Neural Throughput" 
          value={stats.throughput} 
          change={stats.throughputChange} 
          trend={stats.throughputTrend} 
          icon={Zap} 
          color="text-orange-400" 
        />
        <StatCard 
          label="Conversion Quotient" 
          value={stats.conversion} 
          change="Global Avg" 
          trend="neutral" 
          icon={Target} 
          color="text-purple-400" 
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <Activity size={20} className="text-[var(--accent)]" /> 
            Recent Operational Nodes
          </h3>
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] overflow-hidden">
            <div className="divide-y divide-[var(--border)]/50">
              {activity.map((node) => (
                <div key={node.id} className="p-6 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${node.type === 'Inbound' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
                      {node.type === 'Inbound' ? <PhoneIncoming size={16} /> : <Phone size={16} className="rotate-[135deg]" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">{node.client}</p>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{node.type} Node · {node.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {node.booked && (
                      <span className="px-3 py-1 bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-[9px] font-black uppercase tracking-widest rounded-full">
                        Meeting Booked
                      </span>
                    )}
                    <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:text-white transition-all" />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full p-4 bg-[var(--bg-input)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-all">
              View Full Neural Log Archive
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-medium text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <Zap size={20} className="text-[var(--accent)]" /> 
            System Insights
          </h3>
          <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] rounded-[32px] p-8 text-black shadow-xl">
            <Sparkles size={32} className="mb-6" />
            <h4 className="text-2xl font-bold leading-tight mb-4">Neural Node Optimization</h4>
            <p className="text-sm font-medium opacity-80 leading-relaxed mb-8">
              Your "Customer Support" agent is currently resolving 84% of inbound queries autonomously. Consider adding more knowledge base documents to reach 95%.
            </p>
            <button className="w-full py-4 bg-black text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
              Enhance Knowledge Base
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};


export default Dashboard;

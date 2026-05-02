import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Invoice from '../components/Invoice';
import { 
  BarChart3, Users, CreditCard, Shield, 
  Settings, Bell, Search, ArrowRight,
  TrendingUp, Activity, PieChart, Database,
  Plus, Send, Layout, Cpu, Trash2, X,
  Image as ImageIcon, Link as LinkIcon, FileText,
  UserPlus, Mail, Globe, CheckCircle2, Clock,
  Download, Ban, PlayCircle, StopCircle, Receipt,
  ArrowDownRight, Calculator, Landmark, TrendingDown,
  AlertCircle, Phone
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newsForm, setNewsForm] = useState({ title: '', description: '', image_url: '', link_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState(null);
  
  const [vapiSettings, setVapiSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('vapi_settings')) || { privateKey: '', assistantId: '', phoneNumberId: '' };
  });
  const [vapiTestStatus, setVapiTestStatus] = useState(null);
  // DATA RESET TO ZERO
  const [accountingData, setAccountingData] = useState([]);
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: Layout },
    { id: 'accounting', name: 'Accounting & ROI', icon: Landmark },
    { id: 'payments', name: 'Revenue & Razorpay', icon: CreditCard },
    { id: 'subscriptions', name: 'Subscriptions', icon: Activity },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'broadcast', name: 'Push Protocol', icon: Send },
    { id: 'vapi', name: 'VAPI Configuration', icon: Phone },
  ];

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('news').insert([newsForm]);
      if (error) throw error;
      setNewsForm({ title: '', description: '', image_url: '', link_url: '' });
      setShowForm(false);
      alert('News Protocol Broadcasted Successfully.');
    } catch (err) {
      alert('Error broadcasting news: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = (data, filename) => {
    if (data.length === 0) {
      alert('No data available for export.');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.body.appendChild(document.createElement("a"));
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    link.click();
  };

  const handleNuclearReset = async () => {
    if (window.confirm('CRITICAL: This will erase all platform data permanently. Proceed?')) {
       setAccountingData([]);
       setSubscriptionsData([]);
       setUsersData([]);
       alert('System Purged. All data vectors at zero.');
    }
  };

  const handleSaveVapiSettings = async () => {
    localStorage.setItem('vapi_settings', JSON.stringify(vapiSettings));
    
    try {
      const settingsToSave = [
        { key: 'vapi_private_key', value: vapiSettings.privateKey },
        { key: 'vapi_assistant_id', value: vapiSettings.assistantId },
        { key: 'vapi_phone_number_id', value: vapiSettings.phoneNumberId }
      ];

      for (const setting of settingsToSave) {
        if (setting.value) {
          await supabase.from('admin_settings').upsert({ key: setting.key, value: setting.value }, { onConflict: 'key' });
        }
      }
      alert('VAPI Configuration Saved to Local & Database.');
    } catch (err) {
      console.error('DB Save Error:', err);
      alert('Saved locally, but failed to sync with Database: ' + err.message);
    }
  };

  const testVapiConnection = async () => {
    if (!vapiSettings.privateKey || !vapiSettings.assistantId) {
      setVapiTestStatus('✗ Missing API Key or Assistant ID');
      return;
    }
    setVapiTestStatus('Testing connection...');
    try {
      const res = await fetch(`https://api.vapi.ai/assistant/${vapiSettings.assistantId}`, {
        headers: { 'Authorization': `Bearer ${vapiSettings.privateKey}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setVapiTestStatus(`✓ Connected — Assistant: ${data.name || 'Neural Agent'}`);
      } else {
        if (res.status === 401) setVapiTestStatus('✗ 401: Invalid API Key');
        else if (res.status === 404) setVapiTestStatus('✗ 404: Assistant ID Not Found');
        else setVapiTestStatus(`✗ Error: ${data.message || 'Connection failed'}`);
      }
    } catch (e) {
      setVapiTestStatus('✗ Network Error — Check connection');
    }
  };

  const EmptyState = ({ label }) => (
    <div className="flex flex-col items-center justify-center p-24 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 opacity-20">
        <Database size={32} />
      </div>
      <h3 className="text-xl font-medium text-white mb-2 tracking-tight">No Data Available</h3>
      <p className="text-gray-500 text-sm max-w-xs mx-auto uppercase tracking-widest font-black opacity-50">
        {label} ledger is currently empty.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[var(--accent)] selection:text-[#0A0A0A] overflow-hidden flex">
      
      {selectedInvoiceData && (
        <Invoice data={selectedInvoiceData} onClose={() => setSelectedInvoiceData(null)} />
      )}

      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0F0F0F] border-r border-white/5 flex flex-col p-6 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <Shield size={24} className="text-orange-500" />
          <span className="text-lg font-black tracking-tighter uppercase italic">Clouds Admin.</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[12px] text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-orange-500 text-black shadow-xl shadow-orange-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={18} />
              <span className="uppercase tracking-widest">{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <button onClick={handleNuclearReset} className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[10px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest">
            <Trash2 size={16} /> Nuclear Reset
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-12 h-screen">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="text-5xl font-medium tracking-tight">System <span className="text-orange-500">Telemetry</span>.</h1>
                <p className="text-gray-400 text-lg font-medium">Global platform performance and operational metrics.</p>
              </div>
              <button 
                onClick={() => handleExportData(accountingData, 'system_telemetry')}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Download size={14} /> Export Overview
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Revenue', value: '₹0.00', trend: '0%', icon: TrendingUp },
                { label: 'Active Users', value: '00', trend: '0%', icon: Users },
                { label: 'Live Clusters', value: '00', trend: '0%', icon: Cpu },
                { label: 'System Uptime', value: '100%', trend: 'Idle', icon: Activity },
              ].map((stat, i) => (
                <div key={i} className="bg-[#141414] border border-white/5 rounded-[20px] p-6 hover:border-orange-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                      <stat.icon size={20} />
                    </div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stat.trend}</span>
                  </div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-medium tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[24px] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-medium tracking-tight">Recent Provisioning Logs</h3>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Updates Off</span>
              </div>
              <div className="py-20 text-center opacity-20">
                <AlertCircle size={32} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Provisioning Logs Detected</p>
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNTING */}
        {activeTab === 'accounting' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="text-5xl font-medium tracking-tight">Accounting <span className="text-orange-500">Ledger</span>.</h1>
                <p className="text-gray-400 text-lg font-medium">Profit and loss analysis per neural node authorization.</p>
              </div>
              <button 
                onClick={() => handleExportData(accountingData, 'accounting_ledger')}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-[12px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Download size={14} /> Export Financials
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 border border-white/5 rounded-[24px] p-8 flex items-center gap-6 opacity-40">
                <div className="w-14 h-14 bg-white/5 rounded-[18px] flex items-center justify-center text-gray-400">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Net Profit</p>
                  <p className="text-3xl font-medium tracking-tighter">₹0.00</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[24px] p-8 flex items-center gap-6 opacity-40">
                <div className="w-14 h-14 bg-white/5 rounded-[18px] flex items-center justify-center text-gray-400">
                  <TrendingDown size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Platform Loss</p>
                  <p className="text-3xl font-medium tracking-tighter">₹0.00</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-[24px] p-8 flex items-center gap-6 opacity-40">
                <div className="w-14 h-14 bg-white/5 rounded-[18px] flex items-center justify-center text-gray-400">
                  <Calculator size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Average ROI</p>
                  <p className="text-3xl font-medium tracking-tighter">0.0%</p>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[24px] overflow-hidden">
              {accountingData.length === 0 ? <EmptyState label="Financial" /> : (
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">User Identity</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest">Paid Date</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-right">Revenue</th>
                      <th className="px-8 py-5 text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Rows would go here if data existed */}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-4xl font-medium tracking-tight">Subscription <span className="text-orange-500">Ledger</span>.</h1>
            <div className="bg-[#141414] border border-white/5 rounded-[24px] overflow-hidden">
              {subscriptionsData.length === 0 ? <EmptyState label="Subscription" /> : (
                <table className="w-full text-left">
                   {/* Table structure */}
                </table>
              )}
            </div>
          </div>
        )}

        {/* USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-4xl font-medium tracking-tight">User <span className="text-orange-500">Management</span>.</h1>
            <div className="bg-[#141414] border border-white/5 rounded-[24px] overflow-hidden">
              {usersData.length === 0 ? <EmptyState label="User Management" /> : (
                <table className="w-full text-left">
                   {/* Table structure */}
                </table>
              )}
            </div>
          </div>
        )}

        {/* BROADCAST */}
        {activeTab === 'broadcast' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
             <div className="space-y-4 flex justify-between items-end">
               <h1 className="text-4xl font-medium tracking-tight">Push <span className="text-orange-500">Protocol</span>.</h1>
               <button onClick={() => setShowForm(!showForm)} className="px-8 py-4 bg-orange-500 text-black rounded-[12px] text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-3">
                 {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'Cancel Protocol' : 'New Broadcast'}
               </button>
             </div>
             {showForm ? (
               <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 max-w-3xl animate-in slide-in-from-top-4 duration-500">
                 <form onSubmit={handleCreateNews} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Broadcast Title</label>
                      <input required type="text" value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cover Image Attachment</label>
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-[12px] bg-white/5 hover:bg-white/10 hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden">
                        {newsForm.image_url ? (
                          <div className="absolute inset-0 bg-cover bg-center z-10" style={{ backgroundImage: `url(${newsForm.image_url})` }}>
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                              <span className="text-xs font-black uppercase tracking-widest text-white">Replace Image</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon size={24} className="text-gray-500 group-hover:text-orange-500 mb-3 transition-colors" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-bold text-white">Click to upload</span> or drag and drop</p>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SVG, PNG, JPG (MAX. 5MB)</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setNewsForm({
                                ...newsForm, 
                                image_file: file, 
                                image_url: URL.createObjectURL(file)
                              });
                            }
                          }} 
                        />
                      </label>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Article Description</label>
                      <textarea required rows="4" value={newsForm.description} onChange={e => setNewsForm({...newsForm, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none resize-none" />
                    </div>
                    <div className="pt-6 flex gap-4">
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-orange-500 text-black rounded-[16px] text-xs font-black uppercase tracking-widest">Authorize Broadcast</button>
                      <button type="button" onClick={() => setShowForm(false)} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[16px] text-xs font-black uppercase tracking-widest">X</button>
                    </div>
                 </form>
               </div>
             ) : <EmptyState label="Broadcast" />}
           </div>
        )}

        {/* VAPI CONFIGURATION */}
        {activeTab === 'vapi' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <h1 className="text-4xl font-medium tracking-tight">VAPI <span className="text-orange-500">Configuration</span>.</h1>
            <div className="bg-[#141414] border border-white/5 rounded-[32px] p-10 max-w-2xl shadow-2xl">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">VAPI Private Key</label>
                  <input type="password" value={vapiSettings.privateKey} onChange={e => setVapiSettings({...vapiSettings, privateKey: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" placeholder="vapi_xxxxxxxxxxxxxxxx" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">VAPI Assistant ID</label>
                  <input type="text" value={vapiSettings.assistantId} onChange={e => setVapiSettings({...vapiSettings, assistantId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" placeholder="asst_xxxxxxxxxxxxxxxx" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">VAPI Phone Number ID</label>
                  <input type="text" value={vapiSettings.phoneNumberId} onChange={e => setVapiSettings({...vapiSettings, phoneNumberId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" placeholder="pn_xxxxxxxxxxxxxxxx" />
                </div>
                <div className="pt-6 flex gap-4">
                  <button onClick={handleSaveVapiSettings} className="flex-1 py-5 bg-orange-500 text-black rounded-[16px] text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all">Save Configuration</button>
                  <button onClick={testVapiConnection} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[16px] text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Test Connection</button>
                </div>
                
                {/* Environment Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-[12px] border flex items-center justify-between ${import.meta.env.VITE_VAPI_PRIVATE_KEY ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">VAPI Key (ENV)</span>
                    <span className="text-[8px] font-bold">{import.meta.env.VITE_VAPI_PRIVATE_KEY ? 'DETECTED' : 'MISSING'}</span>
                  </div>
                  <div className={`p-3 rounded-[12px] border flex items-center justify-between ${import.meta.env.VITE_RAZORPAY_KEY_ID ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                    <span className="text-[8px] font-black uppercase tracking-widest">Razorpay (ENV)</span>
                    <span className="text-[8px] font-bold">{import.meta.env.VITE_RAZORPAY_KEY_ID ? 'DETECTED' : 'MISSING'}</span>
                  </div>
                </div>

                {vapiTestStatus && (
                  <div className={`p-5 rounded-[16px] text-xs font-black uppercase tracking-widest text-center border mt-4 ${vapiTestStatus.includes('Connected') ? 'bg-green-500/10 text-green-500 border-green-500/20' : vapiTestStatus.includes('Testing') ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                    {vapiTestStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAYMENTS & RAZORPAY */}
        {activeTab === 'payments' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            <header className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="text-5xl font-medium tracking-tight">Revenue & <span className="text-orange-500">Razorpay</span>.</h1>
                <p className="text-gray-400 text-lg font-medium">Configure financial gateways and monitor capital flow.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Razorpay Config */}
              <div className="lg:col-span-2 bg-[#141414] border border-white/5 rounded-[32px] p-10 space-y-8 shadow-2xl">
                <h3 className="text-xl font-medium flex items-center gap-3">
                  <CreditCard className="text-orange-500" /> Razorpay Integration
                </h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Razorpay Key ID</label>
                    <input 
                      type="text" 
                      value={vapiSettings.razorpayKeyId || ''} 
                      onChange={e => setVapiSettings({...vapiSettings, razorpayKeyId: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" 
                      placeholder="rzp_test_xxxxxxxxxxxxxx" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Razorpay Secret Key</label>
                    <input 
                      type="password" 
                      value={vapiSettings.razorpaySecret || ''} 
                      onChange={e => setVapiSettings({...vapiSettings, razorpaySecret: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-6 py-4 text-sm focus:outline-none" 
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" 
                    />
                  </div>
                  <div className="pt-4">
                    <button 
                      onClick={handleSaveVapiSettings}
                      className="w-full py-5 bg-orange-500 text-black rounded-[16px] text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/10"
                    >
                      Sync Razorpay Protocol
                    </button>
                  </div>
                </div>
              </div>

              {/* Revenue Stats */}
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/5 rounded-[24px] p-8 flex items-center gap-6">
                  <div className="w-14 h-14 bg-orange-500/10 rounded-[18px] flex items-center justify-center text-orange-500">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">MDR Revenue</p>
                    <p className="text-3xl font-medium tracking-tighter">₹0.00</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-[24px] p-8 flex items-center gap-6">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-[18px] flex items-center justify-center text-blue-500">
                    <Activity size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Orders</p>
                    <p className="text-3xl font-medium tracking-tighter">00</p>
                  </div>
                </div>
                <div className="p-8 bg-white/5 border border-white/5 rounded-[24px] flex flex-col gap-4 opacity-50 italic text-[10px] text-gray-500 font-medium uppercase tracking-widest text-center">
                  <Globe className="mx-auto" size={24} />
                  Global Gateway Status: Active (Testing)
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-[24px] overflow-hidden">
              <EmptyState label="Transaction" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

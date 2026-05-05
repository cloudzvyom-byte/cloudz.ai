import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard, Bot, Megaphone, PhoneCall, 
  Users, CreditCard, Settings, Bell, Palette, 
  LogOut, Search, User, ChevronRight, Zap,
  Activity, Sparkles, Command, Check, X, Clock,
  Newspaper, Info, ArrowRight, ExternalLink,
  MessageSquare, PanelLeftClose, PanelLeft, Mic, Square
} from 'lucide-react';
import Vapi from '@vapi-ai/web';


/* ─── Operon Logo ────────────────────────────────────────────────── */
export const OperonLogo = ({ size = 28 }) => (
  <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,107,26,0.3)]">
      <defs>
        <linearGradient id="logo-cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B1A" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF1A6B" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path 
        d="M25 65 A15 15 0 0 1 25 35 A20 20 0 0 1 65 35 A15 15 0 0 1 65 65 Z" 
        fill="url(#logo-cloud-grad)" 
      />
      <circle cx="45" cy="40" r="18" fill="url(#logo-cloud-grad)" />
      <circle cx="65" cy="50" r="15" fill="url(#logo-cloud-grad)" />
      <circle cx="35" cy="50" r="15" fill="url(#logo-cloud-grad)" />
    </svg>
  </div>
);



const DashboardLayout = ({ children, user }) => {
  const { theme, setTheme } = useTheme();
  const { notifications, news, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState('news'); // 'news' or 'system'
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [salesDialerOpen, setSalesDialerOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  
  const location = useLocation();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    
    // Aggressively clear all local auth data immediately
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any Supabase-specific keys specifically just in case
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });

    // Fire and forget the network signout
    supabase.auth.signOut().finally(() => {
      window.location.replace('/landing');
    });

    // Fallback redirect after 800ms if network is slow/hung
    setTimeout(() => {
      window.location.replace('/landing');
    }, 800);
  };

  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Voice Support', path: '/support-agent', icon: PhoneCall },
    { name: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { name: 'Call Logs', path: '/call-logs', icon: Activity },
    { name: 'Settings',  path: '/settings',  icon: Settings },
  ];

  const themes = [
    { id: 'orange-black', name: 'OBSIDIAN ORANGE', colors: ['#0A0A0A', '#FF6B1A'] },
    { id: 'navy-beige',   name: 'MIDNIGHT GOLD',   colors: ['#0D1B2A', '#C8A97E'] },
    { id: 'white-cherry', name: 'FROST CHERRY', colors: ['#FAFAFA', '#C41E3A'] },
    { id: 'black-white',  name: 'PURE CONTRAST',  colors: ['#000000', '#FFFFFF'] },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent)] selection:text-[#0A0A0A] overflow-hidden">
      
      {/* ARTICLE MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-all z-10"
            >
              <X size={20} />
            </button>
            
            {selectedArticle.image_url && (
              <div className="h-64 w-full relative">
                <img src={selectedArticle.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
              </div>
            )}
            
            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest px-3 py-1 bg-[var(--accent-tint)] rounded-full">Global Announcement</span>
                <h2 className="text-3xl font-medium tracking-tight text-[var(--text-primary)]">{selectedArticle.title}</h2>
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">{new Date(selectedArticle.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              
              <p className="text-[var(--text-secondary)] text-base leading-relaxed font-medium">
                {selectedArticle.description}
              </p>
              
              {selectedArticle.link_url && selectedArticle.link_url !== '#' && (
                <a 
                  href={selectedArticle.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-[var(--accent)] font-bold uppercase tracking-widest text-xs hover:underline mt-4"
                >
                  Visit Official Resource <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <aside className={`flex-shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col h-full z-20 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${sidebarCollapsed ? 'w-[80px]' : 'w-[240px]'}`}>
        <div className={`py-10 transition-all duration-500 ${sidebarCollapsed ? 'px-0 flex justify-center' : 'px-8'}`}>
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <OperonLogo size={24} />
            {!sidebarCollapsed && (
              <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors whitespace-nowrap">Cloud AI</span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            if (item.subItems) {
              const isSubActive = item.subItems.some(sub => location.pathname === sub.path);
              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => setSalesDialerOpen(!salesDialerOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] text-[14px] font-medium transition-all duration-200 relative group ${
                      isSubActive && !salesDialerOpen
                        ? 'text-white' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className={isSubActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-white transition-colors'} />
                      <span className="tracking-tight">{item.name}</span>
                    </div>
                    <ChevronRight size={16} className={`text-[var(--text-muted)] transition-transform duration-200 ${salesDialerOpen ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${salesDialerOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-12 pr-2 py-1 space-y-1 relative before:absolute before:left-6 before:top-0 before:bottom-4 before:w-[1px] before:bg-[var(--border)]/50">
                      {item.subItems.map(sub => {
                        const isChildActive = location.pathname === sub.path;
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-200 relative group ${
                              isChildActive 
                                ? 'bg-[var(--accent-tint)] text-[var(--accent)]' 
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white'
                            }`}
                          >
                            {isChildActive && <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-[var(--accent)] rounded-full border-2 border-[var(--bg-sidebar)] z-10" />}
                            {!isChildActive && <div className="absolute -left-[27px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-[var(--border)] rounded-full border-2 border-[var(--bg-sidebar)] group-hover:bg-[var(--text-muted)] transition-colors z-10" />}
                            <span className="tracking-tight">{sub.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.name} className="relative group">
                {item.comingSoon ? (
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-[10px] opacity-40 cursor-not-allowed grayscale">
                    <div className="flex items-center gap-4">
                      <item.icon size={20} className="text-[var(--text-muted)]" />
                      <span className="text-[14px] font-medium tracking-tight text-[var(--text-secondary)]">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-md">Coming Soon</span>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center rounded-[10px] text-[14px] font-medium transition-all duration-200 relative group hover-pop
                      ${sidebarCollapsed ? 'justify-center py-4 px-0' : 'gap-4 px-4 py-3.5'}
                      ${isActive 
                        ? 'bg-[var(--accent-tint)] text-[var(--accent)] shadow-lg shadow-[var(--accent-tint)]' 
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-white'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !sidebarCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--accent)] rounded-r-full" />}
                        <item.icon size={20} className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-white transition-colors'} />
                        {!sidebarCollapsed && <span className="tracking-tight whitespace-nowrap">{item.name}</span>}
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            );
          })}
        </nav>



        <div className={`mt-auto border-t border-[var(--border)] transition-all duration-500 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center rounded-[14px] bg-[var(--bg-card)] border border-[var(--border)] ${sidebarCollapsed ? 'flex-col gap-2 p-2' : 'gap-3 p-3'}`}>
            <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] border border-[var(--border)] overflow-hidden flex-shrink-0">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                  <User size={18} />
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold truncate text-[var(--text-primary)]">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                <button 
                  onClick={handleLogout} 
                  disabled={loggingOut}
                  className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--error)] transition-colors uppercase tracking-[0.2em] mt-1 py-1 px-0.5 inline-block relative z-50 cursor-pointer disabled:opacity-50"
                >
                  {loggingOut ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            )}
            {sidebarCollapsed && (
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-[var(--text-muted)] hover:text-[var(--error)] transition-colors p-1"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-10 border-b border-[var(--border)]/50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-10 h-10 flex items-center justify-center rounded-[12px] bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-[var(--accent)] transition-all shadow-sm"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <h2 className="text-base font-medium text-[var(--text-primary)] tracking-tight">
              {NAV_ITEMS.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[12px] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all w-[320px]"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>

            <div className="flex items-center gap-2 border-l border-[var(--border)] pl-4 ml-2">
              {/* Theme Menu */}
              <div className="relative">
                <button 
                  onClick={() => { setShowThemeMenu(!showThemeMenu); setShowNotifications(false); }}
                  className={`w-11 h-11 flex items-center justify-center rounded-[12px] transition-all ${showThemeMenu ? 'bg-[var(--bg-hover)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                  <Palette size={22} />
                </button>

                {showThemeMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)}></div>
                    <div className="absolute right-0 mt-4 w-64 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] shadow-2xl p-3 z-50 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-3 py-2 mb-1">Themes</p>
                      <div className="space-y-1">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => { setTheme(t.id); setShowThemeMenu(false); }}
                            className={`w-full flex items-center justify-between p-3 rounded-[10px] transition-all ${theme === t.id ? 'bg-[var(--accent-tint)] text-[var(--accent)]' : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}
                          >
                            <span className="text-[11px] font-medium">{t.name}</span>
                            <div className="flex gap-1">
                              {t.colors.map((c, i) => (
                                <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }}></div>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Notification Menu */}
              <div className="relative">
                <button 
                  onClick={() => { setShowNotifications(!showNotifications); setShowThemeMenu(false); }}
                  className={`w-11 h-11 flex items-center justify-center rounded-[12px] transition-all relative ${showNotifications ? 'bg-[var(--bg-hover)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-white'}`}
                >
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-[var(--accent)] text-[#0A0A0A] rounded-full flex items-center justify-center text-[8px] font-black border-2 border-[var(--bg-app)]">
                      {unreadCount}
                    </div>
                  )}
                </button>

                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-4 w-80 bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                      {/* Tabs */}
                      <div className="flex bg-[var(--bg-input)] p-1 border-b border-[var(--border)]">
                        <button 
                          onClick={() => setNotifTab('news')}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[12px] transition-all flex items-center justify-center gap-2 ${notifTab === 'news' ? 'bg-[var(--bg-card)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                          <Newspaper size={14} /> Neural News
                        </button>
                        <button 
                          onClick={() => setNotifTab('system')}
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-[12px] transition-all flex items-center justify-center gap-2 ${notifTab === 'system' ? 'bg-[var(--bg-card)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-white'}`}
                        >
                          <Info size={14} /> Alerts
                        </button>
                      </div>

                      <div className="p-4 space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar">
                        {notifTab === 'system' ? (
                          notifications.length === 0 ? (
                            <div className="py-12 text-center opacity-30">
                              <Info size={24} className="mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">No Alerts</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 rounded-[14px] border transition-all cursor-pointer ${n.read ? 'border-transparent opacity-50' : 'bg-[var(--bg-input)] border-[var(--border)] hover:border-[var(--accent)]'}`}>
                                <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">{n.title}</h4>
                                <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">{n.message}</p>
                              </div>
                            ))
                          )
                        ) : (
                          news.length === 0 ? (
                            <div className="py-12 text-center opacity-30">
                              <Newspaper size={24} className="mx-auto mb-2" />
                              <p className="text-[10px] font-bold uppercase tracking-widest">No News Today</p>
                            </div>
                          ) : (
                            news.map(item => (
                              <div 
                                key={item.id} 
                                onClick={() => { setSelectedArticle(item); setShowNotifications(false); }}
                                className="group p-2 rounded-[18px] hover:bg-[var(--bg-input)] transition-all cursor-pointer border border-transparent hover:border-[var(--border)]"
                              >
                                {item.image_url && (
                                  <div className="h-32 w-full rounded-[14px] overflow-hidden mb-3">
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  </div>
                                )}
                                <div className="px-2 pb-2">
                                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1 leading-tight group-hover:text-[var(--accent)] transition-colors">{item.title}</h4>
                                  <p className="text-[10px] text-[var(--text-muted)] font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                                  <div className="mt-3 flex items-center justify-between">
                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                                    <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Read Full <ArrowRight size={10} /></span>
                                  </div>
                                </div>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

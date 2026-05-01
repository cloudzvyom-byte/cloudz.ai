import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Assistant from './pages/Assistant';
import Marketplace from './pages/Marketplace';
import Campaigns from './pages/Campaigns';
import CallLogs from './pages/CallLogs';
import Meetings from './pages/Meetings';
import Settings from './pages/Settings';
import Plans from './pages/Plans';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import SupportAgentConfig from './pages/SupportAgentConfig';
import ChatAgentConfig from './pages/ChatAgentConfig';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Security from './pages/Security';

// Components
import DashboardLayout from './components/DashboardLayout';
import { SmoothScroll } from './components/SmoothScroll';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, session, isBlocked }) => {
  if (!session) return <Navigate to="/login" replace />;
  if (isBlocked) return (
    <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center font-sans tracking-tight text-white p-10 text-center">
      <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[28px] flex items-center justify-center mb-8 animate-pulse">
        <ShieldAlert size={40} className="text-red-500" />
      </div>
      <h1 className="text-3xl font-medium tracking-tight mb-4">Access <span className="text-red-500">Restricted</span>.</h1>
      <p className="text-gray-400 text-base max-w-sm leading-relaxed mb-10">
        Your neural node authorization has been suspended. This usually occurs due to an outstanding subscription or a protocol violation.
      </p>
      <div className="space-y-4">
        <button onClick={() => window.location.href = 'mailto:support@operon.ai'} className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
          Contact Support
        </button>
        <div className="pt-8 border-t border-white/5">
          <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
};

function App() {
  const [session, setSession] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Fail-safe to ensure we don't load forever if Supabase hangs
    const failSafeTimer = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out. Proceeding...');
        setAuthLoading(false);
      }
    }, 3000);

    const handleAuthState = async (event, currentSession) => {
      console.log('Auth Protocol Event:', event, !!currentSession);
      
      if (mounted) {
        setSession(currentSession);
        
        if (currentSession) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('is_blocked')
              .eq('id', currentSession.user.id)
              .maybeSingle(); // Use maybeSingle to avoid 406/404 errors
            
            if (profileError) console.warn('Profile fetch warning (non-fatal):', profileError);
            if (profile?.is_blocked) setIsBlocked(true);
            else setIsBlocked(false);
          } catch (e) {
            console.warn('Block status check failed (non-fatal):', e);
          }
        }

        // Only stop loading if we have a result or no token in URL
        if (currentSession || !window.location.hash.includes('access_token')) {
          setAuthLoading(false);
          clearTimeout(failSafeTimer);
        }

        // Explicit redirect for OAuth completion
        if (currentSession && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          if (window.location.pathname === '/login') {
            window.location.replace('/dashboard');
          }
        } else if (event === 'SIGNED_OUT') {
          window.location.replace('/landing');
        }
      }
    };

    // Listen for all auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      handleAuthState(event, newSession);
    });

    // Check for initial session explicitly
    const checkInitial = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        handleAuthState('INITIAL_SESSION', initialSession);
      } else {
        // If no session but we have a token in URL, wait for onAuthStateChange
        if (!window.location.hash.includes('access_token')) {
          setAuthLoading(false);
          clearTimeout(failSafeTimer);
        } else {
          console.log('Detected access_token in URL, waiting for state change...');
          // Safety timeout: if onAuthStateChange doesn't fire in 2s, stop loading
          setTimeout(() => {
            if (mounted) setAuthLoading(false);
          }, 2000);
        }
      }
    };

    checkInitial();

    return () => {
      mounted = false;
      clearTimeout(failSafeTimer);
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      {authLoading ? (
        <div className="h-screen w-full bg-[#0A0A0A] flex flex-col items-center justify-center font-sans tracking-tight text-white">
          <div className="w-10 h-10 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 animate-pulse">Initializing Neural Link...</p>
        </div>
      ) : (
        <div className="min-h-screen w-full bg-[#0A0A0A]">
          <NotificationProvider userId={session?.user?.id}>
            <ChatProvider userId={session?.user?.id}>
              <div className="min-h-screen w-full">
                <SmoothScroll>
                  <Router>
                    <AnimatedRoutes session={session} isBlocked={isBlocked} authLoading={authLoading} />
                  </Router>
                </SmoothScroll>
              </div>
            </ChatProvider>
          </NotificationProvider>
        </div>
      )}
    </ThemeProvider>
  );
}

function AnimatedRoutes({ session, isBlocked, authLoading }) {
  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={<ProtectedRoute session={session} isBlocked={isBlocked}><Dashboard /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute session={session} isBlocked={isBlocked}><Assistant /></ProtectedRoute>} />
      <Route path="/agents"    element={<ProtectedRoute session={session} isBlocked={isBlocked}><Marketplace /></ProtectedRoute>} />
      <Route path="/support-agent" element={<ProtectedRoute session={session} isBlocked={isBlocked}><SupportAgentConfig /></ProtectedRoute>} />
      <Route path="/chat-agent" element={<ProtectedRoute session={session} isBlocked={isBlocked}><ChatAgentConfig /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute session={session} isBlocked={isBlocked}><Campaigns /></ProtectedRoute>} />
      <Route path="/call-logs" element={<ProtectedRoute session={session} isBlocked={isBlocked}><CallLogs /></ProtectedRoute>} />
      <Route path="/contacts"  element={<ProtectedRoute session={session} isBlocked={isBlocked}><Meetings /></ProtectedRoute>} />
      <Route path="/plans"     element={<ProtectedRoute session={session} isBlocked={isBlocked}><Plans /></ProtectedRoute>} />
      <Route path="/settings"  element={<ProtectedRoute session={session} isBlocked={isBlocked}><Settings /></ProtectedRoute>} />
      <Route path="/payment"   element={<ProtectedRoute session={session} isBlocked={isBlocked}><Payment /></ProtectedRoute>} />
      
      {/* Secret Admin Route */}
      <Route path="/admin-secure-operon-x9k2" element={<AdminDashboard />} />
      
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/security" element={<Security />} />
      
      <Route path="/landing" element={<Landing />} />
      <Route path="/" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default App;

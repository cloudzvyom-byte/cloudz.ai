import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clouds } from '../components/Clouds';
import { motion } from 'framer-motion';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.replace('/dashboard');
      }
    };
    checkSession();
  }, []);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      let { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) throw signUpError;
          alert('Sign up successful! Please check your email to verify.');
        } else {
          throw signInError;
        }
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (authError) throw authError;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen sky-gradient flex items-center justify-center overflow-hidden font-sans">
      {/* Background Clouds */}
      <div className="absolute inset-0">
        <Clouds density="high" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[420px] px-6"
      >
        <div className="rounded-3xl border border-white/20 bg-white/10 p-10 shadow-[0_8px_32px_rgba(0,30,80,0.12)] backdrop-blur-xl backdrop-saturate-150 text-white">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-sky-deep shadow-xl shadow-sky-deep/20 text-xl font-bold">
              O
            </div>
            <h1 
              className="text-3xl drop-shadow-md text-white/95"
              style={{
                fontFamily: "var(--font-display)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Sign in to your creative workspace
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center text-xs font-medium text-red-200 backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@operon.ai"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-white/80">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-md focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all tracking-widest"
              />
            </div>

            <button
              onClick={handleAuth}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-sky-deep/20 transition-all hover:translate-y-[-2px] hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? 'Authenticating...' : 'Sign In / Sign Up'}
            </button>
            
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;

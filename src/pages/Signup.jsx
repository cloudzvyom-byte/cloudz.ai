import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Clouds } from '../components/Clouds';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    dob: ''
  });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Auth Sign Up
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
            dob: formData.dob
          }
        }
      });

      if (signUpError) throw signUpError;

      if (user) {
        // 2. Create Profile in 'profiles' table
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: formData.fullName,
            username: formData.username,
            dob: formData.dob,
            email: formData.email,
            updated_at: new Date()
          });

        if (profileError) console.error('Profile creation error:', profileError.message);
        
        // Directly teleport to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="relative min-h-screen sunset-gradient flex items-center justify-center overflow-hidden font-sans py-12">
      {/* Background Clouds */}
      <div className="absolute inset-0">
        <Clouds density="high" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[480px] px-6"
      >
        <div className="rounded-[32px] border border-white/30 bg-black/20 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl text-white">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold tracking-tight text-white drop-shadow-lg"
              style={{ lineHeight: 1.1 }}
            >
              Create Account
            </h1>
            <p className="mt-2 text-sm text-white font-medium opacity-90">
              Join the Cloud AI network today
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center text-xs font-medium text-red-200 backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white">Full Name</label>
                <input 
                  required
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:border-white focus:bg-white/20 focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white">Username</label>
                <input 
                  required
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe7"
                  className="w-full h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:border-white focus:bg-white/20 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white">Email Address</label>
              <input 
                required
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@cloudz.ai"
                className="w-full h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:border-white focus:bg-white/20 focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white">Date of Birth</label>
                <input 
                  required
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white focus:border-white focus:bg-white/20 focus:outline-none transition-all font-medium [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-widest text-white">Password</label>
                <input 
                  required
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-11 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/50 focus:border-white focus:bg-white/20 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black shadow-lg transition-all hover:translate-y-[-2px] hover:bg-white/90 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div className="text-center mt-8 pt-2 border-t border-white/10">
              <p className="text-xs text-white/70 font-medium">
                Already have an account? {' '}
                <Link to="/login" className="text-white font-black hover:underline underline-offset-4">Sign In</Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Signup;

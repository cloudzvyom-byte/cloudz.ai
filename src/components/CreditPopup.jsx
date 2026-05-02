import React from 'react';
import { ShieldAlert, Zap, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreditPopup = ({ isOpen, onClose, balance = 0 }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0F0F0F] border border-white/10 rounded-[40px] max-w-md w-full p-10 relative shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px]" />
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-[28px] flex items-center justify-center mb-2 animate-pulse">
            <ShieldAlert size={40} className="text-red-500" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-medium tracking-tight text-white">Neural Buffers <span className="text-red-500">Depleted</span>.</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your operational credits have reached the minimum threshold. Provisioning of new voice nodes has been suspended.
            </p>
          </div>

          <div className="w-full bg-white/5 border border-white/5 rounded-[20px] p-6 flex justify-between items-center">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Balance</p>
              <p className="text-xl font-medium text-white">{balance} Credits</p>
            </div>
            <Zap size={24} className="text-orange-500" />
          </div>

          <div className="w-full space-y-4">
            <button 
              onClick={() => navigate('/payment?type=topup')}
              className="w-full py-5 bg-orange-500 text-black rounded-[20px] text-xs font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              Buy New Credits <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onClose}
              className="w-full py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-all"
            >
              Dismiss Alert
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 text-[9px] font-medium text-gray-600 uppercase tracking-widest text-center">
          Authorized by Clouds Neural System v4.0.2
        </div>
      </div>
    </div>
  );
};

export default CreditPopup;

import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, Upload, 
  Smartphone, ShieldCheck, 
  AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const PaymentModal = ({ isOpen, onClose, plan }) => {
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [user, setUser] = useState(null);

  const upiId = "8482967644@fam";
  const adminPhone = "918482967644";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setScreenshot(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!screenshot || !user) return;
    
    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `payments/${user.id}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      // 2. Save to Database
      const { error: dbError } = await supabase
        .from('payment_requests')
        .insert({
          user_id: user.id,
          user_email: user.email,
          user_name: user.user_metadata?.full_name || user.email.split('@')[0],
          plan_name: plan.name,
          agent_id: plan.id,
          amount: plan.priceNum || plan.monthly || 0,
          screenshot_url: publicUrl,
          status: 'pending'
        });

      if (dbError) throw dbError;

      // 3. WhatsApp Notification
      const message = `*NEW PAYMENT REQUEST*%0A%0A*User:* ${user.email}%0A*Plan:* ${plan.name}%0A*Amount:* ₹${plan.priceNum || plan.monthly}%0A%0A_Verification required in dashboard._`;
      const waUrl = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${message}`;
      
      window.open(waUrl, '_blank');
      
      alert('Payment submitted for approval! Our team will verify and activate your node shortly.');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error submitting payment: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-[#0D0D0D] border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium text-white mb-1">Complete your payment</h2>
            <p className="text-[13px] text-gray-500 font-medium">Scan QR code with any UPI app</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pb-8 space-y-8 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {/* Step 1: QR Code */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-[24px] mb-6 shadow-xl">
              <img 
                src="/upi-qr.png" 
                alt="UPI QR Code"
                className="w-[180px] h-[180px] object-contain"
                onError={(e) => {
                  e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=8482967644@fam%26pn=Operon%26am=" + (plan.priceNum || plan.monthly);
                }}
              />
            </div>
            
            <div className="w-full bg-white/5 border border-white/5 rounded-[18px] p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Smartphone size={16} className="text-orange-500" />
                <span className="text-xs font-bold text-gray-300 tracking-tight">{upiId}</span>
              </div>
              <button 
                onClick={handleCopy}
                className="relative p-2 bg-white/5 rounded-lg hover:bg-orange-500 hover:text-black transition-all flex items-center gap-2 group"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                {isCopied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black py-1 px-2 rounded-md animate-in slide-in-from-bottom-2">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            <div className="mt-4 text-center">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">PAYABLE AMOUNT</span>
              <span className="text-2xl font-medium text-orange-500 tracking-tighter">₹{plan.priceNum || plan.monthly}/month</span>
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">then</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {/* Step 2: Upload Proof */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">
              Step 2 — Upload payment screenshot
            </label>
            
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className={`border-2 border-dashed rounded-[24px] p-8 transition-all flex flex-col items-center justify-center text-center gap-3 ${preview ? 'border-[var(--success)]/50 bg-[var(--success)]/5' : 'border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-white/10'}`}>
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-white/20" />
                    <div className="absolute -top-2 -right-2 bg-[var(--success)] text-black rounded-full p-1.5 shadow-lg">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
                    <Upload size={24} />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-300">
                    {screenshot ? screenshot.name : "Click to browse or drag & drop"}
                  </p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                    Accepts: JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Submit */}
          <button 
            disabled={!screenshot || isUploading}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${!screenshot ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' : 'bg-orange-500 text-black hover:bg-orange-600 shadow-xl shadow-orange-500/20'}`}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Synchronizing Ledger...
              </>
            ) : (
              <>
                I've Paid — Submit for Approval
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest opacity-50">
            <ShieldCheck size={12} /> Encrypted Payment Node
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

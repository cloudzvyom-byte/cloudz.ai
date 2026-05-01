import React from 'react';
import { Download, FileText, X, Zap, Printer } from 'lucide-react';

const Invoice = ({ data, onClose }) => {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white text-black rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Controls (Non-printable) */}
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="text-orange-600" />
            <span className="text-sm font-black uppercase tracking-widest">Invoice Preview</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="px-6 py-2 bg-orange-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-12 print:p-0" id="invoice-printable">
          <div className="flex justify-between items-start mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-[12px] flex items-center justify-center text-orange-500">
                  <Zap size={24} fill="currentColor" />
                </div>
                <span className="text-2xl font-black tracking-tighter italic">CLOUDS AI.</span>
              </div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                Neural Operations Division<br />
                Silicon Valley, CA 94025<br />
                contact@clouds.ai
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-5xl font-black tracking-tighter text-gray-200 mb-4 italic">INVOICE</h1>
              <div className="text-[10px] font-bold uppercase tracking-widest space-y-1">
                <p><span className="text-gray-400">Number:</span> #OP-{Math.floor(Math.random() * 90000) + 10000}</p>
                <p><span className="text-gray-400">Date:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-16">
            <div>
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Billed To</h4>
              <div className="space-y-1">
                <p className="text-lg font-black">{data.user}</p>
                <p className="text-xs text-gray-500 font-medium">{data.email || 'user@clouds.ai'}</p>
                <p className="text-xs text-gray-500 font-medium">Customer ID: {data.userId || 'N/A'}</p>
              </div>
            </div>
            <div className="text-right">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Payment Method</h4>
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase">Razorpay Gateway</p>
                <p className="text-xs text-gray-500 font-medium">Transaction: {data.txId || 'rpay_live_92kd82nd'}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-16">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-left">Description</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Cycle</th>
                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-8">
                  <p className="font-black text-lg">Neural Agent: {data.agent}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">Tier-1 Autonomous Workforce Provisioning</p>
                </td>
                <td className="py-8 text-right font-bold uppercase tracking-widest text-xs">{data.cycle}</td>
                <td className="py-8 text-right font-black text-lg">{data.amount}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold">{data.amount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Neural Tax (0%)</span>
                <span className="font-bold">₹0.00</span>
              </div>
              <div className="pt-4 border-t-2 border-black flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tighter italic">Total Paid</span>
                <span className="text-2xl font-black text-orange-600">{data.amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-gray-100 text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Neural Infrastructure Authorization Verified</p>
            <p className="text-[9px] text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
              This is a computer-generated authorization receipt and does not require a physical signature.
              Powered by the Clouds Neural Engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;

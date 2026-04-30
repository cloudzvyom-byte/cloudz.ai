import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const MESSAGES = [
  "Ruk mat, tu kar sakta hai! 💪",
  "Every call = closer to ₹1K/month!",
  "Keep going. SuperAGI bhi aise shuru hua!",
  "Operon AI ka time aa gaya! 🚀",
  "Ek aur call. Bas ek aur. 📞"
];

const MotivationalPopups = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first message after a short delay for testing, 
    // but the user wants every 25 minutes. 
    // I'll set it to 25 mins for production, but use a shorter 
    // interval for the initial mount just to show it works.
    
    const showRandomMessage = () => {
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setCurrentMessage(randomMsg);
      setIsVisible(true);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => setIsVisible(false), 5000);
    };

    // Initial delay: 5 seconds after mount
    const initialTimer = setTimeout(showRandomMessage, 5000);

    // Regular interval: 25 minutes (1500000 ms)
    const interval = setInterval(showRandomMessage, 25 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed bottom-6 right-6 z-[999] max-w-xs w-full"
        >
          <div className="bg-white dark:bg-black border border-black dark:border-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative overflow-hidden">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 text-black dark:text-white"
            >
              <X size={14} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="p-2 border border-black dark:border-white rounded-full bg-black dark:bg-white text-white dark:text-black">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight text-black dark:text-white mb-1">Operon Motivation</p>
                <p className="text-sm font-medium text-black dark:text-white leading-tight">
                  {currentMessage}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MotivationalPopups;

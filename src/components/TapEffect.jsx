import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TapEffect = () => {
  const [taps, setTaps] = useState([]);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const newTap = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      setTaps((prev) => [...prev, newTap]);

      // Remove the tap after 2 seconds
      setTimeout(() => {
        setTaps((prev) => prev.filter((t) => t.id !== newTap.id));
      }, 2000);
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {taps.map((tap) => (
          <motion.div
            key={tap.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.3 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20,
              opacity: { duration: 0.2 },
              exit: { duration: 1 }
            }}
            className="absolute rounded-full bg-[#C4A882]"
            style={{
              width: '40px',
              height: '40px',
              left: tap.x - 20,
              top: tap.y - 20,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TapEffect;

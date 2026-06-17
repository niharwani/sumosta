'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISMISS_KEY = 'sumosta_bar_dismissed';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-honey-400 text-midnight overflow-hidden"
        >
          <div className="max-w-content mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
            <p className="text-xs font-satoshi font-medium text-center flex-1">
              🍯 Free shipping on orders over ₹500 &nbsp;·&nbsp; Use code{' '}
              <span className="font-bold underline">WELCOME10</span> for 10% off your first order
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/ui-store';

const DISMISS_KEY = 'sumosta_bar_dismissed';

export default function AnnouncementBar() {
  const { announcementVisible, setAnnouncementVisible } = useUIStore();

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    setAnnouncementVisible(!dismissed);
  }, [setAnnouncementVisible]);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setAnnouncementVisible(false);
  };

  return (
    <AnimatePresence>
      {announcementVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: '2.5rem', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 inset-x-0 z-[60] bg-honey-400 text-midnight overflow-hidden"
        >
          <div className="max-w-content mx-auto px-6 h-10 flex items-center justify-between gap-4">
            <p className="text-xs font-satoshi font-medium text-center flex-1">
              🍯 Free shipping on orders over ₹500 &nbsp;&middot;&nbsp; Use code{' '}
              <span className="font-bold">WELCOME10</span> for 10% off your first order
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

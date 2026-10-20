import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomAlertModalProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export function CustomAlertModal({ isOpen, type = 'info', message, onClose }: CustomAlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm sm:max-w-md bg-zinc-950 border border-purple-500/40 p-6 rounded-[2rem] shadow-2xl shadow-purple-500/20 flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center gap-3">
              {type === 'success' && <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />}
              {type === 'error' && <AlertCircle className="text-red-400 shrink-0" size={24} />}
              {type === 'info' && <Info className="text-purple-400 shrink-0" size={24} />}
              
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {type === 'success' ? 'Berhasil' : type === 'error' ? 'Perhatian' : 'Informasi'}
              </h3>
            </div>

            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed py-1">
              {message}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-purple-600/30 active:scale-95"
              >
                Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

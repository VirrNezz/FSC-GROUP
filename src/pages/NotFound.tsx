import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Translate } from '../App';

export function NotFound() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-36 md:pb-24 flex flex-col items-center justify-center text-center relative z-10 min-h-[70vh]">
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-8 sm:p-12 md:p-16 max-w-2xl w-full flex flex-col items-center gap-6 shadow-2xl"
      >
        {/* Badge Indicator */}
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md">
          <Compass size={16} className="mr-2 animate-spin-slow" />
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
            <Translate text="Error 404" />
          </span>
        </div>

        {/* Big 404 Text */}
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-200 to-white">
          404
        </h1>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            <Translate text="Page Not Found" />
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            <Translate text="Waduh, halaman yang kamu cari nggak ketemu nih! Mungkin jalannya salah atau halamannya udah dipindah." />
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-zinc-950 font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-lg shadow-white/10 w-full sm:w-auto"
          >
            <Home size={18} />
            <span><Translate text="Back to Home" /></span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs sm:text-sm tracking-wider uppercase active:scale-95 transition-all w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            <span><Translate text="Go Back" /></span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

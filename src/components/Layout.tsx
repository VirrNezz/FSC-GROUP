import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useLang } from '../App'; 

// --- KOMPONEN JAM REALTIME (STYLING CARD UNIFIED) ---
function LiveClock() {
  const getInitialTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    let zone = 'WIB';
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes('Jakarta') || tz.includes('Pontianak')) zone = 'WIB';
      else if (tz.includes('Makassar') || tz.includes('Denpasar')) zone = 'WITA';
      else if (tz.includes('Jayapura')) zone = 'WIT';
      else zone = 'LOCAL';
    } catch {
      zone = 'WIB';
    }

    return { time: `${h}:${m}:${s}`, zone };
  };

  const [timeData, setTimeData] = useState(getInitialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(getInitialTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-full text-xs font-mono font-bold tracking-widest text-white shadow-xl transition-colors flex items-center justify-center gap-2 select-none">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span>{timeData.time}</span>
      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-300 font-sans uppercase">
        {timeData.zone}
      </span>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { lang, toggleLang } = useLang(); 

  // --- SCRIPT NOTIFIKASI ONESIGNAL ---
  useEffect(() => {
    // 1. Inject tag script SDK OneSignal ke HTML secara dinamis
    const script = document.createElement('script');
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);

    // 2. Inisialisasi setelah SDK ter-load
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: "MASUKKAN_APP_ID_ONESIGNAL_KAMU_DISINI", // <-- Ganti pakai App ID dari dashboard OneSignal
          safari_web_id: "MASUKKAN_SAFARI_ID_JIKA_ADA",  // <-- Opsional, bisa dihapus kalau gak pakai
          notifyButton: {
            enable: true, // Memunculkan tombol lonceng otomatis di pojok kanan/kiri bawah
          },
        });
      });
    };

    // Bersihkan script saat komponen unmount (good practice)
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  // -------------------------------------

  const getTheme = (path: string) => {
    if (path.startsWith('/group/fsc')) {
      return {
        id: 'fsc',
        bgImage: 'url("/background/fsc.png")',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
        color: '#ffffff',
      };
    }
    if (path.startsWith('/group/fc')) {
      return {
        id: 'fc',
        bgImage: 'url("/background/fc.png")',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
        color: '#ffffff',
      };
    }
    if (path.startsWith('/group/2ft')) {
      return {
        id: '2ft',
        bgImage: 'url("/background/2ft.png")',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
        color: '#ffffff',
      };
    }
    if (path.startsWith('/admin')) {
      return {
        id: 'admin',
        bgImage: 'url("/background/admin.png")',
        gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
        color: '#ffffff',
      };
    }
    return {
      id: 'home',
      bgImage: 'url("/background/home.png")',
      gradient: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(9, 9, 11, 0.4) 50%, rgba(0, 0, 0, 0.7) 100%)',
      color: '#ffffff',
    };
  };

  const theme = getTheme(location.pathname);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* FLOATING BAR (PEMILIH BAHASA ATAS, JAM DI BAWAHNYA) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button 
          onClick={toggleLang}
          className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-xs font-black tracking-widest text-white hover:bg-white/10 shadow-xl transition-all cursor-pointer active:scale-95 select-none uppercase"
        >
          {lang === 'en' ? '🌐 EN' : '🌐 ID'}
        </button>

        {/* Jam Realtime ditaruh di bawah tombol bahasa */}
        <LiveClock />
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={theme.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: theme.bgImage }}
        />
      </AnimatePresence>
      
      <motion.div
        className="fixed inset-0 z-0"
        animate={{ background: theme.gradient }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 min-h-screen flex flex-col"
        animate={{ color: theme.color }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <Navigation />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </motion.div>
    </div>
  );
}

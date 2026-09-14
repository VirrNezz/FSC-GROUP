import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { useLang } from '../App'; 

// --- KOMPONEN JAM REALTIME (AUTO TIMEZONE) ---
function LiveClock() {
  const [timeData, setTimeData] = useState<{ time: string; zone: string }>(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    
    let zoneLabel = 'WIB';
    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTimeZone === 'Asia/Jakarta' || userTimeZone === 'Asia/Pontianak') zoneLabel = 'WIB';
      else if (userTimeZone === 'Asia/Makassar' || userTimeZone === 'Asia/Denpasar') zoneLabel = 'WITA';
      else if (userTimeZone === 'Asia/Jayapura') zoneLabel = 'WIT';
      else {
        const shortZone = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];
        zoneLabel = shortZone || 'LOCAL';
      }
    } catch {
      zoneLabel = 'WIB';
    }

    return { time: timeString, zone: zoneLabel };
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      let zoneLabel = 'WIB';
      try {
        const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (userTimeZone === 'Asia/Jakarta' || userTimeZone === 'Asia/Pontianak') zoneLabel = 'WIB';
        else if (userTimeZone === 'Asia/Makassar' || userTimeZone === 'Asia/Denpasar') zoneLabel = 'WITA';
        else if (userTimeZone === 'Asia/Jayapura') zoneLabel = 'WIT';
        else {
          const shortZone = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];
          zoneLabel = shortZone || 'LOCAL';
        }
      } catch {
        zoneLabel = 'WIB';
      }

      setTimeData({ time: timeString, zone: zoneLabel });
    };

    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-xs font-mono font-bold tracking-widest text-white shadow-2xl flex items-center gap-2 select-none">
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
    const script = document.createElement('script');
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: "MASUKKAN_APP_ID_ONESIGNAL_KAMU_DISINI",
          safari_web_id: "MASUKKAN_SAFARI_ID_JIKA_ADA",
          notifyButton: {
            enable: true,
          },
        });
      });
    };

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
      
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <LiveClock />
        <button 
          onClick={toggleLang}
          className="px-4 py-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-xs font-black tracking-widest text-white hover:bg-zinc-800/90 shadow-2xl hover:border-white/20 transition-all cursor-pointer active:scale-95 select-none uppercase"
        >
          {lang === 'en' ? '🌐 EN' : '🌐 ID'}
        </button>
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

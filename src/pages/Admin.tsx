import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { adminsData } from '../data';
import { Instagram, Send, X, Shield, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { AdminPanel } from '../components/AdminPanel';
import { Translate } from '../App'; // <-- 1. IMPORT TRANSLATE DARI APP.TSX

export function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'roster' | 'dashboard'>('roster');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      setActiveTab('dashboard');
    }
  }, [user, isAdmin]);

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="mb-4 w-10 h-10 border-4 border-t-blue-500 border-r-transparent border-b-indigo-500 border-l-transparent rounded-full"
        />
        <p className="text-sm font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
          <Translate text="Verifying security privileges..." /> {/* <-- BUNGKUS KATA LOADING */}
        </p>
      </div>
    );
  }

  const selectedAdmin = adminsData.find(a => a.id === selectedId);

  if (user && isAdmin && activeTab === 'dashboard') {
    return (
      <div className="flex-1 flex flex-col">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-12 flex justify-start z-20">
          <div className="flex p-1 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all flex items-center gap-2",
                activeTab === 'dashboard' ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-400 hover:text-white"
              )}
            >
              <Shield size={14} /> <Translate text="Control Panel" />
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all flex items-center gap-2",
                activeTab === 'roster' ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-400 hover:text-white"
              )}
            >
              <Users size={14} /> <Translate text="View Roster" />
            </button>
          </div>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col gap-12 md:gap-16">
      {user && isAdmin && (
        <div className="flex justify-start z-20 -mb-4">
          <div className="flex p-1 bg-zinc-900/80 border border-white/10 rounded-2xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all flex items-center gap-2",
                activeTab === 'dashboard' ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-400 hover:text-white"
              )}
            >
              <Shield size={14} /> <Translate text="Control Panel" />
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase font-bold transition-all flex items-center gap-2",
                activeTab === 'roster' ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "text-zinc-400 hover:text-white"
              )}
            >
              <Users size={14} /> <Translate text="View Roster" />
            </button>
          </div>
        </div>
      )}

      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4 md:mb-6">
          <Translate text="Administrators" />
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-zinc-400">
          <Translate text="The team behind FSG. Click on a member to view details or reach out for support and suggestions." />
        </p>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminsData.map((admin) => (
          <motion.div
            layoutId={`card-${admin.id}`}
            key={admin.id}
            onClick={() => setSelectedId(admin.id)}
            className="cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden hover:bg-white/10 transition-colors flex flex-col"
          >
            <motion.div layoutId={`image-${admin.id}`} className="w-full aspect-[4/5] overflow-hidden">
              <img src={admin.image} alt={admin.name} className="w-full h-full object-cover" />
            </motion.div>
            <motion.div layoutId={`content-${admin.id}`} className="p-5 md:p-6">
              <h3 className="text-lg md:text-xl font-bold">{admin.name}</h3>
              <p className="text-sm text-blue-400 mt-1">
                <Translate text="View Profile →" />
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && selectedAdmin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedId(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`card-${selectedAdmin.id}`}
                className="bg-zinc-950/90 backdrop-blur-2xl w-full max-w-2xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden pointer-events-auto shadow-2xl flex flex-col md:flex-row relative max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-hidden"
              >
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2 md:p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                
                <motion.div layoutId={`image-${selectedAdmin.id}`} className="w-full md:w-2/5 aspect-square md:aspect-auto">
                  <img src={selectedAdmin.image} alt={selectedAdmin.name} className="w-full h-full object-cover" />
                </motion.div>
                
                <motion.div layoutId={`content-${selectedAdmin.id}`} className="p-6 md:p-10 flex flex-col justify-center w-full md:w-3/5">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">{selectedAdmin.name}</h3>
                  <p className="text-sm md:text-base text-zinc-400 leading-relaxed mb-6 md:mb-8">
                    {/* Mengkonversi deskripsi biodata dinamis ke Indonesia */}
                    <Translate text={selectedAdmin.bio} />
                  </p>
                  
                  <div className="flex flex-col gap-3 md:gap-4 mt-auto md:mt-0">
                    <p className="text-xs md:text-sm font-semibold text-zinc-500 uppercase tracking-widest">
                      <Translate text="Contact" />
                    </p>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {selectedAdmin.socials.ig && (
                        <a href={selectedAdmin.socials.ig} target="_blank" rel="noreferrer" className="p-3 md:p-4 bg-white/5 hover:bg-blue-600 hover:text-white rounded-full transition-colors border border-white/10 flex items-center justify-center">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {selectedAdmin.socials.telegram && (
                        <a href={selectedAdmin.socials.telegram} target="_blank" rel="noreferrer" className="p-3 md:p-4 bg-white/5 hover:bg-blue-500 hover:text-white rounded-full transition-colors border border-white/10 flex items-center justify-center">
                          <Send className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

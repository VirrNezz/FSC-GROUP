import { useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { groups as staticGroups } from '../data';
import { ExternalLink, Shield, Globe, Star, Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useGroups, GroupStatus } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { Translate } from '../App';

export function Group() {
  const { id } = useParams<{ id: string }>();
  const staticGroup = staticGroups[id as keyof typeof staticGroups];
  const { groups: liveGroups, loading, updateGroup } = useGroups();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<GroupStatus>('OPEN');
  const [editJoinLink, setEditJoinLink] = useState('');
  
  // STATE UNTUK KONTROL POP-UP DAN COUNTDOWN WAKTU
  const [showRulesAlert, setShowRulesAlert] = useState(false);
  const [countdown, setCountdown] = useState(5); // Waktu tunggu 5 detik

  // LOGIKA HITUNG MUNDUR (COUNTDOWN EFFECT)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showRulesAlert && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [showRulesAlert, countdown]);

  if (!staticGroup) return <Navigate to="/" replace />;

  const group = {
    ...staticGroup,
    ...liveGroups[staticGroup.id]
  };

  const handleEditClick = () => {
    setEditStatus(group.status);
    setEditJoinLink(group.joinLink);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateGroup(group.id, { status: editStatus, joinLink: editJoinLink });
    setIsEditing(false);
  };

  // KETIKA TOMBOL JOIN AWAL DIKLIK
  const handleJoinClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (group.status === 'OPEN') {
      setCountdown(5); // Reset waktu kembali ke 5 detik setiap pop-up dibuka
      setShowRulesAlert(true);
    }
  };

  // KETIKA TOMBOL DI POP-UP DIKLIK SETELAH WAKTU HABIS
  const confirmJoin = () => {
    if (countdown > 0) return; // Proteksi tambahan
    setShowRulesAlert(false);
    window.open(group.joinLink, '_blank', 'noopener,noreferrer');
  };

  const cardBg = 'bg-white/5 border-white/10';
  const textMuted = 'text-slate-400';
  const statusColor = group.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  const buttonStyle = 'bg-white text-black hover:bg-gray-200';

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col gap-16 md:gap-24">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-extrabold tracking-tighter uppercase">{group.name}</h1>
          <div className="flex items-center gap-4">
            <div className={cn("px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold tracking-widest backdrop-blur-md self-start sm:self-auto", statusColor)}>
              {!loading && group.status}
            </div>
            {isAdmin && !isEditing && (
              <button onClick={handleEditClick} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <Edit2 size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {isEditing && isAdmin && (
          <div className="mb-8 p-6 bg-white/5 border border-white/20 rounded-2xl backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-white"><Translate text="Status" /></label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value as GroupStatus)}
                  className="w-full bg-zinc-900 border border-white/20 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-white">Join Link</label>
                <input 
                  type="text" 
                  value={editJoinLink}
                  onChange={(e) => setEditJoinLink(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
                  placeholder="https://t.me/..."
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors">
                  <Save size={16} /> <Translate text="Save Changes" />
                </button>
                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-colors">
                  <X size={16} /> <Translate text="Cancel" />
                </button>
              </div>
            </div>
          </div>
        )}

        <p className={cn("text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight mb-6 md:mb-8 opacity-90", group.themeColors.accent ? `text-[${group.themeColors.accent}]` : '')}>
          <Translate text={group.fullName} />
        </p>
        <p className={cn("text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl font-light", textMuted)}>
          <Translate text={group.description} />
        </p>
      </motion.header>

      {/* DYNAMIC ANNOUNCEMENT KHUSUS GRUP (Cara 1: Melekat pada Data Grup Live) */}
      {group.announcement && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 md:p-8 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl shadow-lg shadow-amber-500/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-full animate-pulse text-sm">📢</span>
            <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">
              <Translate text="Group Announcement" />
            </h3>
          </div>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed font-sans font-medium tracking-wide">
            <Translate text={group.announcement} />
          </p>
        </motion.section>
      )}

      {/* Explanatory Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: <Shield size={24} />, title: "Moderated Space", desc: "A tightly moderated environment ensuring all interactions remain respectful and aligned with our core community guidelines." },
          { icon: <Star size={24} />, title: "Specialized Focus", desc: `Dedicated to ${group.name} specific interests, providing tailored events, discussions, and resources for our members.` },
          { icon: <Globe size={24} />, title: "Active Engagement", desc: "Regular activities, voice chats, and collaborative projects to keep the community vibrant and connected." }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn("p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl border transition-colors hover:bg-black/5 dark:hover:bg-white/10", cardBg)}
          >
            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-4 md:mb-6 bg-white/10 text-white")}>
              {item.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">
              <Translate text={item.title} />
            </h3>
            <p className={cn("leading-relaxed text-sm md:text-base", textMuted)}>
              <Translate text={item.desc} />
            </p>
          </motion.div>
        ))}
      </section>

      {/* Vision & Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={cn("p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl border", cardBg)}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"><Translate text="Vision" /></h3>
          <p className={cn("text-base md:text-lg leading-relaxed", textMuted)}>
            <Translate text={group.vision} />
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={cn("p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-xl border", cardBg)}
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"><Translate text="Mission" /></h3>
          <p className={cn("text-base md:text-lg leading-relaxed", textMuted)}>
            <Translate text={group.mission} />
          </p>
        </motion.div>
      </section>

      {/* Staff */}
      <section>
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-8 md:mb-12"
        >
          <Translate text="Leadership" />
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {group.staff.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn("rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border flex flex-col items-center text-center backdrop-blur-xl transition-all hover:scale-105", cardBg)}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 md:mb-8 border-4 border-black/10 dark:border-white/20 shadow-xl">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-2xl md:text-3xl font-extrabold mb-1 md:mb-2">{member.name}</h4>
              <p className={cn("text-xs md:text-sm font-bold tracking-widest uppercase", textMuted)}>
                <Translate text={member.role} />
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Join Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center pb-16 md:pb-20"
      >
        <div className={cn("text-center max-w-3xl w-full p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] border backdrop-blur-xl shadow-2xl", cardBg)}>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-8">
            <Translate text="Ready to get involved?" />
          </h2>
          <p className={cn("mb-8 md:mb-12 text-base md:text-xl font-light", textMuted)}>
            <Translate text={group.status === 'OPEN' ? "We are currently accepting new members. Join our selection group to start the process." : "Applications are currently closed. Please check back later."} />
          </p>
          <a
            href={group.status === 'OPEN' ? group.joinLink : '#'}
            className={cn(
              "inline-flex items-center gap-2 md:gap-3 px-6 md:px-10 py-3 md:py-5 rounded-full font-bold text-base md:text-xl transition-all",
              group.status === 'OPEN' ? cn(buttonStyle, "hover:scale-105") : 'opacity-50 cursor-not-allowed bg-gray-500 text-white'
            )}
            onClick={handleJoinClick}
          >
            <Translate text="Join Selection Group" />
            {group.status === 'OPEN' && <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />}
          </a>
        </div>
      </motion.section>

      {/* MODAL ALERT PERATURAN DENGAN SISTEM COUNTDOWN TIMEOUT */}
      <AnimatePresence>
        {showRulesAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 cursor-pointer"
              onClick={() => setShowRulesAlert(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-zinc-950/90 backdrop-blur-2xl border border-white/15 w-full max-w-lg p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] pointer-events-auto shadow-2xl text-center flex flex-col items-center max-h-[85vh]"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-4 shrink-0">
                  <AlertTriangle size={24} className={cn(countdown > 0 && "animate-pulse")} />
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-white mb-2 shrink-0">
                  <Translate text="Community Notice" />
                </h3>
                
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed mb-4 shrink-0">
                  <Translate text="Please ensure you have read and thoroughly understood our community rules and guidelines before entering the selection group. Failure to follow them may result in removal." />
                </p>

                {/* CONTAINER RULES YANG TERSUSUN RAPI DAN BISA DI-SCROLL */}
                <div className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-left overflow-y-auto mb-6 space-y-2.5 max-h-[40vh] scrollbar-thin">
                  <div className="text-amber-400 text-xs font-bold uppercase tracking-wider border-b border-white/10 pb-1.5 mb-2">
                    📜 <Translate text="Rules FSC (Harap dibaca!!):" />
                  </div>
                  {[
                    "DILARANG MENGIRIM LINK GC LAIN KECUALI PARTNER!!",
                    "BUKAN GRUP JB!!",
                    "DILARANG SHARE 18+ BAIK APAPUN ITU!! (TERMASUK BERMESRAAN BF/GF)",
                    "HARGAI KEPUTUSAN ADMIN!!",
                    "SEMUA YANG ADA DI CLAN INI SAMA RATA, TIDAK ADA YG SPESIAL!!",
                    "DILARANG SHARE HOAX, SARA, MAUPUN RASIS!!",
                    "DILARANG MENGIRIM APAPUN YG BERBAU KARTEL!!",
                    "DILARANG RUSUH!!",
                    "BERCANDA SEWAJARNYA!!",
                    "NO DRAMA, NO CAPER, NO BAPER!!",
                    "APABILA MELANGGAR SAMPAI 3x, KICK+BLACKLIST",
                    "DILARANG SIDER!! MINIMAL ABSEN NIMBRUNG SEMINGGU SEKALI!!",
                    "FONT HP WAJIB BAWAAN DARI HP!!",
                    "ADA KELUHAN? PM OWNER 'N ADMIN!!"
                  ].map((rule, index) => (
                    <div key={index} className="flex gap-2 text-[11px] text-zinc-300 leading-relaxed items-start">
                      <span className="text-cyan-400 font-bold shrink-0">{index + 1}.</span>
                      <p className="font-sans font-medium tracking-wide">
                        <Translate text={rule} />
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center shrink-0">
                  <button
                    onClick={() => setShowRulesAlert(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    <Translate text="Cancel" />
                  </button>
                  
                  <button
                    onClick={confirmJoin}
                    disabled={countdown > 0}
                    className={cn(
                      "px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all select-none",
                      countdown > 0 
                        ? "bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed opacity-60" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer active:scale-95"
                    )}
                  >
                    {countdown > 0 ? (
                      <span>
                        <Translate text="Wait" /> {countdown}s
                      </span>
                    ) : (
                      <Translate text="I Understand & Proceed" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

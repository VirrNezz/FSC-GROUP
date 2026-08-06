import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Translate } from '../App'; // <-- 1. IMPORT TRANSLATE SUPAYA NAVBAR BISA BERUBAH BAHASA

const links = [
  { name: 'Home', path: '/', gradient: 'from-blue-400 via-blue-200 to-white' },
  { name: 'FSC Group', path: '/group/fsc', gradient: 'from-slate-100 via-slate-300 to-slate-400' },
  { name: 'FC Group', path: '/group/fc', gradient: 'from-blue-400 via-blue-600 to-blue-900' },
  { name: '2FT Group', path: '/group/2ft', gradient: 'from-zinc-100 via-zinc-400 to-zinc-600' },
  { name: 'Admins', path: '/admin', gradient: 'from-blue-400 via-blue-200 to-white' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  // FIX (Android glitch): melacak kapan animasi clip-path benar-benar berjalan,
  // supaya `willChange` hanya aktif saat dibutuhkan lalu dilepas begitu selesai.
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const { user, loginWithGoogle, logout } = useAuth();

  const isDarkBg = ['/', '/group/fc', '/group/2ft', '/admin'].includes(location.pathname);
  const iconColor = isOpen ? 'text-white' : (isDarkBg ? 'text-white' : 'text-slate-900');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn("fixed top-4 right-4 md:top-6 md:right-6 z-40 p-3 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all", iconColor)}
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          // FIX (Android glitch, dikonfirmasi lewat rekaman layar):
          // Video menunjukkan lingkaran clip-path "melompat" (skip banyak frame
          // sekaligus) alih-alih mengecil halus — ini bukan bug bentuk, tapi
          // bukti nyata dropped-frame/jank. Penyebabnya: `clip-path` WAJIB
          // memicu repaint (rasterisasi ulang mask) di CPU/GPU pada SETIAP
          // frame. Digabung dengan `backdrop-blur-2xl` yang berat, saat GPU
          // Android tidak sanggup mengejar deadline frame, browser "meloncat"
          // beberapa frame animasi sekaligus — persis pola patah di video.
          //
          // SOLUSI: ganti total mekanisme reveal dari clip-path (paint) ke
          // `transform: scale()` (compositor-only). Transform TIDAK PERNAH
          // memicu repaint per frame — browser cukup me-render bentuk lingkaran
          // SEKALI lalu men-scale teksturnya di GPU, operasi yang jauh lebih
          // ringan dan tidak bisa "kehabisan napas" seperti clip-path.
          //
          // Wrapper ini sendiri tidak mengubah tampilan apa pun (exit-nya no-op);
          // fungsinya cuma supaya AnimatePresence menahan unmount sampai SEMUA
          // anak (lingkaran + nav + login) selesai animasi keluar.
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
            className="fixed inset-0 z-50 isolate"
          >
            {/* Lapisan lingkaran reveal — HANYA `transform: scale`, tidak ada clip-path.
                Ukuran dasar 300vmax memastikan tetap menutupi diagonal layar
                sepenuhnya (setara radius 150vmax pada versi clip-path sebelumnya),
                dan transformOrigin '100% 0%' membuatnya tumbuh/menyusut dari
                pojok kanan-atas (posisi tombol) — visualnya identik dengan
                clip-path circle, tapi di-render lewat jalur GPU compositor. */}
            <motion.div
              initial={{ scale: 0 }}
              // FIX (Android glitch): pakai `tween` + duration, BUKAN spring, dan
              // didefinisikan LANGSUNG di tiap variant (animate/exit), bukan lewat
              // prop `transition` di level komponen — supaya timing buka & tutup
              // benar-benar independen (tidak bergantung pada state `isOpen` yang
              // sudah berubah duluan saat exit mulai berjalan).
              //
              // Kenapa tween, bukan spring: parameter spring (stiffness/damping)
              // bersifat distance-dependent — nilai yang pas untuk radius ribuan px
              // (versi clip-path lama) tidak relevan untuk men-scale 0→1 (jadi
              // terasa "meletup" instan kalau dipakai apa adanya). `tween`
              // berbasis durasi bersifat deterministik: selalu tepat berhenti di
              // 0 atau 1 pada waktu yang ditentukan, tanpa ambiguitas "rest
              // threshold" seperti spring — salah satu sumber ketidaksinkronan
              // JS vs GPU pada versi sebelumnya.
              animate={{ scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }} // buka: melambat di akhir
              exit={{ scale: 0, transition: { delay: 0.3, duration: 0.4, ease: [0.7, 0, 0.84, 0] } }} // tutup: makin cepat, delay 0.3 agar teks nav sempat fade out dulu
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
              style={{
                position: 'fixed',
                top: 44,
                right: 44,
                width: '300vmax',
                height: '300vmax',
                borderRadius: '9999px',
                transformOrigin: '100% 0%',
                // FIX (Android glitch): willChange hanya aktif selama animasi
                // berjalan (lihat onAnimationStart/Complete), lalu dilepas ke
                // 'auto' supaya tidak boros memori GPU saat menu diam.
                willChange: isAnimating ? 'transform' : 'auto',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="bg-zinc-950/95 backdrop-blur-2xl"
            />

            {/* Lapisan konten: TIDAK ikut ter-scale (sibling, bukan child dari
                lingkaran), supaya teks & tombol tidak ikut membesar/mengecil
                bersama lingkaran — posisinya tetap normal, hanya fade in/out
                lewat opacity masing-masing seperti sebelumnya. */}
            <div className="fixed inset-0 flex flex-col justify-center items-center">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10"
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>

              <nav className="flex flex-col gap-6 md:gap-8 text-center px-4 mb-12">
                {links.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter relative group block hover:scale-105 transition-transform duration-300"
                    >
                      <span className={cn("bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300", link.gradient, location.pathname !== link.path && "opacity-70 group-hover:opacity-100")}>
                        {/* 2. BUNGKUS NAMA LINK DENGAN COMPONENT TRANSLATE */}
                        <Translate text={link.name} />
                      </span>
                      {location.pathname === link.path && (
                        <motion.span 
                          layoutId="activeIndicator"
                          className="absolute -left-6 sm:-left-8 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                        />
                      )}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-8 flex flex-col items-center text-white/50"
              >
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <LogOut size={16} />
                    <span><Translate text="Logout" /> ({user.email})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      loginWithGoogle();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <LogIn size={16} />
                    <span><Translate text="Admin Login" /></span>
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

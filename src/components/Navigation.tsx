import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogIn, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { Translate } from '../App';

// Halaman Navigasi Terpisah (Pages)
const navPages = [
  // Page 1: Main Menu & Groups
  [
    { name: 'Home', path: '/', gradient: 'from-blue-400 via-blue-200 to-white' },
    { name: 'FSC Group', path: '/group/fsc', gradient: 'from-slate-100 via-slate-300 to-slate-400' },
    { name: 'FC Group', path: '/group/fc', gradient: 'from-blue-400 via-blue-600 to-blue-900' },
    { name: '2FT Group', path: '/group/2ft', gradient: 'from-zinc-100 via-zinc-400 to-zinc-600' },
    { name: 'Partners', path: '/partner', gradient: 'from-emerald-300 via-teal-200 to-white' },
    { name: 'Admins', path: '/admin', gradient: 'from-blue-400 via-blue-200 to-white' },
  ],
  // Page 2: Features & Lounge (Bisa ditambahin rute baru di sini nanti!)
  [
    { name: 'Music Lounge', path: '/music', gradient: 'from-purple-400 via-pink-200 to-white' },
    // Nanti tinggal tambah objek rute baru di sini :p
  ]
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Page index: 0 = Page 1, 1 = Page 2
  const location = useLocation();
  const { user, loginWithGoogle, logout } = useAuth();

  const isDarkBg = ['/', '/group/fc', '/group/2ft', '/admin', '/partner', '/music'].includes(location.pathname);
  const iconColor = isOpen ? 'text-white' : (isDarkBg ? 'text-white' : 'text-slate-900');

  const nextPage = () => {
    if (currentPage < navPages.length - 1) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          // Otomatis buka page 2 kalau user lagi ada di /music
          if (location.pathname === '/music') setCurrentPage(1);
        }}
        className={cn("fixed top-4 right-4 md:top-6 md:right-6 z-40 p-3 rounded-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all", iconColor)}
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="nav-overlay"
            initial={{
              opacity: 0,
              maskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 0%, transparent 0%)',
              WebkitMaskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 0%, transparent 0%)',
            }}
            animate={{
              opacity: 1,
              maskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 250%, transparent 250%)',
              WebkitMaskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 250%, transparent 250%)',
              transition: {
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{
              opacity: 0,
              maskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 0%, transparent 0%)',
              WebkitMaskImage: 'radial-gradient(circle at calc(100% - 40px) 40px, black 0%, transparent 0%)',
              transition: {
                duration: 0.75,
                ease: [0.25, 1, 0.5, 1] 
              }
            }}
            style={{
              willChange: 'mask-image, -webkit-mask-image, opacity',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
            className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex flex-col justify-between items-center overflow-y-auto p-6 md:p-12 pointer-events-auto"
          >
            {/* Tombol Close */}
            <div className="w-full flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white border border-white/10 z-10"
                aria-label="Close Menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Container Navigasi Utama dengan Tombol Navigasi Kiri & Kanan */}
            <div className="w-full max-w-5xl my-auto flex items-center justify-between gap-2 sm:gap-6 relative px-2">
              
              {/* Tombol Panah Kiri */}
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className={cn(
                  "p-3 rounded-full bg-white/5 border border-white/10 text-white transition-all shrink-0",
                  currentPage === 0 ? "opacity-20 cursor-not-allowed" : "hover:bg-white/20 hover:scale-110 active:scale-95"
                )}
                aria-label="Previous Page"
              >
                <ChevronLeft size={28} />
              </button>

              {/* Area Tampilan Menu per Page */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.nav
                    key={currentPage}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="flex flex-col gap-4 sm:gap-6 md:gap-7 text-center px-4 my-auto"
                  >
                    {navPages[currentPage].map((link, i) => (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Link
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter relative group inline-block hover:scale-105 transition-transform duration-300"
                        >
                          <span className={cn(
                            "bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300", 
                            link.gradient, 
                            location.pathname !== link.path && "opacity-70 group-hover:opacity-100"
                          )}>
                            <Translate text={link.name} />
                          </span>

                          {location.pathname === link.path && (
                            <motion.span 
                              layoutId="activeIndicator"
                              className="absolute -left-5 sm:-left-8 top-1/2 -translate-y-1/2 w-2.5 h-2.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" 
                            />
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.nav>
                </AnimatePresence>

                {/* Dots Indicator di Bawah Menu */}
                <div className="flex gap-2 mt-8">
                  {navPages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        currentPage === idx ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Tombol Panah Kanan */}
              <button
                onClick={nextPage}
                disabled={currentPage === navPages.length - 1}
                className={cn(
                  "p-3 rounded-full bg-white/5 border border-white/10 text-white transition-all shrink-0",
                  currentPage === navPages.length - 1 ? "opacity-20 cursor-not-allowed" : "hover:bg-white/20 hover:scale-110 active:scale-95"
                )}
                aria-label="Next Page"
              >
                <ChevronRight size={28} />
              </button>

            </div>

            {/* Section Auth (Login/Logout) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-white/50 pt-4"
            >
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 hover:text-white transition-colors text-sm sm:text-base"
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
                  className="flex items-center gap-2 hover:text-white transition-colors text-sm sm:text-base"
                >
                  <LogIn size={16} />
                  <span><Translate text="Admin Login" /></span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

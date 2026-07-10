import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const links = [
  { name: 'Home', path: '/', gradient: 'from-blue-400 via-blue-200 to-white' },
  { name: 'FSC Group', path: '/group/fsc', gradient: 'from-slate-100 via-slate-300 to-slate-400' },
  { name: 'FC Group', path: '/group/fc', gradient: 'from-blue-400 via-blue-600 to-blue-900' },
  { name: '2FT Group', path: '/group/2ft', gradient: 'from-zinc-100 via-zinc-400 to-zinc-600' },
  { name: 'Admins', path: '/admin', gradient: 'from-blue-400 via-blue-200 to-white' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loginWithGoogle, logout } = useAuth();

  // Determine button color based on background (roughly)
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
          <motion.div
            initial={{ clipPath: 'circle(0px at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150vh at calc(100% - 44px) 44px)' }}
            exit={{ 
              clipPath: 'circle(0px at calc(100% - 44px) 44px)',
              transition: { delay: 0.3, type: 'spring', stiffness: 400, damping: 40 }
            }}
            transition={{ type: 'spring', stiffness: 20, restDelta: 2 }}
            className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-2xl flex flex-col justify-center items-center"
          >
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
                      {link.name}
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
                  <span>Logout ({user.email})</span>
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
                  <span>Admin Login</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


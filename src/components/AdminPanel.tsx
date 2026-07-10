import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, RefreshCw, CheckCircle, AlertTriangle, Link as LinkIcon, LogOut, LogIn, Lock, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGroups, GroupStatus } from '../hooks/useGroups';
import { groups as staticGroups } from '../data';
import { cn } from '../lib/utils';

export function AdminPanel() {
  const { user, isAdmin, loading: authLoading, loginWithGoogle, logout } = useAuth();
  const { groups: liveGroups, loading: groupsLoading, updateGroup } = useGroups();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local state for inline input changes so users have an editing buffer before saving
  const [localLinks, setLocalLinks] = useState<Record<string, string>>({});

  // Sync live group joinLinks to local state when they load
  useEffect(() => {
    if (liveGroups) {
      const initialLinks: Record<string, string> = {};
      Object.keys(liveGroups).forEach((id) => {
        initialLinks[id] = liveGroups[id]?.joinLink || '';
      });
      setLocalLinks((prev) => ({ ...initialLinks, ...prev }));
    }
  }, [liveGroups]);

  // Handle auto-clearing success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Cyberpunk Loading State while Auth or Groups are loading
  if (authLoading || groupsLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="mb-6 p-4 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400"
        >
          <RefreshCw size={40} className="animate-pulse" />
        </motion.div>
        <h3 className="text-xl md:text-2xl font-mono tracking-widest text-blue-400 uppercase animate-pulse">
          Initializing secure admin portal...
        </h3>
        <p className="text-sm font-mono text-zinc-500 mt-2">Checking Firestore (default) connection...</p>
      </div>
    );
  }

  // Strict Admin Authorization Verification
  if (!user || !isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-red-950/20 backdrop-blur-2xl border border-red-500/30 rounded-[2rem] p-8 md:p-10 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-400">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3">Access Denied</h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
            The account <strong className="text-red-400">{user?.email || "Anonymous"}</strong> does not have administrator privileges. Only authorized administrators can access this panel.
          </p>
          <div className="flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => logout()}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout Account
              </button>
            ) : (
              <button
                onClick={() => loginWithGoogle()}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogIn size={18} /> Login with Google
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle updating Group Status
  const handleStatusToggle = async (groupId: string, currentStatus: GroupStatus) => {
    const newStatus: GroupStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    setUpdatingId(`${groupId}-status`);
    setErrorMessage(null);
    try {
      await updateGroup(groupId, { status: newStatus });
      setSuccessMessage(`Successfully updated ${groupId.toUpperCase()} status to ${newStatus}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to update group status: ${err?.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle saving modified Join Link
  const handleSaveJoinLink = async (groupId: string) => {
    const linkToSave = localLinks[groupId] || '';
    setUpdatingId(`${groupId}-link`);
    setErrorMessage(null);
    try {
      await updateGroup(groupId, { joinLink: linkToSave });
      setSuccessMessage(`Successfully saved new join link for ${groupId.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to update join link: ${err?.message || 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col gap-10 md:gap-14">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10"
      >
        <div>
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Shield size={20} className="animate-pulse" />
            <span className="text-xs sm:text-sm font-mono tracking-widest uppercase">Admin System Gateway</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter">ADMIN PANEL</h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Authorized admin profile: <strong className="text-blue-400">{user?.email}</strong>
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="self-start md:self-center flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-zinc-300 hover:text-red-400 font-bold rounded-xl transition-all duration-300 text-sm"
        >
          <LogOut size={16} /> Logout Profile
        </button>
      </motion.header>

      {/* Real-Time Database Information Notification Block */}
      <AnimatePresence>
        {(successMessage || errorMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md text-sm font-semibold",
              successMessage 
                ? "bg-green-500/10 border-green-500/20 text-green-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            )}
          >
            {successMessage ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{successMessage || errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyberpunk Interactive Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {Object.values(staticGroups).map((staticGroup, index) => {
          const liveGroup = liveGroups[staticGroup.id];
          const currentStatus: GroupStatus = liveGroup?.status || (staticGroup.status as GroupStatus);
          const currentJoinLink = liveGroup?.joinLink || staticGroup.joinLink;

          const isStatusUpdating = updatingId === `${staticGroup.id}-status`;
          const isLinkUpdating = updatingId === `${staticGroup.id}-link`;

          return (
            <motion.div
              key={staticGroup.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative group bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col hover:border-white/20 transition-all duration-300 shadow-2xl"
            >
              <div className="absolute top-0 inset-x-0 h-1 rounded-t-[2rem] opacity-70 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 via-indigo-500 to-slate-500" />
              
              {/* Group Title and Tagline */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 bg-white/5 border border-white/10 rounded-full text-zinc-400 uppercase tracking-widest">
                  ID: {staticGroup.id}
                </span>
                <Globe size={20} className="text-zinc-500" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{staticGroup.name}</h2>
              <p className="text-xs text-zinc-500 font-mono tracking-widest mb-6 mt-1 uppercase">{staticGroup.fullName}</p>

              {/* Status Management Row */}
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-mono text-zinc-400 block uppercase tracking-wide">Status Control</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full animate-pulse",
                      currentStatus === 'OPEN' ? 'bg-green-400' : 'bg-red-400'
                    )} />
                    <span className={cn(
                      "text-sm font-extrabold uppercase",
                      currentStatus === 'OPEN' ? 'text-green-400' : 'text-red-400'
                    )}>
                      {currentStatus}
                    </span>
                  </div>
                </div>

                <button
                  disabled={isStatusUpdating}
                  onClick={() => handleStatusToggle(staticGroup.id, currentStatus)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all duration-300 flex items-center gap-2",
                    currentStatus === 'OPEN'
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/30"
                      : "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 hover:border-green-500/30",
                    isStatusUpdating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isStatusUpdating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : currentStatus === 'OPEN' ? (
                    "Close Access"
                  ) : (
                    "Open Access"
                  )}
                </button>
              </div>

              {/* Join Link Management */}
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                  <LinkIcon size={12} /> Live Recruitment Link
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={localLinks[staticGroup.id] !== undefined ? localLinks[staticGroup.id] : currentJoinLink}
                    onChange={(e) => setLocalLinks({ ...localLinks, [staticGroup.id]: e.target.value })}
                    className="flex-1 text-sm bg-zinc-950/80 border border-white/10 focus:border-blue-500 text-white p-3 rounded-xl focus:outline-none transition-colors"
                    placeholder="Enter selection group URL..."
                  />
                  <button
                    disabled={isLinkUpdating}
                    onClick={() => handleSaveJoinLink(staticGroup.id)}
                    className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    {isLinkUpdating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
                <p className="text-zinc-500 text-[11px] font-mono mt-1 break-all">
                  Active Link: {currentJoinLink || <em className="text-zinc-600">No active link set</em>}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

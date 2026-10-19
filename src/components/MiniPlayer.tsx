import React from 'react';
import { useMusic } from '../context/MusicContext';
import { Play, Pause, Disc3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function MiniPlayer() {
  const { currentSong, isPlaying, togglePlay } = useMusic();
  const location = useLocation();
  const navigate = useNavigate();

  // Kalau nggak ada lagu atau lagi di halaman /music, sembunyiin mini player-nya
  if (!currentSong || location.pathname === '/music') return null;

  return (
    <div 
      onClick={() => navigate('/music')}
      className="fixed bottom-6 right-6 z-50 bg-zinc-950/90 border border-white/20 backdrop-blur-xl p-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:border-purple-500/50 transition-all max-w-xs group"
    >
      <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0">
        <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Disc3 size={18} className="text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-xs font-bold text-white truncate">{currentSong.title}</h4>
        <p className="text-[10px] text-zinc-400 truncate">{currentSong.artist}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black ml-0.5" />}
      </button>
    </div>
  );
}

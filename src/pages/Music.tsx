import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Play, Pause, Lock, Unlock, Music as MusicIcon, 
  RotateCcw, RotateCw, ListMusic, Key, Plus, Volume2, VolumeX, Trash2,
  Repeat, SkipBack, SkipForward, PlusCircle
} from 'lucide-react';
import { Translate } from '../App';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../hooks/useAuth';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const ADMIN_EMAILS = ['ochalopha@gmail.com', 'furrsocietyclan@gmail.com'];

export function Music() {
  const { user } = useAuth();

  const {
    currentSong, isPlaying, currentTime, duration, volume, isRepeat, playlists,
    playSong, togglePlay, toggleRepeat, playNext, playPrev, seekBy, handleSeekChange, setVolumeLevel, createPlaylist, deletePlaylist, addSongToPlaylist
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // State Modal Pilih Playlist untuk Tambah Lagu
  const [selectedSongForPl, setSelectedSongForPl] = useState<any | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // State Drawer & Form Playlist Baru
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [unlockedPlaylists, setUnlockedPlaylists] = useState<string[]>([]);
  const [inputPassword, setInputPassword] = useState<{ [key: string]: string }>({});

  const [newPlName, setNewPlName] = useState('');
  const [newPlIsLocked, setNewPlIsLocked] = useState(false);
  const [newPlPassword, setNewPlPassword] = useState('');
  const [showAddPlForm, setShowAddPlForm] = useState(false);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  // Fetch Rekomendasi/Saran Ejaan lewat Serverless Proxy lokal (Bebas CORS)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        fetch(`/api/search-music?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[1]) {
              setSuggestions(data[1]);
              setShowSuggestions(true);
            }
          })
          .catch(() => setSuggestions([]));
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tutup dropdown rekomendasi pas klik di luar search bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setIsMuted(newVol === 0);
    setVolumeLevel(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolumeLevel(volume || 80);
      setIsMuted(false);
    } else {
      setVolumeLevel(0);
      setIsMuted(true);
    }
  };

  // Jalankan pencarian lagu
  const executeSearch = async (query: string) => {
    if (!query.trim()) return;

    if (!YOUTUBE_API_KEY) {
      alert("API Key belum diset di file .env!");
      return;
    }

    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query + ' audio')}&type=video&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data && data.items && data.items.length > 0) {
        const mappedSongs = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
        }));

        setSearchResults(mappedSongs);
        playSong(mappedSongs[0], mappedSongs);
      } else {
        alert("Lagu tidak ditemukan!");
      }
    } catch (err) {
      console.error("Pencarian gagal:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleSelectSuggestion = (text: string) => {
    setSearchQuery(text);
    executeSearch(text);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;

    try {
      await createPlaylist(newPlName.trim(), newPlIsLocked, newPlPassword);
      setNewPlName('');
      setNewPlPassword('');
      setNewPlIsLocked(false);
      setShowAddPlForm(false);
    } catch (err) {
      console.error("Gagal buat playlist:", err);
      alert("Gagal menambahkan playlist ke database.");
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!isAdmin) {
      alert("Akses ditolak! Hanya admin terdaftar yang dapat menghapus playlist.");
      return;
    }

    if (!confirm("Yakin ingin menghapus playlist ini?")) return;
    try {
      await deletePlaylist(playlistId);
    } catch (err) {
      console.error("Gagal hapus playlist:", err);
      alert("Gagal menghapus playlist dari database.");
    }
  };

  const unlockPlaylist = (playlistId: string, pass: string) => {
    const target = playlists.find(p => p.id === playlistId);
    if (target && target.password === pass) {
      setUnlockedPlaylists(prev => [...prev, playlistId]);
      setInputPassword(prev => ({ ...prev, [playlistId]: '' }));
    } else {
      alert("Password playlist salah!");
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-32 sm:pb-36 flex flex-col gap-5 sm:gap-6 relative z-10">
      
      {/* Top Controls Bar - Responsive Layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Row 1 di HP: Playlist + Volume */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <button
            onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
            className="flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-zinc-900/80 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg shrink-0"
            title="Buka Playlist"
          >
            <ListMusic size={18} className="text-purple-400" />
            <span className="text-xs font-bold"><Translate text="Playlists" /></span>
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-md">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-purple-400" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 accent-purple-500 bg-white/20 h-1.5 rounded-lg cursor-pointer"
              title={`Volume: ${isMuted ? 0 : volume}%`}
            />
          </div>
        </div>

        {/* Row 2 di HP: Search Input */}
        <div ref={searchContainerRef} className="relative flex-1 w-full sm:max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Cari lagu di Music Lounge..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-full bg-zinc-900/60 border border-white/10 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 backdrop-blur-md transition-all"
            />
          </form>

          {/* Dropdown Rekomendasi YouTube */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute left-0 right-0 top-full mt-2 bg-zinc-950/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 py-2 max-h-60 overflow-y-auto"
              >
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(item)}
                    className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 text-xs text-zinc-200 transition-colors"
                  >
                    <Search size={12} className="text-purple-400 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* HERO BANNER MUSICOLET - RESPONSIVE MOBILE */}
      {currentSong ? (
        <div className="relative w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden border border-white/15 bg-zinc-950 p-5 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${currentSong.cover})` }}
          />

          <div className="relative z-10 w-36 h-36 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0">
            <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
          </div>

          <div className="relative z-10 flex-1 w-full min-w-0 flex flex-col gap-3 sm:gap-4 text-center md:text-left">
            <div className="flex items-start justify-between gap-3 w-full">
              <div className="flex-1 min-w-0">
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full inline-block mb-1.5">
                  Now Playing
                </span>
                <h1 className="text-lg sm:text-3xl font-extrabold text-white tracking-tight truncate w-full">
                  {currentSong.title}
                </h1>
                <p className="text-xs sm:text-base text-zinc-300 font-medium mt-0.5 truncate w-full">
                  {currentSong.artist}
                </p>
              </div>

              <button
                onClick={() => setSelectedSongForPl(currentSong)}
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/40 text-zinc-300 hover:text-purple-300 transition-all shrink-0 active:scale-95"
                title="Tambah Lagu Ini ke Playlist"
              >
                <PlusCircle size={18} />
              </button>
            </div>

            {/* Seek Bar dengan Lebar yang Terkunci Aman di dalam Card */}
            <div className="flex flex-col gap-1 w-full pt-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => handleSeekChange(Number(e.target.value))}
                className="w-full accent-purple-500 bg-white/20 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] sm:text-[11px] text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 pt-1 flex-wrap">
              <button
                onClick={toggleRepeat}
                className={`p-2.5 sm:p-3 rounded-full border transition-all active:scale-90 ${
                  isRepeat 
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/30' 
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
                title={isRepeat ? "Repeat 1 Song Active" : "Repeat Off"}
              >
                <Repeat size={16} />
              </button>

              <button
                onClick={playPrev}
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90"
              >
                <SkipBack size={16} />
              </button>

              <button
                onClick={() => seekBy(-5)}
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90 flex items-center"
              >
                <RotateCcw size={14} />
                <span className="text-[9px] sm:text-[10px] font-bold ml-1">5s</span>
              </button>

              <button
                onClick={togglePlay}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0"
              >
                {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-0.5" />}
              </button>

              <button
                onClick={() => seekBy(5)}
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90 flex items-center"
              >
                <span className="text-[9px] sm:text-[10px] font-bold mr-1">5s</span>
                <RotateCw size={14} />
              </button>

              <button
                onClick={playNext}
                className="p-2.5 sm:p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90"
              >
                <SkipForward size={16} />
              </button>
            </div>

          </div>
        </div>
      ) : (
        <div className="w-full rounded-3xl sm:rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-6 sm:p-8 text-center backdrop-blur-md">
          <MusicIcon size={36} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-zinc-400 text-xs sm:text-sm">Ketik nama lagu di atas untuk memutar musik pilihanmu.</p>
        </div>
      )}

      {/* HASIL PENCARIAN */}
      {searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MusicIcon size={16} className="text-purple-400" />
            <Translate text="Hasil Pencarian Lagu" />
          </h2>

          <div className="flex flex-col gap-2">
            {searchResults.map((song) => {
              const isSelected = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all backdrop-blur-md ${
                    isSelected 
                      ? 'bg-purple-500/15 border-purple-500/40' 
                      : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => playSong(song, searchResults)}>
                    <img src={song.cover} alt={song.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shrink-0" />
                    <div className="truncate min-w-0">
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedSongForPl(song)}
                      className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-300 transition-all active:scale-90"
                      title="Tambah ke Playlist"
                    >
                      <PlusCircle size={16} />
                    </button>

                    <button
                      onClick={() => playSong(song, searchResults)}
                      className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all active:scale-90"
                    >
                      {isSelected && isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL POP-UP PILIH PLAYLIST */}
      <AnimatePresence>
        {selectedSongForPl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-zinc-950 border border-white/15 p-5 sm:p-6 rounded-3xl max-w-sm w-full flex flex-col gap-4 shadow-2xl">
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Pilih Playlist untuk <span className="text-purple-400 block truncate mt-1">"{selectedSongForPl.title}"</span>
              </h3>

              <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">Belum ada playlist. Buat playlist baru di menu samping.</p>
                ) : (
                  playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={async () => {
                        if (addSongToPlaylist) {
                          await addSongToPlaylist(pl.id, selectedSongForPl);
                        }
                        setSelectedSongForPl(null);
                      }}
                      className="w-full text-left p-2.5 sm:p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/5 hover:border-purple-500/30 text-xs font-bold text-white transition-all flex items-center justify-between"
                    >
                      <span className="truncate">{pl.name}</span>
                      <span className="text-[10px] text-zinc-400 font-normal shrink-0 ml-2">{pl.songs?.length || 0} lagu</span>
                    </button>
                  ))
                )}
              </div>

              <button
                onClick={() => setSelectedSongForPl(null)}
                className="w-full py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all"
              >
                Batal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAWER PLAYLIST RESPONSIVE MOBILE - Z-INDEX 70 AGAR TIDAK TERTUTUP MENU NAVIGASI */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-y-0 left-0 w-full sm:max-w-md bg-zinc-950/98 border-r border-white/15 backdrop-blur-2xl z-[70] p-5 sm:p-6 flex flex-col gap-5 sm:gap-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between pt-2">
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <ListMusic size={18} className="text-purple-400" />
                <Translate text="Playlists Kamu" />
              </h3>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-2 px-4 rounded-full bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-white text-xs font-bold active:scale-95 transition-all shadow-md"
              >
                Tutup ✕
              </button>
            </div>

            <div>
              {!showAddPlForm ? (
                <button
                  onClick={() => setShowAddPlForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={16} /> Buat Playlist Baru
                </button>
              ) : (
                <form onSubmit={handleCreatePlaylist} className="bg-zinc-900/80 border border-white/10 p-3.5 rounded-xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-white">Tambah Playlist</h4>
                  <input
                    type="text"
                    placeholder="Nama Playlist..."
                    value={newPlName}
                    onChange={(e) => setNewPlName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                    required
                  />
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPlIsLocked}
                      onChange={(e) => setNewPlIsLocked(e.target.checked)}
                      className="accent-purple-500"
                    />
                    Kunci dengan Password
                  </label>

                  {newPlIsLocked && (
                    <input
                      type="password"
                      placeholder="Password..."
                      value={newPlPassword}
                      onChange={(e) => setNewPlPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white focus:outline-none"
                      required
                    />
                  )}

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddPlForm(false)}
                      className="px-3 py-1 bg-white/10 text-zinc-300 rounded-lg text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:gap-4">
              {playlists.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">Belum ada playlist tersimpan di Firestore.</p>
              ) : (
                playlists.map((pl) => {
                  const isUnlocked = !pl.isLocked || unlockedPlaylists.includes(pl.id);

                  return (
                    <div key={pl.id} className="bg-zinc-900/60 border border-white/10 p-3.5 sm:p-4 rounded-2xl flex flex-col gap-2.5 sm:gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {pl.isLocked && !isUnlocked ? <Lock size={14} className="text-red-400 shrink-0" /> : <Unlock size={14} className="text-emerald-400 shrink-0" />}
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">{pl.name}</h4>
                        </div>
                        
                        {/* HANYA ADMIN YANG BISA HAPUS PLAYLIST */}
                        {isAdmin && (
                          <button
                            onClick={() => handleDeletePlaylist(pl.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                            title="Hapus Playlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      {!isUnlocked ? (
                        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                          <p className="text-[10px] sm:text-[11px] text-zinc-400 flex items-center gap-1">
                            <Key size={12} />
                            Masukkan password:
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              placeholder="Password..."
                              value={inputPassword[pl.id] || ''}
                              onChange={(e) => setInputPassword({ ...inputPassword, [pl.id]: e.target.value })}
                              className="flex-1 bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={() => unlockPlaylist(pl.id, inputPassword[pl.id])}
                              className="px-3 py-1 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-xs font-bold"
                            >
                              Unlock
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                          {(!pl.songs || pl.songs.length === 0) ? (
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 text-center py-2">Playlist ini masih kosong.</p>
                          ) : (
                            pl.songs.map((s) => (
                              <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                                <span className="text-xs text-zinc-300 truncate max-w-[180px] sm:max-w-[200px]">{s.title}</span>
                                <button onClick={() => playSong(s)} className="p-1 hover:bg-white/10 rounded-full text-white">
                                  <Play size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Play, Pause, Lock, Unlock, Music as MusicIcon, 
  RotateCcw, RotateCw, ListMusic, Key, Volume2, Plus, Check 
} from 'lucide-react';
import { Translate } from '../App';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  previewUrl: string;
  duration?: number;
}

interface Playlist {
  id: string;
  name: string;
  isLocked: boolean;
  password?: string;
  songs: Song[];
}

export function Music() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // State Playlist & Drawer Ujung Kiri
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [unlockedPlaylists, setUnlockedPlaylists] = useState<string[]>([]);
  const [inputPassword, setInputPassword] = useState<{ [key: string]: string }>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>([
    {
      id: 'pl-1',
      name: 'FSG Public Lounge',
      isLocked: false,
      songs: []
    },
    {
      id: 'pl-2',
      name: 'Juno Private Vault',
      isLocked: true,
      password: '123',
      songs: []
    }
  ]);

  // Search Song via iTunes API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=15`);
      const data = await res.json();

      const mappedSongs: Song[] = data.results.map((item: any) => ({
        id: String(item.trackId),
        title: item.trackName,
        artist: item.artistName,
        cover: item.artworkUrl100.replace('100x100bb', '600x600bb'),
        previewUrl: item.previewUrl,
        duration: 30 // iTunes Preview standard 30s
      }));

      setSearchResults(mappedSongs);
      // Set lagu pertama hasil pencarian ke banner otomatis jika belum ada lagu yang diputar
      if (mappedSongs.length > 0 && !currentSong) {
        setCurrentSong(mappedSongs[0]);
      }
    } catch (err) {
      console.error("Error fetching music:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.previewUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Maju / Mundur 5 Detik
  const seekBy = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      Math.max(audioRef.current.currentTime + seconds, 0),
      duration
    );
  };

  // Format detik ke Menit:Detik
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.songs.some(s => s.id === song.id);
        if (exists) return pl;
        return { ...pl, songs: [...pl.songs, song] };
      }
      return pl;
    }));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-36 flex flex-col gap-8 relative z-10">
      
      {/* Hidden Audio Tag */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Controls Bar: Tombol Playlist di Ujung Kiri + Search Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Tombol Playlist Kecil di Ujung Kiri */}
        <button
          onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-900/80 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg shrink-0"
          title="Buka Playlist"
        >
          <ListMusic size={20} className="text-purple-400" />
          <span className="text-xs font-bold hidden sm:inline"><Translate text="Playlists" /></span>
        </button>

        {/* Search Bar ala Spotify */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu, artist, album..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-zinc-900/60 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 backdrop-blur-md transition-all"
          />
        </form>
      </div>

      {/* BANNER OTOMATIS DARI LAGU YANG DICARI / DIPUTAR */}
      {currentSong ? (
        <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/15 bg-zinc-950 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          {/* Blurred Background Art */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${currentSong.cover})` }}
          />

          {/* Album Cover Art */}
          <div className="relative z-10 w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0">
            <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
          </div>

          {/* Detailed Info & Controls Musicolet Style */}
          <div className="relative z-10 flex-1 w-full flex flex-col gap-4 text-center md:text-left">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full inline-block mb-2">
                Now Playing
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight line-clamp-1">
                {currentSong.title}
              </h1>
              <p className="text-sm sm:text-lg text-zinc-300 font-medium mt-1">
                {currentSong.artist}
              </p>
            </div>

            {/* Seek Bar + Timer */}
            <div className="flex flex-col gap-1.5 w-full pt-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (audioRef.current) audioRef.current.currentTime = val;
                  setCurrentTime(val);
                }}
                className="w-full accent-purple-500 bg-white/20 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons: Play/Pause & -5s / +5s */}
            <div className="flex items-center justify-center md:justify-start gap-4 pt-1">
              {/* Mundur 5s */}
              <button
                onClick={() => seekBy(-5)}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90 flex items-center justify-center"
                title="Mundur 5 detik"
              >
                <RotateCcw size={18} />
                <span className="text-[10px] font-bold ml-1">5s</span>
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                {isPlaying ? <Pause size={24} className="fill-black" /> : <Play size={24} className="fill-black ml-1" />}
              </button>

              {/* Maju 5s */}
              <button
                onClick={() => seekBy(5)}
                className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-white transition-all active:scale-90 flex items-center justify-center"
                title="Maju 5 detik"
              >
                <span className="text-[10px] font-bold mr-1">5s</span>
                <RotateCw size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Banner Placeholder */
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-8 text-center backdrop-blur-md">
          <MusicIcon size={48} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-zinc-400 text-sm">Cari lagu di atas untuk menampilkan Banner & Pemutar Musik.</p>
        </div>
      )}

      {/* HASIL PENCARIAN (COMPACT LIST ALA MUSICOLET) */}
      {searchResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MusicIcon size={18} className="text-purple-400" />
            <Translate text="Hasil Pencarian Lagu" />
          </h2>

          <div className="flex flex-col gap-2">
            {searchResults.map((song) => {
              const isSelected = currentSong?.id === song.id;

              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all backdrop-blur-md ${
                    isSelected 
                      ? 'bg-purple-500/15 border-purple-500/40' 
                      : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Left: Cover & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => playSong(song)}>
                    <img src={song.cover} alt={song.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="truncate">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Fast Play Button */}
                    <button
                      onClick={() => playSong(song)}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all"
                    >
                      {isSelected && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    {/* Add to Playlist Quick Button */}
                    <button
                      onClick={() => addToPlaylist('pl-1', song)}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-purple-500/20 text-zinc-400 hover:text-purple-300 transition-all"
                      title="Tambah ke Public Playlist"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRAWER / MODAL PLAYLIST (DARI TOMBOL UJUNG KIRI) */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-y-0 left-0 w-full max-w-md bg-zinc-950/95 border-r border-white/15 backdrop-blur-2xl z-50 p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ListMusic size={20} className="text-purple-400" />
                <Translate text="Playlists Kamu" />
              </h3>
              <button
                onClick={() => setIsPlaylistOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
              >
                Tutup
              </button>
            </div>

            {/* List Playlist */}
            <div className="flex flex-col gap-4">
              {playlists.map((pl) => {
                const isUnlocked = !pl.isLocked || unlockedPlaylists.includes(pl.id);

                return (
                  <div key={pl.id} className="bg-zinc-900/60 border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pl.isLocked && !isUnlocked ? <Lock size={16} className="text-red-400" /> : <Unlock size={16} className="text-emerald-400" />}
                        <h4 className="font-bold text-sm text-white">{pl.name}</h4>
                      </div>
                      <span className="text-[10px] bg-white/10 px-2.5 py-0.5 rounded-full text-zinc-300">
                        {pl.songs.length} Lagu
                      </span>
                    </div>

                    {!isUnlocked ? (
                      <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                        <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Key size={12} />
                          Masukkan password:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            placeholder="Password..."
                            value={inputPassword[pl.id] || ''}
                            onChange={(e) => setInputPassword({ ...inputPassword, [pl.id]: e.target.value })}
                            className="flex-1 bg-black/50 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-white focus:outline-none"
                          />
                          <button
                            onClick={() => unlockPlaylist(pl.id, inputPassword[pl.id])}
                            className="px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl text-xs font-bold"
                          >
                            Unlock
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                        {pl.songs.length === 0 ? (
                          <p className="text-[11px] text-zinc-500 text-center py-2">Playlist ini masih kosong.</p>
                        ) : (
                          pl.songs.map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5">
                              <span className="text-xs text-zinc-300 truncate max-w-[200px]">{s.title}</span>
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
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

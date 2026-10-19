import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Play, Lock, Unlock, Music as MusicIcon, 
  ListMusic, Key, Plus, Disc3
} from 'lucide-react';
import { Translate } from '../App';

interface Song {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  cover: string;
}

interface Playlist {
  id: string;
  name: string;
  isLocked: boolean;
  password?: string;
  songs: Song[];
}

// Mengambil YouTube Data API Key dari file .env
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export function Music() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [unlockedPlaylists, setUnlockedPlaylists] = useState<string[]>([]);
  const [inputPassword, setInputPassword] = useState<{ [key: string]: string }>({});

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

  const playSong = (song: Song) => {
    setCurrentSong(song);
  };

  // Search Song via YouTube Data API v3 Resmi
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!YOUTUBE_API_KEY) {
      alert("API Key belum diset di file .env (VITE_YOUTUBE_API_KEY)!");
      return;
    }

    setIsSearching(true);
    try {
      const endpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(searchQuery + ' audio')}&type=video&key=${YOUTUBE_API_KEY}`;
      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.error) {
        console.error("YouTube API Error:", data.error);
        alert(`YouTube API Error: ${data.error.message}`);
        return;
      }

      if (data && data.items && data.items.length > 0) {
        const mappedSongs: Song[] = data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          cover: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
        }));

        setSearchResults(mappedSongs);
        playSong(mappedSongs[0]);
      } else {
        alert("Lagu tidak ditemukan!");
      }
    } catch (err) {
      console.error("Pencarian gagal:", err);
    } finally {
      setIsSearching(false);
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
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setIsPlaylistOpen(!isPlaylistOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-zinc-900/80 border border-white/10 hover:bg-white/10 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg shrink-0"
          title="Buka Playlist"
        >
          <ListMusic size={20} className="text-purple-400" />
          <span className="text-xs font-bold hidden sm:inline"><Translate text="Playlists" /></span>
        </button>

        <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu di YouTube Music..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-zinc-900/60 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 backdrop-blur-md transition-all"
          />
        </form>
      </div>

      {/* HERO BANNER MUSICOLET (AUDIO ONLY MODE) */}
      {currentSong ? (
        <div className="relative w-full rounded-[2.5rem] overflow-hidden border border-white/15 bg-zinc-950 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-125 pointer-events-none"
            style={{ backgroundImage: `url(${currentSong.cover})` }}
          />

          <div className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shrink-0 group">
            <img src={currentSong.cover} alt={currentSong.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Disc3 size={40} className="text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="relative z-10 flex-1 w-full flex flex-col gap-4 text-center md:text-left">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full inline-block mb-2">
                Audio Stream (Full Version)
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight line-clamp-1">
                {currentSong.title}
              </h1>
              <p className="text-sm sm:text-lg text-zinc-300 font-medium mt-1">
                {currentSong.artist}
              </p>
            </div>

            {/* MINI AUDIO PLAYER (IFRAME TRANSPARAN TANPA TAMPILAN VIDEO) */}
            <div className="w-full h-14 rounded-2xl border border-white/10 bg-black/40 overflow-hidden relative backdrop-blur-md flex items-center px-4 gap-3">
              <Disc3 size={20} className="text-purple-400 animate-spin shrink-0" style={{ animationDuration: '4s' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-200 truncate">Memutar audio dari YouTube...</p>
                <p className="text-[10px] text-zinc-400 truncate">Gunakan kontrol pada pemutar di bawah jika diperlukan</p>
              </div>

              {/* Player Iframe Resmi YouTube yang disembunyikan secara visual */}
              <iframe
                key={currentSong.id}
                title={currentSong.title}
                className="w-full h-full absolute inset-0 opacity-15 hover:opacity-100 transition-opacity z-10"
                src={`https://www.youtube-nocookie.com/embed/${currentSong.id}?autoplay=1&controls=1`}
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-zinc-900/30 p-8 text-center backdrop-blur-md">
          <MusicIcon size={48} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-zinc-400 text-sm">Ketik nama lagu di atas untuk memutar musik pilihanmu.</p>
        </div>
      )}

      {/* HASIL PENCARIAN (MUSICOLET STYLE) */}
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
                  <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => playSong(song)}>
                    <img src={song.cover} alt={song.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="truncate">
                      <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => playSong(song)}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white transition-all"
                    >
                      <Play size={16} />
                    </button>

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

      {/* DRAWER PLAYLIST */}
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

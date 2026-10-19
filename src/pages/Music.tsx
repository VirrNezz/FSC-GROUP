import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, Pause, Lock, Unlock, Plus, Music as MusicIcon, Volume2, Key } from 'lucide-react';
import { Translate } from '../App';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  previewUrl: string;
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
  const [unlockedPlaylists, setUnlockedPlaylists] = useState<string[]>([]);
  const [inputPassword, setInputPassword] = useState<{ [key: string]: string }>({});

  // Sample data playlist (nantinya di-fetch dari Database)
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
      password: '123', // Dalam produksi disimpan dalam hash
      songs: []
    }
  ]);

  // Fungsi pencarian lagu via Deezer API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&output=jsonp&callback=deezerCallback`);
      // Karena Deezer pakai JSONP untuk CORS di frontend direct, atau gunakan serverless proxy endpoint
      // Alternatif lain menggunakan iTunes Search API sederhana:
      const fallbackRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&entity=song&limit=10`);
      const data = await fallbackRes.json();

      const mappedSongs: Song[] = data.results.map((item: any) => ({
        id: String(item.trackId),
        title: item.trackName,
        artist: item.artistName,
        cover: item.artworkUrl100.replace('100x100bb', '300x300bb'),
        previewUrl: item.previewUrl
      }));

      setSearchResults(mappedSongs);
    } catch (err) {
      console.error("Gagal mencari lagu:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const unlockPlaylist = (playlistId: string, pass: string) => {
    const target = playlists.find(p => p.id === playlistId);
    if (target && target.password === pass) {
      setUnlockedPlaylists(prev => [...prev, playlistId]);
      alert("Playlist berhasil dibuka!");
    } else {
      alert("Password playlist salah!");
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-32 flex flex-col gap-10 relative z-10">
      
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            <Translate text="FSG Music Lounge" />
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-1">
            <Translate text="Dengarkan musik favorit dan kelola playlist pribadi kamu." />
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu, artis..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-zinc-900/60 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500 backdrop-blur-md transition-all"
          />
        </form>
      </div>

      {/* Grid Hasil Pencarian */}
      {searchResults.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MusicIcon size={20} className="text-blue-400" />
            <Translate text="Hasil Pencarian" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {searchResults.map((song) => (
              <div key={song.id} className="bg-zinc-900/40 border border-white/10 p-4 rounded-2xl flex flex-col justify-between group hover:bg-zinc-800/50 transition-all">
                <div className="relative mb-3 overflow-hidden rounded-xl">
                  <img src={song.cover} alt={song.title} className="w-full aspect-square object-cover" />
                  <button
                    onClick={() => { setCurrentSong(song); setIsPlaying(true); }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="fill-white text-white" size={32} />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate">{song.title}</h3>
                  <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Playlists */}
      <div className="flex flex-col gap-6 pt-6">
        <h2 className="text-2xl font-bold"><Translate text="Your Playlists" /></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {playlists.map((pl) => {
            const isUnlocked = !pl.isLocked || unlockedPlaylists.includes(pl.id);

            return (
              <div key={pl.id} className="bg-zinc-900/40 border border-white/10 backdrop-blur-md p-6 rounded-3xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pl.isLocked && !isUnlocked ? <Lock className="text-red-400" size={20} /> : <Unlock className="text-emerald-400" size={20} />}
                    <h3 className="text-xl font-bold">{pl.name}</h3>
                  </div>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-zinc-300">
                    {pl.songs.length} Track
                  </span>
                </div>

                {!isUnlocked ? (
                  <div className="flex flex-col gap-3 py-4 border-t border-white/10">
                    <p className="text-xs text-zinc-400"><Translate text="Masukkan password untuk membuka playlist ini:" /></p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        placeholder="Password..."
                        value={inputPassword[pl.id] || ''}
                        onChange={(e) => setInputPassword({ ...inputPassword, [pl.id]: e.target.value })}
                        className="flex-1 bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => unlockPlaylist(pl.id, inputPassword[pl.id])}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-xs font-bold transition-all"
                      >
                        Unlock
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                    {pl.songs.length === 0 ? (
                      <p className="text-xs text-zinc-500 py-4 text-center"><Translate text="Playlist masih kosong." /></p>
                    ) : (
                      pl.songs.map((song) => (
                        <div key={song.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all">
                          <div className="flex items-center gap-3">
                            <img src={song.cover} className="w-10 h-10 rounded-lg object-cover" />
                            <div>
                              <p className="text-xs font-bold text-white">{song.title}</p>
                              <p className="text-[10px] text-zinc-400">{song.artist}</p>
                            </div>
                          </div>
                          <button onClick={() => { setCurrentSong(song); setIsPlaying(true); }}>
                            <Play size={16} className="text-white" />
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
      </div>

      {/* Floating Mini Player persistent at bottom */}
      {currentSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-zinc-950/80 border border-white/15 backdrop-blur-2xl p-4 rounded-2xl flex items-center justify-between gap-4 z-50 shadow-2xl"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={currentSong.cover} className="w-12 h-12 rounded-xl object-cover" />
            <div className="truncate">
              <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
              <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
            </div>
          </div>

          <audio src={currentSong.previewUrl} autoPlay={isPlaying} onEnded={() => setIsPlaying(false)} />

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 hover:scale-105 transition-all"
          >
            {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-0.5" />}
          </button>
        </motion.div>
      )}
    </div>
  );
}

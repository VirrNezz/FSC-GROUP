import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import CustomAlert from '../components/alert';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
}

export interface Playlist {
  id: string;
  name: string;
  isLocked: boolean;
  password?: string;
  songs: Song[];
}

interface MusicContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: 'off' | 'song' | 'playlist';
  playlists: Playlist[];
  unlockedPlaylists: string[]; // <-- Tambahan state playlist yang terbuka
  playSong: (song: Song, songList?: Song[]) => void;
  togglePlay: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekBy: (seconds: number) => void;
  handleSeekChange: (targetTime: number) => void;
  setVolumeLevel: (val: number) => void;
  createPlaylist: (name: string, isLocked: boolean, password?: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, song: Song) => Promise<void>;
  playPlaylist: (playlist: Playlist) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  showAlert: (message: string, type?: 'success' | 'error' | 'info') => void;
  unlockPlaylist: (playlistId: string) => void; // <-- Fungsi unlock playlist
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Load lagu terakhir dari localStorage
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    try {
      const saved = localStorage.getItem('fsc_current_song');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [queue, setQueue] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('fsc_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Load detik lagu terakhir agar tidak mengulang dari 0
  const [currentTime, setCurrentTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fsc_current_time');
      return saved ? parseFloat(saved) : 0;
    } catch {
      return 0;
    }
  });

  // 3. Load daftar ID playlist yang sudah di-unlock agar tidak terkunci kembali saat refresh
  const [unlockedPlaylists, setUnlockedPlaylists] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fsc_unlocked_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [repeatMode, setRepeatMode] = useState<'off' | 'song' | 'playlist'>('off');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // State Global Alert
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showAlert = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertState({ isOpen: true, message, type });
  };

  const closeAlert = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isInitialized = useRef(false);

  const repeatModeRef = useRef(repeatMode);
  const queueRef = useRef(queue);
  const currentSongRef = useRef(currentSong);

  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // Simpan data ke localStorage setiap kali berubah
  useEffect(() => {
    try {
      if (currentSong) {
        localStorage.setItem('fsc_current_song', JSON.stringify(currentSong));
      } else {
        localStorage.removeItem('fsc_current_song');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentSong]);

  useEffect(() => {
    try {
      localStorage.setItem('fsc_queue', JSON.stringify(queue));
    } catch (e) {
      console.error(e);
    }
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('fsc_unlocked_playlists', JSON.stringify(unlockedPlaylists));
    } catch (e) {
      console.error(e);
    }
  }, [unlockedPlaylists]);

  // Fungsi untuk meng-unlock playlist
  const unlockPlaylist = (playlistId: string) => {
    if (!unlockedPlaylists.includes(playlistId)) {
      setUnlockedPlaylists(prev => [...prev, playlistId]);
    }
  };

  // Load YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT && window.YT.Player && currentSong && !isInitialized.current) {
        isInitialized.current = true;
        clearInterval(checkYT);
        
        playerRef.current = new window.YT.Player('global-yt-player', {
          height: '1',
          width: '1',
          videoId: currentSong.id,
          playerVars: { 
            autoplay: 0, 
            controls: 0,
            playsinline: 1,
            start: Math.floor(currentTime) // Mulai dari detik terakhir sebelum di-refresh
          },
          events: {
            onReady: (e: any) => {
              e.target.setVolume(volume);
            },
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                updateMediaSession();
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (e.data === window.YT.PlayerState.ENDED) {
                if (repeatModeRef.current === 'song') {
                  playerRef.current.seekTo(0, true);
                  playerRef.current.playVideo();
                  setIsPlaying(true);
                } else {
                  handleAutoNext();
                }
              }
            }
          }
        });
      }
    }, 300);

    return () => clearInterval(checkYT);
  }, []);

  // Fetch Firebase Playlists Realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'playlists'), (snapshot) => {
      const docs: Playlist[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Playlist, 'id'>) }));
      setPlaylists(docs);
    });
    return () => unsub();
  }, []);

  // Time Loop Update & Simpan Detik Lagu Terakhir
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const t = playerRef.current.getCurrentTime();
          setCurrentTime(t);
          setDuration(playerRef.current.getDuration() || 0);
          try {
            localStorage.setItem('fsc_current_time', t.toString());
          } catch (e) {}
        }
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  // MediaSession API untuk Pemutaran Background di HP
  const updateMediaSession = () => {
    if ('mediaSession' in navigator && currentSongRef.current) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSongRef.current.title,
        artist: currentSongRef.current.artist,
        album: 'Music Lounge',
        artwork: [{ src: currentSongRef.current.cover, sizes: '512x512', type: 'image/png' }]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
  };

  const initPlayer = (videoId: string, startTime: number = 0) => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById({ videoId, startSeconds: startTime });
      setIsPlaying(true);
      updateMediaSession();
    } else if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('global-yt-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: { 
          autoplay: 1, 
          controls: 0,
          playsinline: 1,
          start: Math.floor(startTime)
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setIsPlaying(true);
            updateMediaSession();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              updateMediaSession();
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              if (repeatModeRef.current === 'song') {
                playerRef.current.seekTo(0, true);
                playerRef.current.playVideo();
                setIsPlaying(true);
              } else {
                handleAutoNext();
              }
            }
          }
        }
      });
    }
  };

  const handleAutoNext = () => {
    const currentList = queueRef.current;
    const current = currentSongRef.current;
    if (!current || currentList.length === 0) return;

    const currentIndex = currentList.findIndex(s => s.id === current.id);
    if (currentIndex !== -1 && currentIndex < currentList.length - 1) {
      const nextSong = currentList[currentIndex + 1];
      setCurrentSong(nextSong);
      initPlayer(nextSong.id, 0);
    } else {
      if (repeatModeRef.current === 'playlist' && currentList.length > 0) {
        const firstSong = currentList[0];
        setCurrentSong(firstSong);
        initPlayer(firstSong.id, 0);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const playSong = (song: Song, songList?: Song[]) => {
    setCurrentSong(song);
    if (songList && songList.length > 0) {
      setQueue(songList);
    }
    initPlayer(song.id, 0);
  };

  const playNext = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextSong = queue[currentIndex + 1];
      playSong(nextSong);
    }
  };

  const playPrev = () => {
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      const prevSong = queue[currentIndex - 1];
      playSong(prevSong);
    } else {
      playerRef.current?.seekTo(0, true);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'song';
      if (prev === 'song') return 'playlist';
      return 'off';
    });
  };

  const seekBy = (seconds: number) => {
    if (!playerRef.current) return;
    const newTime = Math.min(Math.max(currentTime + seconds, 0), duration);
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSeekChange = (targetTime: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(targetTime, true);
      setCurrentTime(targetTime);
    }
  };

  const setVolumeLevel = (val: number) => {
    setVolume(val);
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(val);
    }
  };

  const createPlaylist = async (name: string, isLocked: boolean, password?: string) => {
    try {
      await addDoc(collection(db, 'playlists'), { name, isLocked, password: password || '', songs: [] });
      showAlert(`Playlist "${name}" berhasil dibuat!`, 'success');
    } catch (err) {
      console.error(err);
      showAlert('Gagal menambahkan playlist ke database.', 'error');
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'playlists', id));
      showAlert('Playlist berhasil dihapus.', 'success');
    } catch (err) {
      console.error(err);
      showAlert('Gagal menghapus playlist dari database.', 'error');
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const targetPl = playlists.find(p => p.id === playlistId);
    if (!targetPl) return;

    const exists = targetPl.songs?.some(s => s.id === song.id);
    if (exists) {
      showAlert('Lagu ini sudah ada di dalam playlist!', 'error');
      return;
    }

    const updatedSongs = [...(targetPl.songs || []), song];
    await updateDoc(doc(db, 'playlists', playlistId), {
      songs: updatedSongs
    });
    showAlert(`Berhasil menambahkan "${song.title}" ke playlist "${targetPl.name}"!`, 'success');
  };

  const playPlaylist = (playlist: Playlist) => {
    if (!playlist.songs || playlist.songs.length === 0) {
      showAlert('Playlist ini masih kosong!', 'error');
      return;
    }
    playSong(playlist.songs[0], playlist.songs);
    showAlert(`Memutar playlist: ${playlist.name}`, 'success');
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    const targetPl = playlists.find(p => p.id === playlistId);
    if (!targetPl) return;

    const updatedSongs = (targetPl.songs || []).filter(s => s.id !== songId);
    await updateDoc(doc(db, 'playlists', playlistId), {
      songs: updatedSongs
    });
    showAlert('Lagu berhasil dihapus dari playlist!', 'error');
  };

  // Otomatis ubah isLocked jadi false jika ID playlist sudah tersimpan di unlockedPlaylists (localStorage)
  const syncedPlaylists = playlists.map(pl => ({
    ...pl,
    isLocked: unlockedPlaylists.includes(pl.id) ? false : pl.isLocked
  }));

  return (
    <MusicContext.Provider value={{
      currentSong, queue, isPlaying, currentTime, duration, volume, repeatMode, 
      playlists: syncedPlaylists, // Mengirim data playlist yang sudah otomatis terbuka kuncinya
      unlockedPlaylists,
      playSong, togglePlay, toggleRepeat, playNext, playPrev, seekBy, handleSeekChange, 
      setVolumeLevel, createPlaylist, deletePlaylist, addSongToPlaylist, playPlaylist, 
      removeSongFromPlaylist, showAlert, unlockPlaylist
    }}>
      {children}

      {/* Global Custom Alert Component */}
      <CustomAlert
        isOpen={alertState.isOpen}
        message={alertState.message}
        type={alertState.type}
        onClose={closeAlert}
      />

      <div className="hidden"><div id="global-yt-player" /></div>
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic harus digunakan di dalam MusicProvider");
  return context;
};

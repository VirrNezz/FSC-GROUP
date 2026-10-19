import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

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
  isRepeat: boolean;
  playlists: Playlist[];
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
}

const MusicContext = createContext<MusicContextType | null>(null);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isRepeat, setIsRepeat] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // useRef biar event handler YouTube API selalu dapet value state paling update
  const isRepeatRef = useRef(isRepeat);
  const queueRef = useRef(queue);
  const currentSongRef = useRef(currentSong);

  useEffect(() => { isRepeatRef.current = isRepeat; }, [isRepeat]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  // Load YouTube Iframe API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch Firebase Playlists Realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'playlists'), (snapshot) => {
      const docs: Playlist[] = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Playlist, 'id'>) }));
      setPlaylists(docs);
    });
    return () => unsub();
  }, []);

  // Time Loop Update
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration() || 0);
        }
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const initPlayer = (videoId: string) => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
      setIsPlaying(true);
    } else if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('global-yt-player', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(volume);
            e.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              // LOGIKA REPEAT & NEXT AUTOMATIS
              if (isRepeatRef.current) {
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
      initPlayer(nextSong.id);
    } else {
      setIsPlaying(false);
    }
  };

  const playSong = (song: Song, songList?: Song[]) => {
    setCurrentSong(song);
    if (songList && songList.length > 0) {
      setQueue(songList);
    }
    initPlayer(song.id);
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
    setIsRepeat(prev => !prev);
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
    await addDoc(collection(db, 'playlists'), { name, isLocked, password: password || '', songs: [] });
  };

  const deletePlaylist = async (id: string) => {
    await deleteDoc(doc(db, 'playlists', id));
  };

  return (
    <MusicContext.Provider value={{
      currentSong, queue, isPlaying, currentTime, duration, volume, isRepeat, playlists,
      playSong, togglePlay, toggleRepeat, playNext, playPrev, seekBy, handleSeekChange, setVolumeLevel, createPlaylist, deletePlaylist
    }}>
      {children}
      <div className="hidden"><div id="global-yt-player" /></div>
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic harus digunakan di dalam MusicProvider");
  return context;
};

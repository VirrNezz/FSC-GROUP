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
  const [unlockedPlaylists, setUnlockedPlaylists] =

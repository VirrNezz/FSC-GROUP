import React, { useState } from 'react';
import { useMusic, Playlist } from '../context/MusicContext';
import { Lock, Unlock, Play, Plus, Trash2, KeyRound } from 'lucide-react';

export function PlaylistManager() {
  const {
    playlists,
    unlockedPlaylists,
    unlockPlaylist,
    playPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    showAlert
  } = useMusic();

  // State untuk modal input password gembok playlist
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Handle ketika user klik playlist yang dikunci
  const handlePlaylistClick = (playlist: Playlist) => {
    const isUnlocked = unlockedPlaylists.includes(playlist.id);

    if (playlist.isLocked && !isUnlocked) {
      // Kalau terkunci dan belum pernah di-unlock, minta password
      setSelectedPlaylist(playlist);
      setPasswordInput('');
      setShowPasswordModal(true);
    } else {
      // Kalau sudah terbuka, langsung putar playlist-nya
      playPlaylist(playlist);
    }
  };

  // Verifikasi password yang dimasukkan user
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist) return;

    if (passwordInput === selectedPlaylist.password) {
      // Simpan status unlock ke context & localStorage
      unlockPlaylist(selectedPlaylist.id);
      showAlert(`Playlist "${selectedPlaylist.name}" berhasil dibuka!`, 'success');
      setShowPasswordModal(false);
      // Langsung putar playlist setelah berhasil dibuka
      playPlaylist(selectedPlaylist);
    } else {
      showAlert('Password salah, bro! Coba ingat-ingat lagi.', 'error');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          🎵 Koleksi Playlist FSC
        </h2>
      </div>

      {/* Grid Daftar Playlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {playlists.map((playlist) => {
          // Cek apakah playlist ini sudah di-unlock sebelumnya (tersimpan di context/localStorage)
          const isUnlocked = unlockedPlaylists.includes(playlist.id);
          const isLockedAndClosed = playlist.isLocked && !isUnlocked;

          return (
            <div
              key={playlist.id}
              className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md shadow-xl hover:border-purple-500/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-base truncate flex items-center gap-2">
                    {playlist.name}
                  </h3>
                  {/* Indikator Gembok */}
                  <span className={`p-1.5 rounded-xl text-xs flex items-center gap-1 ${isLockedAndClosed ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {isLockedAndClosed ? <Lock size={14} /> : <Unlock size={14} />}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  {playlist.songs?.length || 0} Lagu di dalam playlist
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handlePlaylistClick(playlist)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-medium py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/30"
                >
                  <Play size={14} />
                  {isLockedAndClosed ? 'Buka & Putar' : 'Putar Playlist'}
                </button>

                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  title="Hapus Playlist"
                  className="bg-zinc-800 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 p-2.5 rounded-xl transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup Masukkan Password Playlist */}
      {showPasswordModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <KeyRound size={24} />
              <h3 className="text-lg font-bold text-white">Playlist Terkunci</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Playlist <span className="text-white font-semibold">"{selectedPlaylist.name}"</span> diproteksi dengan password. Masukkan password untuk membuka dan memutarnya!
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password playlist..."
                autoFocus
                className="w-full bg-zinc-950 border border-white/10 text-white rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-2xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-2xl text-xs font-medium transition-all shadow-lg shadow-purple-600/30"
                >
                  Buka Kunci
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

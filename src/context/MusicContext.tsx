import React, { useState } from 'react';
import { useMusic } from '../context/MusicContext';
import { Lock, Unlock, Play, Trash2, KeyRound } from 'lucide-react';

// Mengambil tipe Playlist langsung dari useMusic agar aman dari error build Vercel
type Playlist = ReturnType<typeof useMusic>['playlists'][number];

export default function PlaylistSection() {
  const {
    playlists,
    unlockedPlaylists,
    unlockPlaylist,
    playPlaylist,
    deletePlaylist,
    showAlert
  } = useMusic();

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Handle klik playlist
  const handlePlaylistClick = (playlist: Playlist) => {
    // Karena MusicContext sudah otomatis membuka kunci jika ada di unlockedPlaylists,
    // kita cukup cek apakah playlist.isLocked masih true
    if (playlist.isLocked) {
      // Jika masih terkunci, tampilkan modal input password
      setSelectedPlaylist(playlist);
      setPasswordInput('');
      setShowPasswordModal(true);
    } else {
      // Jika sudah terbuka, langsung putar
      playPlaylist(playlist);
    }
  };

  // Verifikasi password
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylist) return;

    if (passwordInput === selectedPlaylist.password) {
      unlockPlaylist(selectedPlaylist.id); // Simpan permanen ke localStorage via context
      showAlert(`Playlist "${selectedPlaylist.name}" berhasil dibuka!`, 'success');
      setShowPasswordModal(false);
      playPlaylist(selectedPlaylist);
    } else {
      showAlert('Password salah, Nes! Coba ingat-ingat lagi.', 'error');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">🎵 Playlist & Koleksi Musik</h2>
      </div>

      {/* Grid List Playlist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {playlists.map((playlist) => {
          return (
            <div
              key={playlist.id}
              className="bg-zinc-900/90 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-purple-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm truncate">{playlist.name}</h3>
                  <span className={`p-1.5 rounded-xl text-xs flex items-center gap-1 ${playlist.isLocked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                    {playlist.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  {playlist.songs?.length || 0} Lagu di dalam playlist
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlaylistClick(playlist)}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-medium py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-600/30"
                >
                  <Play size={12} />
                  {playlist.isLocked ? 'Buka & Putar' : 'Putar Playlist'}
                </button>

                <button
                  onClick={() => deletePlaylist(playlist.id)}
                  title="Hapus Playlist"
                  className="bg-zinc-800 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 p-2 rounded-xl transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup Password */}
      {showPasswordModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-3 text-amber-400">
              <KeyRound size={20} />
              <h3 className="text-base font-bold text-white">Playlist Terkunci</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Masukkan password untuk membuka <span className="text-white font-semibold">"{selectedPlaylist.name}"</span>:
            </p>

            <form onSubmit={handleVerifyPassword} className="space-y-3">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan password..."
                autoFocus
                className="w-full bg-zinc-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md"
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

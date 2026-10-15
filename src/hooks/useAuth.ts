import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../firebase';

// Daftar Email Admin Resmi FSG
const ALLOWED_ADMINS = ['ochalopha@gmail.com', 'furrsocietyclan@gmail.com'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!isMounted) return;

        const email = currentUser?.email?.toLowerCase();

        // Cek apakah email user yang login ada di daftar Admin
        if (currentUser && email && ALLOWED_ADMINS.includes(email)) {
          setUser(currentUser);
          setIsAdmin(true);
        } else if (currentUser) {
          // Jika login pakai akun Google biasa (Bukan Admin):
          // Tendang/Logout otomatis & bersihkan state
          await logout();
          setUser(null);
          setIsAdmin(false);
          setError("Akses ditolak! Akun Google kamu bukan Admin resmi FSG.");
        } else {
          setUser(null);
          setIsAdmin(false);
        }

        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.error("Auth state observer error:", err);
        setError(err.message || "An error occurred during authentication.");
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginWithGoogle();
      const userEmail = result?.user?.email?.toLowerCase();

      // Pengecekan langsung saat popup selesai
      if (userEmail && !ALLOWED_ADMINS.includes(userEmail)) {
        await logout();
        setError("Akses ditolak! Akun Google kamu bukan Admin resmi FSG.");
        alert("Akses ditolak! Akun Google kamu bukan Admin resmi FSG.");
      }
    } catch (err: any) {
      console.error("Popup login error:", err);
      setError(err?.message || "Failed to complete popup authentication.");
    } finally {
      setLoading(false);
    }
  };

  return { user, isAdmin, loading, error, loginWithGoogle: handleLogin, logout };
}

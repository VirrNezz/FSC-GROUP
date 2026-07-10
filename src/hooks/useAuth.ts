import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      const email = currentUser?.email;
      setIsAdmin(email === 'ochalopha@gmail.com' || email === 'furrsocietyclan@gmail.com');
      setLoading(false);
    }, (err) => {
      if (!isMounted) return;
      console.error("Auth state observer error:", err);
      setError(err.message || "An error occurred during authentication.");
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Popup login error:", err);
      setError(err?.message || "Failed to complete popup authentication.");
      setLoading(false);
    }
  };

  return { user, isAdmin, loading, error, loginWithGoogle: handleLogin, logout };
}

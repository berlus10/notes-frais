'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type HeaderUser = {
  email: string;
  role: 'user' | 'admin';
  nom?: string;
  prenom?: string;
};

export default function ClientHeader() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success) {
          setUser(json.data);
          localStorage.setItem('user', JSON.stringify(json.data));
        }
      })
      .catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  if (!mounted) {
    return <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-black" />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-white text-lg md:text-xl font-black flex items-center gap-2 hover:text-gray-200">
            FFS
            <span className="text-gray-400 text-sm font-semibold">Notes de frais spéléologie</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-white hover:underline font-medium">Dashboard</Link>
            <Link href="/nouvelle-ndf" className="text-white hover:underline font-medium">Nouvelle NDF</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-white hover:underline font-medium">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="h-10 w-10 rounded-full bg-white text-black font-black"
                  aria-label="Menu utilisateur"
                >
                  {(user.prenom?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-black truncate">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-black hover:bg-gray-100">Dashboard</Link>
                    {user.role === 'admin' && <Link href="/admin" className="block px-4 py-2 text-black hover:bg-gray-100">Admin</Link>}
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-black hover:bg-gray-100">Déconnexion</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white hover:text-black font-medium">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

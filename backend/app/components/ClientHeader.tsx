'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientHeader() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-cave-card-alt border-b-cave-border shadow-glow-card h-16" />
    );
  }

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#111111] border-b-[#2a2a2a] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-white text-2xl font-black flex items-center gap-2 hover:text-[#fb923c] transition-colors">
            BANG
            <span className="text-gray-400 text-sm font-light">Notes de frais</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-white hover:text-[#fb923c] hover:underline font-medium transition-all">Dashboard</Link>
            <Link href="/nouvelle-ndf" className="text-white hover:text-[#fb923c] hover:underline font-medium transition-all">Nouvelle NDF</Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-white hover:text-[#fb923c] hover:underline font-medium transition-all">Admin</Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white hover:text-[#fb923c] hover:ring-2 ring-[#d97706] hover:shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all"
                >
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border-[#2a2a2a] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] py-2">
                    <Link href="/dashboard" className="block px-4 py-2 text-white hover:bg-[#1a1a1a] hover:text-[#fb923c]">Dashboard</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="block px-4 py-2 text-white hover:bg-[#1a1a1a] hover:text-[#fb923c]">Admin</Link>
                    )}
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-white hover:bg-[#1a1a1a] hover:text-[#fb923c]">Déconnexion</button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="text-white hover:text-[#111111] px-4 py-2 rounded-lg hover:bg-[#d97706] hover:text-[#111111] transition-all font-medium"
              >
                Connexion
              </Link>
            )}
          </div>

          <button className="md:hidden p-1">
            <span className="text-white">☰</span>
          </button>
        </div>
      </div>
    </header>
  );
}

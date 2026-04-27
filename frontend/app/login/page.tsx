'use client';

import React from 'react';

export default function Login() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Connexion</h1>
          <p className="text-gray-600 mt-2">Accédez à votre compte.</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="votre@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input type="password" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="********" />
          </div>
          <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-lg hover:opacity-90 transition">
            Se connecter
          </button>
        </form>
        <p className="text-center text-sm text-gray-500">
          Pas de compte ? <a href="/" className="text-black underline">Créer une note de frais</a>
        </p>
      </div>
    </main>
  );
}

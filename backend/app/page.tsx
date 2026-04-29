'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 space-y-12 bg-cave-bg">
      <div className="max-w-2xl w-full text-center">
          <h1 className="text-5xl md:text-6xl font-black text-cave-text-100 mb-6 leading-tight">
            BANG
            <span className="block text-3xl md:text-4xl font-light text-cave-text-400 mt-2">Exploration des notes de frais</span>
          </h1>

        <p className="text-xl text-cave-text-400 mb-12 max-w-md mx-auto leading-relaxed">
          Naviguez en profondeur pour gérer vos dépenses.calculs précis, suivi temps réel.
        </p>
        <div className="space-y-4 max-w-md mx-auto">
          <Link
            href="/nouvelle-ndf"
            className="block w-full bg-green-500 hover:bg-green-600 text-white py-6 px-8 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center"
          >
             Créer ma note de frais
          </Link>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              href="/login" 
              className="flex-1 px-6 py-3 border border-cave-border text-cave-text-100 bg-cave-card rounded-xl font-semibold hover:bg-accent hover:shadow-glow-accent hover:text-cave-card transition-all text-center"
            >
              Connexion
            </Link>
            <Link 
              href="/dashboard" 
              className="flex-1 px-6 py-3 border border-cave-border text-cave-text-400 bg-transparent rounded-xl font-semibold hover:bg-cave-card hover:text-cave-text-100 hover:shadow-glow-card transition-all text-center"
            >
              Mes notes
            </Link>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full px-4">
        <div className="cave-card p-8 rounded-2xl shadow-glow-card text-center hover:shadow-glow-accent hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
            <span className="text-xl font-bold text-cave-card-alt">1</span>
          </div>
          <h3 className="text-xl font-bold text-cave-text-100 mb-2">Mission</h3>
          <p className="text-cave-text-400">Renseignez coordonnées et détails de mission</p>
        </div>
        <div className="cave-card p-8 rounded-2xl shadow-glow-card text-center hover:shadow-glow-accent hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
            <span className="text-xl font-bold text-cave-card-alt">2</span>
          </div>
          <h3 className="text-xl font-bold text-cave-text-100 mb-2">Dépenses</h3>
          <p className="text-cave-text-400">Calculs automatiques (km, repas, hôtel)</p>
        </div>
        <div className="cave-card p-8 rounded-2xl shadow-glow-card text-center hover:shadow-glow-accent hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-accent">
            <span className="text-xl font-bold text-cave-card-alt">3</span>
          </div>
          <h3 className="text-xl font-bold text-cave-text-100 mb-2">Justificatifs</h3>
          <p className="text-cave-text-400">Upload et capture photo instantanée</p>
        </div>
        <div className="md:col-span-3 cave-card p-8 rounded-2xl shadow-glow-card text-center hover:shadow-glow-accent hover:scale-105 transition-all duration-300">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-xl font-bold text-white">✓</span>
          </div>
          <h3 className="text-xl font-bold text-cave-text-100 mb-2">Soumission</h3>
          <p className="text-cave-text-400">Référence immédiate + suivi dashboard immersif</p>
        </div>
      </div>
    </main>
  );
}


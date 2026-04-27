'use client';

import React from 'react';

export default function NouvelleNDF() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Nouvelle note de frais</h1>
          <p className="text-gray-600">Remplissez les détails de votre dépense.</p>
        </div>
        <form className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (€)</label>
            <input type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Détails de la dépense..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Justificatif (PDF/image)</label>
            <input type="file" accept="image/*,.pdf" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button type="submit" className="w-full bg-black text-white py-3 px-6 rounded-lg hover:opacity-90 transition font-medium">
            Soumettre la note de frais
          </button>
        </form>
        <p className="text-center mt-8 text-sm text-gray-500">
          <a href="/" className="underline">Retour à l'accueil</a>
        </p>
      </div>
    </main>
  );
}

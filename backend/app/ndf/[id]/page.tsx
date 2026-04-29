'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type ExpenseData = {
  nom?: string;
  prenom?: string;
  objet?: string;
  dateDebut?: string;
  dateFin?: string;
  villeDebut?: string;
  villeFin?: string;
  kmVoiture?: number;
  kmMoto?: number;
  kmCovoiturage?: number;
  hotel?: number;
  repas?: number;
  autres?: number;
  // ... autres
};

interface Expense {
  id: number;
  ref: string;
  total: number;
  status: string;
  createdAt: string;
  files: string[];
  data?: ExpenseData;
  // Flat fields possible direct
  nom?: string;
  prenom?: string;
  objet?: string;
  dateDebut?: string;
  dateFin?: string;
  villeDebut?: string;
  villeFin?: string;
}

export default function NDFDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = searchParams.get('userId') || localStorage.getItem('userId') || 'anonymous';

  useEffect(() => {
    fetch(`/api/expenses/${id}?userId=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error('NDF non trouvée');
        return res.json();
      })
      .then((data: Expense) => {
        // Normalize flat → nested si besoin
        if (data && !data.data && (data.nom || data.objet)) {
          data.data = data as any;
        }
        setExpense(data);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setExpense(null);
      })
      .finally(() => setLoading(false));
  }, [id, userId]);

  const getData = (exp: Expense | null): ExpenseData => {
    return exp?.data || (exp as any) || {};
  };

  const getName = (exp: Expense | null): string => {
    const data = getData(exp);
    return `${data.prenom || ''} ${data.nom || ''}`.trim() || '--';
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return dateStr;
    }
  };

  const getExpenseBreakdown = () => {
    const data = getData(expense);
    const breakdown: {label: string, amount: number}[] = [];
    if (data.kmVoiture) breakdown.push({ label: 'Voiture', amount: data.kmVoiture * 0.36 });
    if (data.kmMoto) breakdown.push({ label: 'Moto', amount: data.kmMoto * 0.14 });
    if (data.kmCovoiturage) breakdown.push({ label: 'Covoiturage', amount: data.kmCovoiturage * 0.40 });
    if (data.hotel) breakdown.push({ label: 'Hôtel', amount: data.hotel });
    if (data.repas) breakdown.push({ label: 'Repas', amount: data.repas });
    if (data.autres) breakdown.push({ label: 'Autres', amount: data.autres });
    return breakdown.length ? breakdown : [{ label: 'Total', amount: expense?.total || 0 }];
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-xl text-black">Chargement détail NDF...</p>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-lg border max-w-md text-center">
          <h2 className="text-2xl font-bold text-black mb-4">NDF #{id} non trouvée</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/dashboard" className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 inline-block">
            ← Retour dashboard
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = getExpenseBreakdown();

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4 font-bold text-lg">
              ← Retour dashboard
            </Link>
            <h1 className="text-3xl font-bold text-black">NDF #{expense.ref}</h1>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-black mb-4">€{expense.total.toFixed(2)}</p>
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${
              expense.status?.toLowerCase() === 'pending' ? 'bg-gray-200 text-black' :
              expense.status?.toLowerCase() === 'approved' ? 'bg-green-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {expense.status?.toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold text-black mb-6">Infos utilisateur</h2>
            <div className="space-y-4 text-lg">
              <p><span className="font-bold text-orange-500">Nom:</span> {getName(expense)}</p>
              <p><span className="font-bold text-orange-500">Mission:</span> {getData(expense)?.objet || '--'}</p>
              <p><span className="font-bold text-orange-500">Dates:</span> {formatDate(getData(expense)?.dateDebut)} → {formatDate(getData(expense)?.dateFin)}</p>
              {getData(expense)?.villeDebut && getData(expense)?.villeFin && (
                <p><span className="font-bold text-orange-500">Villes:</span> {getData(expense)?.villeDebut} → {getData(expense)?.villeFin}</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold text-black mb-6">Dépenses</h2>
            <div className="space-y-3">
              {breakdown.map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-800 font-medium">{item.label}</span>
                  <span className="font-bold text-black">€{item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-2xl font-bold text-black">
                  <span>Total</span>
                  <span>€{expense.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-black mb-8">Justificatifs ({expense.files.length})</h2>
          {expense.files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Aucun justificatif uploadé</p>
              <p className="text-gray-500 text-sm">Ajoutez des photos/reçus lors création NDF</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {expense.files.map((file: string, i: number) => (
                <div key={i} className="group relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <Image 
                    src={file} 
                    alt={`Justificatif ${i+1}`}
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      (img.parentNode as HTMLElement)?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-400 hidden fallback-icon">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-3 py-1 rounded-full truncate max-w-[140px]">
                    {file.split('/').pop()?.slice(0,25) || `Fichier ${i+1}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-12">
          <p className="text-gray-600 text-sm">Soumise le {new Date(expense.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}


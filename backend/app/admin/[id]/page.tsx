'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ExpenseData {
  nom: string;
  prenom: string;
  objet: string;
  dateDebut: string;
  dateFin: string;
  villeDebut?: string;
  villeFin?: string;
}

interface Expense {
  id: number;
  ref: string;
  total: number;
  status: string;
  comment?: string;
  files: string[];
  data: ExpenseData;
}

export default function AdminDetail() {
  const params = useParams();
  const id = Number(params.id);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');

  // Protect admin detail
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user?.role || user.role !== 'admin') {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    fetch(`/api/admin/expenses`)
      .then(res => res.json())
      .then((expenses: Expense[]) => {
        const found = expenses.find(e => e.id === id);
        setExpense(found || null);
        setComment(found?.comment || '');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!expense) return;
    setUpdating(true);
    try {
      await fetch(`/api/admin/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment }),
      });
      setExpense({ ...expense, status });
    } catch (err) {
      console.error('Erreur update:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getExpenseBreakdown = (data: any) => {
    const breakdown = [];
    if (data?.kmVoiture) breakdown.push({ label: 'Voiture', amount: data.kmVoiture * 0.36 });
    if (data?.kmMoto) breakdown.push({ label: 'Moto', amount: data.kmMoto * 0.14 });
    if (data?.kmCovoiturage) breakdown.push({ label: 'Covoiturage', amount: data.kmCovoiturage * 0.40 });
    if (data?.hotel) breakdown.push({ label: 'Hôtel', amount: data.hotel });
    if (data?.repas) breakdown.push({ label: 'Repas', amount: data.repas });
    if (data?.autres) breakdown.push({ label: 'Autres', amount: data.autres });
    return breakdown.length ? breakdown : [{ label: 'Total', amount: expense?.total || 0 }];
  };

  const SkeletonSection = ({ title }: { title: string }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-full"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          <SkeletonSection title="Header" />
          <div className="grid md:grid-cols-2 gap-8">
            <SkeletonSection title="Détails" />
            <SkeletonSection title="Justificatifs" />
          </div>
          <SkeletonSection title="Actions" />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen py-8 px-4 bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-12 rounded-2xl shadow-lg text-center max-w-md border">
          <h2 className="text-2xl font-bold text-black mb-4">NDF #{id} non trouvée</h2>
          <Link href="/admin" className="bg-gray-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all">
            Retour admin
          </Link>
        </div>
      </div>
    );
  }

  const breakdown = getExpenseBreakdown(expense.data);

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border flex justify-between items-start">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 mb-4 font-bold">
              ← Retour liste
            </Link>
            <h1 className="text-3xl font-bold text-black">NDF #{expense.ref}</h1>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-black mb-4">€{expense.total.toFixed(2)}</p>
            <span className={`px-4 py-2 rounded-full font-bold ${
              expense.status === 'pending' ? 'bg-gray-200 text-black' :
              expense.status === 'approved' ? 'bg-green-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {expense.status}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold text-black mb-6">Mission & utilisateur</h2>
            <div className="space-y-4 text-lg">
              <p><span className="font-bold text-orange-500">Nom:</span> {expense.data.nom || '-'} {expense.data.prenom || '-'}</p>
              <p><span className="font-bold text-orange-500">Objet:</span> {expense.data.objet || '-'}</p>
              <p><span className="font-bold text-orange-500">Dates:</span> {expense.data.dateDebut || '-'} → {expense.data.dateFin || '-'}</p>
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
                  <span>€{expense.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-black mb-8">Justificatifs ({expense.files.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {expense.files.map((file, i) => (
              <div key={i} className="group relative aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <Image 
                  src={file} 
                  alt={`Justificatif ${i+1}`}
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const fallback = img.parentNode?.querySelector('.fallback-icon') as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
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
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border">
          <h2 className="text-2xl font-bold text-black mb-6">Actions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-bold text-black mb-2">Commentaire</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire ou motif de rejet..."
                className="w-full p-4 border border-gray-300 rounded-xl text-black resize-vertical min-h-[100px] focus:ring-2 focus:ring-black focus:border-black"
                rows={4}
                disabled={updating}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => updateStatus('approved')}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                disabled={updating}
              >
                Approuver
              </button>
              <button 
                onClick={() => updateStatus('rejected')}
                className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={updating}
              >
                Rejeter
              </button>
              <button className="px-6 py-4 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition-all">
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">Créée le {new Date(expense.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}


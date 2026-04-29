'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Expense {
  id: number;
  ref: string;
  objet: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || localStorage.getItem('userId') || 'anonymous';

  useEffect(() => {
    fetch(`/api/expenses?userId=${userId}`)
      .then(res => res.json())
      .then(setExpenses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const SkeletonCard = () => (
    <div className="cave-card p-6 rounded-2xl shadow-glow-card animate-pulse">
      <div className="flex justify-between items-start">
        <div>
          <div className="h-6 bg-cave-border rounded w-32 mb-2"></div>
          <div className="h-5 bg-cave-border rounded w-48"></div>
        </div>
        <div className="text-right">
          <div className="h-8 bg-cave-border rounded w-20 mb-2 mx-auto"></div>
          <div className="h-5 bg-cave-border rounded w-16 mx-auto"></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-cave-border flex justify-between items-center">
        <div className="h-4 bg-cave-border rounded w-24"></div>
        <div className="h-4 bg-cave-border rounded w-32"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-cave-bg">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 cave-card p-8 rounded-2xl shadow-glow-card">
          <h1 className="text-4xl font-black text-cave-text-100">Mes notes de frais</h1>

          <Link 
            href="/nouvelle-ndf"
            className="bg-accent text-cave-card px-8 py-4 rounded-xl font-bold shadow-glow-accent hover:shadow-glow-pulse hover:bg-accent-glow transition-all duration-300"
          >
            + Nouvelle NDF
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-20 cave-card rounded-2xl shadow-glow-card">
            <p className="text-2xl text-cave-text-400 mb-8">Aucune note de frais trouvée</p>
            <Link 
              href="/nouvelle-ndf"
              className="bg-accent text-cave-card px-8 py-4 rounded-xl font-bold shadow-glow-accent hover:shadow-glow-pulse hover:bg-accent-glow transition-all inline-block"
            >
               Créer ma première NDF
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map(expense => (
              <Link 
                key={expense.id} 
                href={`/ndf/${expense.id}`}
                className="block hover:scale-[1.02] transition-all duration-300"
              >
                <div className="cave-card p-8 rounded-2xl shadow-glow-card hover:shadow-glow-accent cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-cave-text-100 group-hover:text-accent mb-2">{expense.ref}</h3>
                      <p className="text-lg text-cave-text-400">{expense.objet || 'Note de frais'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-cave-text-100 mb-3">€{expense.total.toFixed(2)}</p>
                      <span className={`status-${expense.status.toLowerCase()} transition-all`}>
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-cave-border flex justify-between items-center text-sm text-cave-text-400">
                    <span>{new Date(expense.createdAt).toLocaleDateString('fr-FR')}</span>
                    <span>En attente validation</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-cave-border text-right">
                    <span className="text-accent font-bold hover:underline transition-all">Voir détail →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


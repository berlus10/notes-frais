'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Expense {
  id: number;
  ref: string;
  nom: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Protect admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user?.role || user.role !== 'admin') {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/expenses')
      .then(res => res.json())
      .then(setExpenses)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment: `Status changé vers ${status}` }),
    });
    setExpenses(expenses.map(e => e.id === id ? { ...e, status } : e));
  };

  const filtered = expenses.filter(e => 
    (!filterStatus || e.status === filterStatus) &&
    (!filterDate || e.createdAt.startsWith(filterDate))
  );

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4"><div className="h-5 bg-cave-border rounded w-20"></div></td>
      <td className="p-4"><div className="h-4 bg-cave-border rounded w-32"></div></td>
      <td className="p-4"><div className="h-5 bg-cave-border rounded w-16"></div></td>
      <td className="p-4"><div className="h-6 bg-cave-border rounded-full w-20 mx-auto"></div></td>
      <td className="p-4"><div className="h-4 bg-cave-border rounded w-24"></div></td>
      <td className="p-4 space-x-2"><div className="h-8 bg-cave-border rounded w-16"></div></td>
    </tr>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-cave-bg">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-cave-text-100">Admin - Central de validation</h1>

          <Link href="/dashboard" className="text-accent hover:text-accent-glow font-bold">← Dashboard personnel</Link>
        </div>
        
        {/* Filters */}
        <div className="cave-card p-6 rounded-2xl shadow-glow-card mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-cave-text-400 mb-2">Filtrer par statut</label>
              <select 
                className="w-full px-4 py-3 bg-cave-card border border-cave-border rounded-xl text-cave-text-100 focus:ring-2 ring-accent focus:border-accent transition-all"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Validées</option>
                <option value="rejected">Rejetées</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-cave-text-400 mb-2">Filtrer par mois</label>
              <input 
                type="month" 
                className="w-full px-4 py-3 bg-cave-card border border-cave-border rounded-xl text-cave-text-100 focus:ring-2 ring-accent focus:border-accent transition-all"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="cave-card rounded-2xl shadow-glow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cave-card-alt">
                <tr>
                  <th className="p-6 text-left text-cave-text-100 font-black text-lg border-b border-cave-border">Réf</th>
                  <th className="p-6 text-left text-cave-text-100 font-black text-lg border-b border-cave-border">Collaborateur</th>
                  <th className="p-6 text-right text-cave-text-100 font-black text-lg border-b border-cave-border">Montant</th>
                  <th className="p-6 text-left text-cave-text-100 font-black text-lg border-b border-cave-border">Statut</th>
                  <th className="p-6 text-left text-cave-text-100 font-black text-lg border-b border-cave-border">Date</th>
                  <th className="p-6 text-left text-cave-text-100 font-black text-lg border-b border-cave-border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-cave-text-400">
                      Aucune note de frais trouvée
                    </td>
                  </tr>
                ) : (
                  filtered.map(expense => (
                    <tr key={expense.id} className="border-t border-cave-border hover:bg-cave-card hover:shadow-glow-accent transition-all duration-200">
                      <td className="p-6 font-black text-cave-text-100">{expense.ref}</td>
                      <td className="p-6 text-cave-text-400 capitalize">{expense.nom}</td>
                      <td className="p-6 font-black text-cave-text-100 text-right">€{expense.total.toFixed(2)}</td>
                      <td className="p-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                expense.status === 'pending' ? 'bg-gray-200 text-black' :
                expense.status === 'approved' ? 'bg-green-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {expense.status}
              </span>

                      </td>
                      <td className="p-6 text-cave-text-400">{new Date(expense.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="p-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Link href={`/admin/${expense.id}`} className="px-4 py-2 bg-accent text-cave-card rounded-xl font-bold hover:shadow-glow-pulse whitespace-nowrap">
                            Détail
                          </Link>
                          <button 
                            onClick={() => updateStatus(expense.id, 'approved')}
                            className="px-4 py-2 bg-status-approved text-status-approved-text rounded-xl font-bold hover:shadow-glow-pulse transition-all"
                          >
                             Valider
                          </button>
                          <button 
                            onClick={() => updateStatus(expense.id, 'rejected')}
                            className="px-4 py-2 bg-status-rejected text-status-rejected-text rounded-xl font-bold hover:shadow-glow-pulse transition-all"
                          >
                             Refuser
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


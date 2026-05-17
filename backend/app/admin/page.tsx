'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ApiUser = {
  nom: string;
  prenom: string;
  email: string;
};

type ApiExpenseReport = {
  id: string;
  commission: string;
  objet_action: string;
  montant_total: string | number;
  statut: string;
  submitted_at?: string | null;
  created_at: string;
  user?: ApiUser | null;
  expenses?: unknown[];
};

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const statusLabels: Record<string, string> = {
  submitted: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
  paid: 'Payée',
  draft: 'Brouillon',
};

export default function Admin() {
  const [reports, setReports] = useState<ApiExpenseReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCommission, setFilterCommission] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (filterStatus) params.set('statut', filterStatus);
        if (filterCommission) params.set('commission', filterCommission);

        const res = await fetch(`/api/admin/expenses${params.toString() ? `?${params}` : ''}`, {
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return;
        }

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Erreur chargement');
        }

        setReports(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur chargement');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [filterStatus, filterCommission]);

  const commissions = useMemo(() => {
    return Array.from(new Set(reports.map((report) => report.commission).filter(Boolean))).sort();
  }, [reports]);

  const updateStatus = async (id: string, action: 'approve' | 'reject' | 'paid') => {
    setError('');
    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          commentaire: action === 'reject' ? 'Refusé par le trésorier' : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Mise à jour impossible');
      }

      setReports((current) =>
        current.map((report) => (report.id === id ? { ...report, statut: json.data.statut } : report))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur mise à jour');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-black">Validation des notes de frais</h1>
            <p className="mt-2 text-gray-600">Fédération Française de Spéléologie</p>
          </div>
          <Link href="/dashboard" className="text-black hover:underline font-bold">
            Dashboard personnel
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <label>
              <span className="block text-sm font-bold text-gray-700 mb-2">Statut</span>
              <select
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="">Tous</option>
                <option value="submitted">En attente</option>
                <option value="approved">Validées</option>
                <option value="rejected">Rejetées</option>
                <option value="paid">Payées</option>
              </select>
            </label>
            <label>
              <span className="block text-sm font-bold text-gray-700 mb-2">Commission</span>
              <select
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black"
                value={filterCommission}
                onChange={(event) => setFilterCommission(event.target.value)}
              >
                <option value="">Toutes</option>
                {commissions.map((commission) => (
                  <option key={commission} value={commission}>
                    {commission}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead className="bg-gray-100 text-left text-sm font-black text-gray-700">
                <tr>
                  <th className="p-4">Référence</th>
                  <th className="p-4">Membre</th>
                  <th className="p-4">Mission</th>
                  <th className="p-4 text-right">Montant</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Soumise le</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-600">
                      Chargement...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-600">
                      Aucune note de frais trouvée
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-t border-gray-200">
                      <td className="p-4 font-mono text-sm text-black">{report.id.slice(0, 8)}</td>
                      <td className="p-4 text-black">
                        {report.user ? `${report.user.prenom} ${report.user.nom}` : 'Sans compte'}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-black">{report.objet_action}</div>
                        <div className="text-sm text-gray-500">{report.commission}</div>
                      </td>
                      <td className="p-4 text-right font-black text-black">{euro.format(Number(report.montant_total))}</td>
                      <td className="p-4">
                        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-black">
                          {statusLabels[report.statut] || report.statut}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        {new Date(report.submitted_at || report.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/${report.id}`} className="px-3 py-2 rounded-lg border border-gray-300 text-black font-bold hover:bg-gray-100">
                            Détail
                          </Link>
                          <button onClick={() => updateStatus(report.id, 'approve')} className="px-3 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700">
                            Valider
                          </button>
                          <button onClick={() => updateStatus(report.id, 'reject')} className="px-3 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700">
                            Refuser
                          </button>
                          <button onClick={() => updateStatus(report.id, 'paid')} className="px-3 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-900">
                            Payée
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

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Report = {
  id: string;
  commission: string;
  objet_action: string;
  date_action: string;
  ville_depart: string;
  ville_arrivee: string;
  montant_total: string | number;
  statut: string;
  commentaire?: string | null;
  submitted_at?: string | null;
  created_at: string;
  expenses: {
    id: string;
    categorie: string;
    description: string;
    montant: string | number;
    montant_retenu: string | number;
    justificatif_url?: string | null;
    date_depense: string;
  }[];
};

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

const statusLabels: Record<string, string> = {
  submitted: 'En attente',
  approved: 'Validée',
  rejected: 'Rejetée',
  paid: 'Payée',
  draft: 'Brouillon',
};

export default function NDFDetail() {
  const params = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/expenses/${params.id}`, { credentials: 'include' });
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'NDF introuvable');
        setReport(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-gray-50 text-black">Chargement...</div>;
  }

  if (!report) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-black text-black mb-4">Note introuvable</h1>
          {error && <p className="mb-4 text-red-600">{error}</p>}
          <Link href="/dashboard" className="font-bold text-black hover:underline">Retour dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/dashboard" className="font-bold text-black hover:underline">Retour dashboard</Link>
            <h1 className="mt-3 text-3xl font-black text-black">{report.objet_action}</h1>
            <p className="mt-2 text-gray-600">Référence {report.id}</p>
          </div>
          <div className="md:text-right">
            <p className="text-3xl font-black text-black">{euro.format(Number(report.montant_total))}</p>
            <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 font-bold text-black">
              {statusLabels[report.statut] || report.statut}
            </p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-black mb-4">Mission</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-800">
            <Info label="Commission" value={report.commission} />
            <Info label="Date" value={new Date(report.date_action).toLocaleDateString('fr-FR')} />
            <Info label="Trajet" value={`${report.ville_depart} → ${report.ville_arrivee}`} />
            <Info label="Soumise le" value={new Date(report.submitted_at || report.created_at).toLocaleDateString('fr-FR')} />
          </div>
          {report.commentaire && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <span className="font-bold">Commentaire : </span>
              {report.commentaire}
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-black mb-4">Dépenses</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-100 text-left text-sm font-bold text-gray-700">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Montant</th>
                  <th className="p-3 text-right">Retenu</th>
                  <th className="p-3">Justificatif</th>
                </tr>
              </thead>
              <tbody>
                {report.expenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-gray-200">
                    <td className="p-3">{new Date(expense.date_depense).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3 capitalize">{expense.categorie}</td>
                    <td className="p-3">{expense.description}</td>
                    <td className="p-3 text-right">{euro.format(Number(expense.montant))}</td>
                    <td className="p-3 text-right font-bold">{euro.format(Number(expense.montant_retenu))}</td>
                    <td className="p-3">
                      {expense.justificatif_url ? <a href={expense.justificatif_url} target="_blank" className="font-bold text-black hover:underline">Ouvrir</a> : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-bold text-black">{label} : </span>
      {value}
    </p>
  );
}

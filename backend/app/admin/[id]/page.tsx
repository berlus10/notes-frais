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
  compte_analytique?: string | null;
  ligne_objectif?: string | null;
  piece_comptable?: string | null;
  submitted_at?: string | null;
  created_at: string;
  user?: { nom: string; prenom: string; email: string } | null;
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

export default function AdminDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [compteAnalytique, setCompteAnalytique] = useState('');
  const [ligneObjectif, setLigneObjectif] = useState('');
  const [pieceComptable, setPieceComptable] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/expenses', { credentials: 'include' });
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/login';
          return;
        }
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Erreur chargement');

        const found = (json.data ?? []).find((item: Report) => item.id === id) ?? null;
        setReport(found);
        setCommentaire(found?.commentaire ?? '');
        setCompteAnalytique(found?.compte_analytique ?? '');
        setLigneObjectif(found?.ligne_objectif ?? '');
        setPieceComptable(found?.piece_comptable ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateStatus = async (action: 'approve' | 'reject' | 'paid') => {
    if (!report) return;
    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/expenses/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          commentaire,
          compte_analytique: compteAnalytique,
          ligne_objectif: ligneObjectif,
          piece_comptable: pieceComptable,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Mise à jour impossible');
      setReport({ ...report, statut: json.data.statut, commentaire, compte_analytique: compteAnalytique, ligne_objectif: ligneObjectif, piece_comptable: pieceComptable });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const generatePdf = async () => {
    if (!report) return;
    setUpdating(true);
    setError('');
    try {
      const res = await fetch(`/api/pdf/${report.id}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'PDF impossible');
      window.open(json.data.pdf_url, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur PDF');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-gray-50 text-black">Chargement...</div>;
  }

  if (!report) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-black text-black mb-4">Note introuvable</h1>
          {error && <p className="mb-4 text-red-600">{error}</p>}
          <Link href="/admin" className="font-bold text-black hover:underline">Retour admin</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin" className="font-bold text-black hover:underline">Retour admin</Link>
            <h1 className="mt-3 text-3xl font-black text-black">{report.objet_action}</h1>
            <p className="mt-2 text-gray-600">Référence {report.id}</p>
          </div>
          <div className="md:text-right">
            <p className="text-3xl font-black text-black">{euro.format(Number(report.montant_total))}</p>
            <p className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 font-bold text-black">{report.statut}</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">{error}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-black text-black mb-4">Mission</h2>
            <Info label="Commission" value={report.commission} />
            <Info label="Date" value={new Date(report.date_action).toLocaleDateString('fr-FR')} />
            <Info label="Trajet" value={`${report.ville_depart} → ${report.ville_arrivee}`} />
            <Info label="Membre" value={report.user ? `${report.user.prenom} ${report.user.nom} (${report.user.email})` : 'Sans compte'} />
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-black text-black mb-4">Comptabilité</h2>
            <Input label="Compte analytique" value={compteAnalytique} onChange={setCompteAnalytique} />
            <Input label="Ligne objectif" value={ligneObjectif} onChange={setLigneObjectif} />
            <Input label="Pièce comptable" value={pieceComptable} onChange={setPieceComptable} />
          </section>
        </div>

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

        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-black text-black mb-4">Décision</h2>
          <label className="block">
            <span className="block text-sm font-bold text-black mb-2">Commentaire</span>
            <textarea value={commentaire} onChange={(event) => setCommentaire(event.target.value)} rows={4} className="w-full rounded-xl border border-gray-300 p-3 text-black" />
          </label>
          <div className="mt-5 flex flex-wrap gap-3">
            <button disabled={updating} onClick={() => updateStatus('approve')} className="px-5 py-3 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50">Valider</button>
            <button disabled={updating} onClick={() => updateStatus('reject')} className="px-5 py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">Rejeter</button>
            <button disabled={updating} onClick={() => updateStatus('paid')} className="px-5 py-3 rounded-xl bg-black text-white font-bold disabled:opacity-50">Marquer payée</button>
            <button disabled={updating} onClick={generatePdf} className="px-5 py-3 rounded-xl border border-gray-300 text-black font-bold disabled:opacity-50">Générer PDF</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="mb-3 text-gray-800">
      <span className="font-bold text-black">{label} : </span>
      {value}
    </p>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-3 block">
      <span className="block text-sm font-bold text-black mb-2">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-gray-300 p-3 text-black" />
    </label>
  );
}

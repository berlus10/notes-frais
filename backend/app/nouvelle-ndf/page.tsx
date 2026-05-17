'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  commission: z.string().min(1, 'Commission requise'),
  objet_action: z.string().min(1, 'Objet requis'),
  date_action: z.string().min(1, 'Date requise'),
  ville_depart: z.string().min(1, 'Ville de départ requise'),
  ville_arrivee: z.string().min(1, "Ville d'arrivée requise"),
  kmVoiture: z.number().min(0).optional(),
  kmMoto: z.number().min(0).optional(),
  train: z.number().min(0).optional(),
  bus: z.number().min(0).optional(),
  avion: z.number().min(0).optional(),
  hotel: z.number().min(0).optional(),
  repas: z.number().min(0).optional(),
  autre: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type UploadedFile = { url: string; name: string };

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function amount(value?: number) {
  return Number.isFinite(value) ? Number(value) : 0;
}

export default function NouvelleNDF() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      commission: '',
      objet_action: '',
      date_action: '',
      ville_depart: '',
      ville_arrivee: '',
      kmVoiture: 0,
      kmMoto: 0,
      train: 0,
      bus: 0,
      avion: 0,
      hotel: 0,
      repas: 0,
      autre: 0,
    },
  });

  const watched = useWatch({ control: form.control });
  const total = useMemo(() => {
    return (
      amount(watched.kmVoiture) * 0.36 +
      amount(watched.kmMoto) * 0.14 +
      amount(watched.train) +
      amount(watched.bus) +
      amount(watched.avion) +
      Math.min(amount(watched.hotel), 100) +
      Math.min(amount(watched.repas), 25) +
      amount(watched.autre)
    );
  }, [watched]);

  const uploadFiles = async (selected: FileList | null) => {
    if (!selected?.length) return;
    setUploading(true);
    setError('');

    try {
      const uploaded: UploadedFile[] = [];
      for (const file of Array.from(selected)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error || `Upload impossible pour ${file.name}`);
        }

        uploaded.push({ url: json.data.url, name: file.name });
      }
      setFiles((current) => [...current, ...uploaded]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError('');

    const date_depense = values.date_action;
    const justificatif_url = files[0]?.url;
    const expenses = [
      amount(values.kmVoiture) > 0 && {
        categorie: 'voiture',
        description: `Trajet voiture ${values.ville_depart} - ${values.ville_arrivee}`,
        montant: amount(values.kmVoiture) * 0.36,
        km: amount(values.kmVoiture),
        justificatif_url,
        date_depense,
      },
      amount(values.kmMoto) > 0 && {
        categorie: 'moto',
        description: `Trajet moto ${values.ville_depart} - ${values.ville_arrivee}`,
        montant: amount(values.kmMoto) * 0.14,
        km: amount(values.kmMoto),
        justificatif_url,
        date_depense,
      },
      amount(values.train) > 0 && { categorie: 'train', description: 'Train', montant: amount(values.train), justificatif_url, date_depense },
      amount(values.bus) > 0 && { categorie: 'bus', description: 'Bus', montant: amount(values.bus), justificatif_url, date_depense },
      amount(values.avion) > 0 && { categorie: 'avion', description: 'Avion', montant: amount(values.avion), justificatif_url, date_depense },
      amount(values.hotel) > 0 && { categorie: 'hotel', description: 'Hébergement', montant: amount(values.hotel), justificatif_url, date_depense },
      amount(values.repas) > 0 && { categorie: 'repas', description: 'Repas', montant: amount(values.repas), justificatif_url, date_depense },
      amount(values.autre) > 0 && { categorie: 'autre', description: 'Autre dépense', montant: amount(values.autre), justificatif_url, date_depense },
    ].filter(Boolean);

    if (expenses.length === 0) {
      setError('Ajoutez au moins une dépense.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom: values.nom,
          prenom: values.prenom,
          commission: values.commission,
          objet_action: values.objet_action,
          date_action: values.date_action,
          ville_depart: values.ville_depart,
          ville_arrivee: values.ville_arrivee,
          expenses,
        }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur soumission');
      }

      router.push(`/confirmation?ref=${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur soumission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-black text-white p-8">
          <h1 className="text-3xl md:text-4xl font-black">Nouvelle note de frais</h1>
          <p className="mt-2 text-gray-200">Fédération Française de Spéléologie</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">{error}</div>}

          <section>
            <h2 className="text-xl font-black text-black mb-4">Mission</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nom" error={form.formState.errors.nom?.message}><input {...form.register('nom')} className={inputClass} /></Field>
              <Field label="Prénom" error={form.formState.errors.prenom?.message}><input {...form.register('prenom')} className={inputClass} /></Field>
              <Field label="Commission" error={form.formState.errors.commission?.message}><input {...form.register('commission')} className={inputClass} placeholder="EFS, commission canyon..." /></Field>
              <Field label="Date de l'action" error={form.formState.errors.date_action?.message}><input type="date" {...form.register('date_action')} className={inputClass} /></Field>
              <Field label="Objet / action" error={form.formState.errors.objet_action?.message}><input {...form.register('objet_action')} className={inputClass} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Départ" error={form.formState.errors.ville_depart?.message}><input {...form.register('ville_depart')} className={inputClass} /></Field>
                <Field label="Arrivée" error={form.formState.errors.ville_arrivee?.message}><input {...form.register('ville_arrivee')} className={inputClass} /></Field>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-4">Dépenses</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <NumberField label="Voiture, km" register={form.register('kmVoiture', { valueAsNumber: true })} />
              <NumberField label="Moto, km" register={form.register('kmMoto', { valueAsNumber: true })} />
              <NumberField label="Train, €" register={form.register('train', { valueAsNumber: true })} />
              <NumberField label="Bus, €" register={form.register('bus', { valueAsNumber: true })} />
              <NumberField label="Avion, €" register={form.register('avion', { valueAsNumber: true })} />
              <NumberField label="Hôtel, €" register={form.register('hotel', { valueAsNumber: true })} />
              <NumberField label="Repas, €" register={form.register('repas', { valueAsNumber: true })} />
              <NumberField label="Autre, €" register={form.register('autre', { valueAsNumber: true })} />
            </div>
            <div className="mt-5 rounded-xl bg-gray-100 p-5 flex items-center justify-between">
              <span className="font-bold text-gray-700">Total estimé retenu</span>
              <span className="text-3xl font-black text-black">{euro.format(total)}</span>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-black mb-4">Justificatifs</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              onChange={(event) => uploadFiles(event.target.files)}
              className="block w-full rounded-xl border border-dashed border-gray-400 p-4 text-black"
            />
            {uploading && <p className="mt-3 text-sm font-semibold text-gray-600">Upload en cours...</p>}
            {files.length > 0 && (
              <div className="mt-4 grid md:grid-cols-2 gap-3">
                {files.map((file, index) => (
                  <div key={`${file.url}-${index}`} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
                    <a href={file.url} target="_blank" className="truncate text-sm font-semibold text-black hover:underline">
                      {file.name}
                    </a>
                    <button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="text-red-600 font-bold">
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="border-t border-gray-200 p-6 md:p-8 flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-4 rounded-xl bg-black text-white font-black hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Soumission...' : 'Soumettre la note'}
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-black mb-2">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600 mt-1">{error}</span>}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-black/20';

function NumberField({ label, register }: { label: string; register: UseFormRegisterReturn }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-black mb-2">{label}</span>
      <input type="number" min="0" step="0.01" {...register} className={inputClass} />
    </label>
  );
}

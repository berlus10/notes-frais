'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  nom: z.string().min(1, 'Nom requis'),
  prenom: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe minimum 8 caractères'),
});

type RegisterForm = z.infer<typeof registerSchema>;

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const ref = searchParams.get('ref');

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nom: '', prenom: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (!ref) return;
    setLoading(true);
    setRegisterError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, expense_report_id: ref }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Échec création compte');
      }

      localStorage.setItem('user', JSON.stringify(json.data.user));
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!ref) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="text-center border-b border-gray-200 pb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-5 flex items-center justify-center text-3xl text-green-700">✓</div>
          <h1 className="text-3xl font-black text-black mb-3">Note de frais soumise</h1>
          <p className="text-sm font-bold text-gray-600 mb-2">Référence</p>
          <p className="font-mono text-sm font-black text-white bg-black px-4 py-3 rounded-xl break-all">{ref}</p>
          <p className="text-gray-700 mt-4">Votre demande est en attente de validation par le trésorier.</p>
        </div>

        <button onClick={() => router.push('/login')} className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold hover:bg-gray-900">
          Se connecter pour suivre mes notes
        </button>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-600 font-bold">ou</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-xl font-black text-black text-center">Créer un compte et rattacher cette note</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom" error={form.formState.errors.prenom?.message}>
              <input {...form.register('prenom')} className={inputClass} />
            </Field>
            <Field label="Nom" error={form.formState.errors.nom?.message}>
              <input {...form.register('nom')} className={inputClass} />
            </Field>
          </div>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input type="email" {...form.register('email')} className={inputClass} />
          </Field>
          <Field label="Mot de passe" error={form.formState.errors.password?.message}>
            <input type="password" {...form.register('password')} className={inputClass} />
          </Field>

          {registerError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              {registerError}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 disabled:opacity-50">
            {loading ? 'Création...' : 'Créer le compte'}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputClass = 'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-black outline-none focus:border-black focus:ring-2 focus:ring-black/20';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-black mb-2">{label}</span>
      {children}
      {error && <span className="block text-sm text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export default function Confirmation() {
  return (
    <Suspense fallback={null}>
      <ConfirmationContent />
    </Suspense>
  );
}

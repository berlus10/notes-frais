'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Identifiants incorrects');
      }

      localStorage.setItem('user', JSON.stringify(json.data.user));
      router.push(json.data.user.role === 'admin' ? '/admin' : '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-black mb-3">Connexion</h1>
          <p className="text-gray-700">Fédération Française de Spéléologie</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Email</label>
            <input
              type="email"
              {...form.register('email')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            {form.formState.errors.email && (
              <p className="text-red-600 text-sm mt-2">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Mot de passe</label>
            <input
              type="password"
              {...form.register('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-black"
            />
            {form.formState.errors.password && (
              <p className="text-red-600 text-sm mt-2">{form.formState.errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center space-y-3 pt-4 border-t border-gray-200">
          <a href="/nouvelle-ndf" className="block text-black hover:underline font-semibold">
            Déposer une note sans compte
          </a>
          <a href="/" className="text-gray-600 hover:underline font-semibold">
            Retour accueil
          </a>
        </div>
      </div>
    </main>
  );
}

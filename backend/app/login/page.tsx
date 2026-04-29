'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    // Mock admin login (keep simple)
    if (data.email === "admin@test.com" && data.password === "1234") {
      localStorage.setItem("token", "mock-admin-token");
      localStorage.setItem("user", JSON.stringify({ email: data.email, role: "admin" }));
      router.push("/admin");
      return;
    }

    // Try API auth
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email: data.email, password: data.password }),
      });

      if (res.ok) {
        const { token, user } = await res.json();
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        router.push("/nouvelle-ndf");
      } else {
        setError("Identifiants incorrects");
      }
    } catch (err) {
      setError("Erreur connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-10 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-black mb-4">Connexion BANG</h1>
          <p className="text-lg text-black">
            Admin test: <strong>admin@test.com</strong> / <strong>1234</strong>
          </p>
          <p className="text-sm text-black mt-2">Ou créez un compte lors soumission NDF</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-lg font-bold text-black mb-3">Email</label>
            <input 
              type="email"
              {...form.register("email")}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold shadow-inner focus:outline-none focus:ring-4 focus:ring-black focus:border-black placeholder-gray-400 transition-all"
              placeholder="admin@test.com"
            />
            {form.formState.errors.email && (
              <p className="text-red-600 text-sm mt-2 ml-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-lg font-bold text-black mb-3">Mot de passe</label>
            <input 
              type="password"
              {...form.register("password")}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl text-lg font-semibold shadow-inner focus:outline-none focus:ring-4 focus:ring-black focus:border-black placeholder-gray-400 transition-all"
              placeholder="1234"
            />
            {form.formState.errors.password && (
              <p className="text-red-600 text-sm mt-2 ml-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-400 text-red-800 rounded-2xl font-bold text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-gray-900 shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="text-center space-y-4 pt-6 border-t border-gray-200">
          <a href="/nouvelle-ndf" className="block text-black hover:underline font-semibold">
            Accès sans compte → Nouvelle NDF
          </a>
          <a href="/" className="text-black hover:underline font-semibold">← Accueil</a>
        </div>
      </div>
    </main>
  );
}


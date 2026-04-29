'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const registerSchema = z.object({
  nom: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe ≥6 caractères"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Confirmation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const ref = searchParams.get("ref");
  const userId = searchParams.get("userId") || "anonymous";

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nom: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setRegisterError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...data }),
      });

      if (!res.ok) {
        throw new Error("Échec création compte");
      }

      const { token, user } = await res.json();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!ref) {
    router.push("/");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 space-y-8">
        {/* Success Header */}
        <div className="text-center border-b border-gray-200 pb-8">
          <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-black mb-3">NDF soumise !</h1>
          <p className="text-xl font-bold text-black mb-1">Référence:</p>
          <p className="text-2xl font-black text-black bg-black text-white px-4 py-2 rounded-xl mx-auto max-w-xs">{ref}</p>
          <p className="text-lg text-black mt-4">Votre demande est en attente de validation trésorier.</p>
        </div>

        {/* Continue without account */}
        <button 
          onClick={() => router.push("/dashboard")}
          className="w-full bg-black text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-gray-900 shadow-xl hover:shadow-2xl transition-all"
        >
          Continuer au Dashboard
        </button>


        {/* Or register separator */}
        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-gray-300" />
          <span className="flex-shrink mx-4 text-black font-bold px-4">ou</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>

        {/* Register form */}
        <div>
          <h3 className="text-xl font-bold text-black mb-6 text-center">Créez un compte pour suivre vos NDF</h3>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-black mb-3">Nom complet</label>
              <input 
                {...form.register("nom")}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg font-semibold shadow-inner focus:outline-none focus:ring-4 focus:ring-black focus:border-black placeholder-gray-400"
                placeholder="Dupont Martin"
              />
              {form.formState.errors.nom && <p className="text-red-600 text-sm mt-2">{form.formState.errors.nom.message}</p>}
            </div>
            <div>
              <label className="block text-lg font-bold text-black mb-3">Email</label>
              <input 
                type="email"
                {...form.register("email")}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg font-semibold shadow-inner focus:outline-none focus:ring-4 focus:ring-black focus:border-black placeholder-gray-400"
                placeholder="martin@entreprise.com"
              />
              {form.formState.errors.email && <p className="text-red-600 text-sm mt-2">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-lg font-bold text-black mb-3">Mot de passe</label>
              <input 
                type="password"
                {...form.register("password")}
                className="w-full px-4 py-4 border border-gray-300 rounded-2xl text-lg font-semibold shadow-inner focus:outline-none focus:ring-4 focus:ring-black focus:border-black placeholder-gray-400"
                placeholder="Votre mot de passe"
              />
              {form.formState.errors.password && <p className="text-red-600 text-sm mt-2">{form.formState.errors.password.message}</p>}
            </div>
            {registerError && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded-2xl text-sm font-bold text-center">
                {registerError}
              </div>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-gray-900 shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Création..." : "Créer compte & Dashboard"}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-black hover:underline font-semibold"
          >
            ← Nouvelle NDF
          </button>
        </p>
      </div>
    </main>
  );
}


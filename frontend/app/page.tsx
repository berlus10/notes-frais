export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      
      <div className="max-w-xl w-full text-center space-y-6">

        {/* Titre */}
        <h1 className="text-3xl font-bold">
          Gestion des notes de frais
        </h1>

        {/* Description */}
        <p className="text-gray-600">
          Remplissez facilement votre note de frais en quelques étapes.
          Téléchargez vos justificatifs et suivez vos remboursements.
        </p>

        {/* Bouton principal */}
        <a
          href="/nouvelle-ndf"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Créer ma note de frais
        </a>

        {/* Lien secondaire */}
        <div>
          <a href="/login" className="text-sm text-gray-500 underline">
            J’ai déjà un compte
          </a>
        </div>

      </div>

    </main>
  );
}
'use client';

import { useEffect } from \'react\';
import { useRouter } from \'next/navigation\';

export default function NDF() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(\'token\');
    const userId = token || \'anonymous\';
    router.push(`/nouvelle-ndf`);
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="max-w-md bg-white rounded-2xl shadow-2xl border p-12 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-gray-200 border-t-black rounded-full mx-auto mb-8"></div>
        <p className="text-lg text-gray-600">Redirection vers le nouveau formulaire...</p>
      </div>
    </main>
  );
}



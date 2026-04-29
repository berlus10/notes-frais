'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const step1Schema = z.object({
  nom: z.string().min(1, "Nom requis"),
  prenom: z.string().min(1, "Prénom requis"),
  adresse: z.string().min(1, "Adresse requise"),
  telephone: z.string().regex(/^[\+]?[0-9\s\-\(\)]{10,}$/, "Téléphone valide requis"),
  objet: z.string().min(1, "Objet requis"),
  dateDebut: z.string().min(1),
  dateFin: z.string().min(1),
  villeDepart: z.string().min(1),
  villeArrivee: z.string().min(1),
});

const step2Schema = z.object({
  kmVoiture: z.number().min(0).optional(),
  kmMoto: z.number().min(0).optional(),
  kmCovoiturage: z.number().min(0).optional(),
  hotel: z.number().min(0).optional(),
  repas: z.number().min(0).max(25, "Repas max 25€/jour"),
  autres: z.number().min(0).optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = { files: string[] };

interface FormData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
}

export default function NouvelleNDF() {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [repasAlert, setRepasAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nom: "", prenom: "", adresse: "", telephone: "", objet: "",
      dateDebut: "", dateFin: "", villeDepart: "", villeArrivee: ""
    }
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { kmVoiture: 0, kmMoto: 0, kmCovoiturage: 0, hotel: 0, repas: 0, autres: 0 }
  });

  const kmVoiture = useWatch({ control: step2Form.control, name: "kmVoiture" }) || 0;
  const kmMoto = useWatch({ control: step2Form.control, name: "kmMoto" }) || 0;
  const kmCovoiturage = useWatch({ control: step2Form.control, name: "kmCovoiturage" }) || 0;
  const hotel = useWatch({ control: step2Form.control, name: "hotel" }) || 0;
  const repas = useWatch({ control: step2Form.control, name: "repas" }) || 0;
  const autres = useWatch({ control: step2Form.control, name: "autres" }) || 0;

  useEffect(() => {
    const transport = kmVoiture * 0.36 + kmMoto * 0.14 + kmCovoiturage * 0.40;
    const newTotal = transport + hotel + repas + autres;
    setTotal(newTotal);
    setRepasAlert(repas > 25);
  }, [kmVoiture, kmMoto, kmCovoiturage, hotel, repas, autres]);

  const nextStep = () => {
    if (currentStep === 1) {
      step1Form.handleSubmit((data) => setCurrentStep(2))();
    } else if (currentStep === 2) {
      step2Form.handleSubmit((data) => setCurrentStep(3))();
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const addFile = async (fileUrl: string) => {
    setFiles(prev => [...prev, fileUrl]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setTimeout(async () => {
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          const ctx = canvasRef.current.getContext("2d");
          ctx?.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvasRef.current.toDataURL("image/jpeg");
          
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({ preview: dataUrl }),
            });
            const data = await res.json();
            addFile(data.url || dataUrl);
          } catch {
            addFile(dataUrl);
          }
          
          stream.getTracks().forEach(track => track.stop());
          videoRef.current!.srcObject = null;
        }
      }, 2000);
    } catch (err) {
      setError("Accès caméra refusé");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const step1Data = step1Form.getValues();
      const step2Data = step2Form.getValues();
      const token = localStorage.getItem("token") || "anonymous";
      
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          data: { ...step1Data, ...step2Data },
          files,
          total,
          userId: token,
        }),
      });

      if (!res.ok) throw new Error("Erreur soumission");
      
      const { expense } = await res.json();
      router.push(`/confirmation?ref=${expense.ref}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const StepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={step1Form.handleSubmit(() => {})}>
            <div className="grid md:grid-cols-2 gap-6 space-y-6">
              <div>
                <label className="block text-lg font-bold text-black mb-3">Nom *</label>
                <input {...step1Form.register("nom")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                {step1Form.formState.errors.nom && <p className="text-red-600 mt-1">{step1Form.formState.errors.nom.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-3">Prénom *</label>
                <input {...step1Form.register("prenom")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                {step1Form.formState.errors.prenom && <p className="text-red-600 mt-1">{step1Form.formState.errors.prenom.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-lg font-bold text-black mb-3">Adresse *</label>
                <input {...step1Form.register("adresse")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-3">Téléphone *</label>
                <input {...step1Form.register("telephone")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-black mb-3">Date début *</label>
                  <input type="date" {...step1Form.register("dateDebut")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-bold text-black mb-3">Date fin *</label>
                  <input type="date" {...step1Form.register("dateFin")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                </div>
              </div>
              <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-bold text-black mb-3">Ville départ *</label>
                  <input {...step1Form.register("villeDepart")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                </div>
                <div>
                  <label className="block text-lg font-bold text-black mb-3">Ville arrivée *</label>
                  <input {...step1Form.register("villeArrivee")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
                </div>
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-3">Objet *</label>
                <input {...step1Form.register("objet")} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <form onSubmit={step2Form.handleSubmit(() => {})}>
            <h3 className="text-xl font-bold text-black mb-6">Transport (calcul auto)</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-lg font-bold text-black mb-2">Voiture (km × 0.36€)</label>
                <input type="number" step="0.1" min="0" {...step2Form.register("kmVoiture", { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Moto (km × 0.14€)</label>
                <input type="number" step="0.1" min="0" {...step2Form.register("kmMoto", { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Covoit. (km × 0.40€)</label>
                <input type="number" step="0.1" min="0" {...step2Form.register("kmCovoiturage", { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 space-y-6">
              <div>
                <label className="block text-lg font-bold text-black mb-2">Hôtel</label>
                <input type="number" step="0.01" min="0" {...step2Form.register("hotel", { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
              <div className={repasAlert ? "relative" : ""}>
                <label className="block text-lg font-bold text-black mb-2">Repas {repasAlert && "(>25€ !)"}</label>
                <input type="number" step="0.01" min="0" {...step2Form.register("repas", { valueAsNumber: true })} className={`w-full p-4 border rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black outline-none text-xl shadow-inner ${repasAlert ? "border-red-500 ring-2 ring-red-300 focus:border-red-500" : "border-gray-300 focus:border-black"}`} />
                {step2Form.formState.errors.repas && <p className="text-red-600 mt-1">{step2Form.formState.errors.repas.message}</p>}
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-2">Autres</label>
                <input type="number" step="0.01" min="0" {...step2Form.register("autres", { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-xl bg-white text-black placeholder:text-gray-500 focus:ring-2 focus:ring-black focus:border-black outline-none text-xl shadow-inner" />
              </div>
            </div>
            <div className="mt-12 p-8 bg-black text-white rounded-2xl text-center">
              <div className="text-4xl font-bold mb-2">Total: €{total.toFixed(2)}</div>
              <div className="text-lg opacity-90">Transport: €{(kmVoiture * 0.36 + kmMoto * 0.14 + kmCovoiturage * 0.40).toFixed(2)}</div>
            </div>
          </form>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-bold text-black mb-3">Justificatifs (images/PDF)</label>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" multiple onChange={async (e) => {
                for (let file of Array.from(e.target.files || [])) {
                  const formData = new FormData();
                  formData.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: formData });
                  const { url } = await res.json();
                  addFile(url);
                }
              }} className="w-full p-4 border-2 border-dashed border-black rounded-xl hover:border-gray-900 cursor-pointer bg-white text-black" />
            </div>
            <button onClick={captureCamera} className="w-full p-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 shadow-xl hover:shadow-2xl transition-all">
              📸 Capture caméra
            </button>
            <video ref={videoRef} className="hidden" autoPlay muted />
            <canvas ref={canvasRef} className="hidden" />
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={file} alt="Preview" className="w-full h-32 object-cover rounded-xl shadow-md" />
                    <button onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-all text-xs font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-lg font-bold text-black text-center">({files.length} fichier(s))</p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              <h3 className="text-2xl font-bold text-black">1. Infos mission</h3>
              <div className="grid md:grid-cols-2 gap-6 text-lg">
                <div><span className="font-semibold text-black">Nom:</span> <span className="text-gray-800">{step1Form.watch("nom") || '-'}</span> <span className="text-gray-800">{step1Form.watch("prenom") || '-'}</span></div>
                <div><span className="font-semibold text-black">Objet:</span> <span className="text-gray-800">{step1Form.watch("objet") || '-'}</span></div>
                <div className="md:col-span-2"><span className="font-semibold text-black">Trajet:</span> <span className="text-gray-800">{step1Form.watch("villeDepart") || '-'} → {step1Form.watch("villeArrivee") || '-'} ({step1Form.watch("dateDebut") || '-'} au {step1Form.watch("dateFin") || '-'})</span></div>
                <div><span className="font-semibold text-black">Contact:</span> <span className="text-gray-800">{step1Form.watch("telephone") || '-'}</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              <h3 className="text-2xl font-bold text-black">2. Dépenses</h3>
              <div className="text-black space-y-2 text-lg">
                <div>Voiture: <span className="text-gray-800">{kmVoiture || 0}km = €{(kmVoiture*0.36 || 0).toFixed(2)}</span></div>
                <div>Moto: <span className="text-gray-800">{kmMoto || 0}km = €{(kmMoto*0.14 || 0).toFixed(2)}</span></div>
                <div>Covoiturage: <span className="text-gray-800">{kmCovoiturage || 0}km = €{(kmCovoiturage*0.40 || 0).toFixed(2)}</span></div>
                <div>Hôtel: <span className="text-gray-800">€{hotel.toFixed(2)}</span></div>
                <div>Repas: <span className="text-gray-800">€{repas.toFixed(2)}</span></div>
                <div>Autres: <span className="text-gray-800">€{autres.toFixed(2)}</span></div>
                <div className="pt-4 border-t border-gray-300 mt-4">
                  <div className="text-3xl font-bold text-black flex justify-between">
                    <span>TOTAL</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border space-y-4">
              <h3 className="text-2xl font-bold text-black">3. Justificatifs</h3>
              <p className="text-xl font-bold text-black">{files.length} fichier(s)</p>
            </div>

          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl">
        <div className="bg-gradient-to-r from-black to-gray-900 p-1 mb-8">
          <div className="h-2 bg-white rounded-full transition-all duration-500" style={{ width: `${(currentStep / 4) * 100}%` }} />
        </div>

        <div className="px-8 pb-8 text-center border-b border-gray-300">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4">Étape {currentStep}/4</h1>
          <div className="text-xl text-black max-w-md mx-auto">
            {currentStep === 1 && "Renseignez vos informations"}
            {currentStep === 2 && "Saisissez vos dépenses"}
            {currentStep === 3 && "Ajoutez vos justificatifs"}
            {currentStep === 4 && "Vérifiez et soumettez"}
          </div>
        </div>

        <div className="px-8 pb-12">
          {error && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl mb-8 font-bold">{error}</div>}
          <div className="max-h-[60vh] overflow-y-auto">{StepContent()}</div>
        </div>

        <div className="px-8 py-8 bg-gray-50 border-t border-gray-300 flex justify-between">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              className="px-8 py-4 border border-black text-black rounded-xl font-bold hover:bg-black hover:text-white transition-all shadow-lg hover:shadow-xl"
            >
              ← Précédent
            </button>
          )}
          <div />
          {currentStep < 4 ? (
            <button 
              onClick={nextStep}
              className="px-12 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
              disabled={loading}
            >
              Suivant →
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading || total === 0}
              className="px-12 py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-900 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {loading ? "Soumission..." : `✅ Soumettre NDF (€{total.toFixed(2)})`}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}


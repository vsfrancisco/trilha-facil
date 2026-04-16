"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    age: "",
    education: "",
    current_field: "",
    target_salary: "",
    interests: ""
  });
  
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          target_salary: Number(formData.target_salary),
          interests: formData.interests.split(",").map(i => i.trim())
        }),
      });

      if (!res.ok) throw new Error("Falha ao comunicar com a API");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Erro:", err);
      setError("Erro ao conectar com o backend. O Uvicorn está rodando?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TrilhaFácil 🚀</h1>
        <p className="text-gray-600 mb-8">Descubra sua próxima carreira no mercado digital.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área atual de trabalho</label>
              <input type="text" required placeholder="Ex: Administrativo, Vendas, Finanças..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                onChange={e => setFormData({...formData, current_field: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pretensão Salarial Inicial (R$)</label>
              <input type="number" required placeholder="Ex: 3500"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                onChange={e => setFormData({...formData, target_salary: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interesses (separados por vírgula)</label>
              <input type="text" required placeholder="Ex: planilhas, pessoas, redes sociais..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                onChange={e => setFormData({...formData, interests: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                 <input type="number" required placeholder="Ex: 26"
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                    onChange={e => setFormData({...formData, age: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Escolaridade</label>
                 <select required className="w-full rounded-lg border border-gray-300 p-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={e => setFormData({...formData, education: e.target.value})}>
                    <option value="" className="text-gray-400">Selecione...</option>
                    <option value="Médio">Ensino Médio</option>
                    <option value="Superior">Ensino Superior</option>
                 </select>
               </div>
            </div>

            <button type="submit" disabled={loading} 
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold shadow-sm disabled:opacity-70 transition-all">
              {loading ? "Analisando perfil..." : "Descobrir minha trilha"}
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-xl text-center animate-in fade-in duration-500">
            {/* Header de Resultado */}
            <div className="bg-blue-50 rounded-t-xl p-6 border border-blue-100 border-b-0">
              <h2 className="text-sm uppercase tracking-wider font-bold text-blue-800 mb-1">Trilha Recomendada</h2>
              <p className="text-2xl font-extrabold text-blue-600 mb-1">{result.recommended_track}</p>
              <p className="text-gray-600 font-medium text-sm">Match de {result.match_score}% com seu perfil 🎯</p>
            </div>
            
            {/* Corpo com Justificativa, Vagas e Plano */}
            <div className="p-6 border border-gray-200 rounded-b-xl border-t-0 space-y-6 text-left">
              
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Por que essa trilha?</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.reason}</p>
              </div>
              
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vagas Frequentes (Para você pesquisar):</p>
                 <div className="flex flex-wrap gap-2">
                    {result.example_roles?.map((role: string, idx: number) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200">
                        {role}
                      </span>
                    ))}
                 </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Seu Plano de 30 Dias</p>
                <ul className="space-y-2">
                  {result.plan_30_days?.map((step: string, idx: number) => {
                    const [week, task] = step.split(': ');
                    return (
                      <li key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded w-fit whitespace-nowrap">
                          {week}
                        </span>
                        <span className="text-sm text-gray-800 pt-0.5">{task}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button onClick={() => setResult(null)} className="block w-full text-center text-blue-600 font-semibold mt-4 hover:text-blue-800 hover:underline transition-colors pt-4 border-t border-gray-100">
                ← Fazer um novo teste
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

import { useMemo, useState } from "react";

type AssessmentResult = {
  recommended_track: string;
  match_score: number;
  reason: string;
  example_roles: string;
  plan_30_days: string;
};

export default function Home() {
  const [formData, setFormData] = useState({
    age: "",
    education: "",
    current_field: "",
    target_salary: "",
    interests: "",
  });

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = useMemo(() => {
    if (!result?.example_roles) return [];
    return result.example_roles
      .split(",")
      .map((role: string) => role.trim())
      .filter(Boolean);
  }, [result]);

  const planSteps = useMemo(() => {
    if (!result?.plan_30_days) return [];
    return result.plan_30_days
      .split(" | ")
      .map((step: string) => step.trim())
      .filter(Boolean);
  }, [result]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
          interests: formData.interests,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erro da API:", errorData);
        throw new Error(errorData.detail || "Falha ao comunicar com a API");
      }

      const data: AssessmentResult = await res.json();
      setResult(data);

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Trilha gerada com sucesso!",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Erro:", err);
      const message =
        err instanceof Error ? err.message : "Erro ao conectar com o backend.";

      setError(message);

      if ((window as any).addToast) {
        (window as any).addToast({
          message,
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-xl rounded-xl border border-gray-100 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">TrilhaFácil 🚀</h1>
        <p className="mb-8 text-gray-600">
          Descubra sua próxima carreira no mercado digital.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Área atual de trabalho
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Administrativo, Vendas, Finanças..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                value={formData.current_field}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, current_field: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Pretensão Salarial Inicial (R$)
              </label>
              <input
                type="number"
                required
                placeholder="Ex: 3500"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                value={formData.target_salary}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, target_salary: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Interesses (separados por vírgula)
              </label>
              <input
                type="text"
                required
                placeholder="Ex: planilhas, pessoas, redes sociais..."
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                value={formData.interests}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, interests: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Idade
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 26"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  value={formData.age}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Escolaridade
                </label>
                <select
                  required
                  value={formData.education}
                  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFormData({ ...formData, education: e.target.value })
                  }
                >
                  <option value="" className="text-gray-400">
                    Selecione...
                  </option>
                  <option value="Médio">Ensino Médio</option>
                  <option value="Superior">Ensino Superior</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? "Analisando perfil..." : "Descobrir minha trilha"}
            </button>
          </form>
        ) : (
          <div className="animate-in fade-in rounded-xl bg-white text-center duration-500">
            <div className="rounded-t-xl border border-b-0 border-blue-100 bg-blue-50 p-6">
              <h2 className="mb-1 text-sm font-bold uppercase tracking-wider text-blue-800">
                Trilha Recomendada
              </h2>
              <p className="mb-1 text-2xl font-extrabold text-blue-600">
                {result.recommended_track}
              </p>
              <p className="text-sm font-medium text-gray-600">
                Match de {result.match_score}% com seu perfil 🎯
              </p>
            </div>

            <div className="space-y-6 rounded-b-xl border border-t-0 border-gray-200 p-6 text-left">
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-gray-400">
                  Por que essa trilha?
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                  {result.reason}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase text-gray-400">
                  Vagas Frequentes (Para você pesquisar):
                </p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role: string, idx: number) => (
                    <span
                      key={idx}
                      className="rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold uppercase text-gray-400">
                  Seu Plano de 30 Dias
                </p>
                <ul className="space-y-2">
                  {planSteps.map((step: string, idx: number) => {
                    const [week, task] = step.split(": ");

                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <span className="w-fit whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                          {week}
                        </span>
                        <span className="pt-0.5 text-sm text-gray-800">
                          {task}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="mt-4 block w-full border-t border-gray-100 pt-4 text-center font-semibold text-blue-600 transition-colors hover:text-blue-800 hover:underline"
              >
                ← Fazer um novo teste
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TrackBarChart from "@/components/TrackBarChart";

type Assessment = {
  id: number;
  age: string;
  education: string;
  current_field: string;
  target_salary: number;
  interests: string;
  recommended_track: string;
  match_score: number;
  reason: string;
  plan_30_days: string;
  example_roles: string;
  created_at: string;
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item: number) => (
          <div key={item} className="h-28 rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>

      <div className="h-72 rounded-xl border border-gray-200 bg-white" />

      <div className="h-96 rounded-xl border border-gray-200 bg-white" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN;

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterTrack, setFilterTrack] = useState("");

  async function fetchAssessments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8000/api/assessments?limit=50", {
        headers: {
          "X-Admin-Token": adminToken || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Falha ao buscar assessments");
      }

      const data: Assessment[] = await response.json();
      setAssessments(data);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Erro ao carregar dashboard.";

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
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Falha ao realizar logout");
      }

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Logout realizado com sucesso.",
          type: "success",
        });
      }

      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Erro ao realizar logout.",
          type: "error",
        });
      }
    }
  }

  useEffect(() => {
    fetchAssessments();
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item: Assessment) =>
      item.recommended_track.toLowerCase().includes(filterTrack.toLowerCase())
    );
  }, [assessments, filterTrack]);

  const trackSummary = useMemo(() => {
    const summary: Record<string, number> = {};

    assessments.forEach((item: Assessment) => {
      summary[item.recommended_track] = (summary[item.recommended_track] || 0) + 1;
    });

    return Object.entries(summary)
      .map(([track, count]) => ({ track, count }))
      .sort((a, b) => b.count - a.count);
  }, [assessments]);

  const averageMatchScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const total = assessments.reduce((acc: number, item: Assessment) => acc + item.match_score, 0);
    return Math.round(total / assessments.length);
  }, [assessments]);

  const topTrack = trackSummary.length > 0 ? trackSummary[0].track : "-";

  return (
    <main className="min-h-screen bg-gray-50 p-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Visualize os últimos diagnósticos gerados pela aplicação.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </a>

            <button
              onClick={fetchAssessments}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Recarregar
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Sair
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Total carregado</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{assessments.length}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Após filtro</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{filteredAssessments.length}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Trilha líder</p>
                <p className="mt-2 text-lg font-bold text-gray-900">{topTrack}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Match médio</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{averageMatchScore}%</p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">Distribuição por trilha</h2>
                <p className="text-sm text-gray-500">
                  Quantidade de assessments agrupados por trilha recomendada.
                </p>
              </div>

              <TrackBarChart data={trackSummary} />
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Filtrar por trilha
                </label>
                <input
                  type="text"
                  value={filterTrack}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFilterTrack(e.target.value)
                  }
                  placeholder="Ex: Dados, Marketing, CS"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-medium text-gray-700">Resumo por trilha</p>
                <div className="space-y-2">
                  {trackSummary.length > 0 ? (
                    trackSummary.map((item: { track: string; count: number }) => (
                      <div
                        key={item.track}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">{item.track}</span>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                          {item.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Sem dados ainda.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Trilha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Match
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Área atual
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pretensão
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredAssessments.map((assessment: Assessment) => (
                      <tr
                        key={assessment.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/dashboard/${assessment.id}`)}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {assessment.id}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-900">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            {assessment.recommended_track}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-900">
                          {assessment.match_score}%
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          {assessment.current_field}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-700">
                          R$ {assessment.target_salary.toLocaleString("pt-BR")}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-500">
                          {new Date(assessment.created_at).toLocaleString("pt-BR")}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                          Ver detalhes
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAssessments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  Nenhum assessment encontrado para esse filtro.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
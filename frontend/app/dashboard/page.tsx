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
    <div className="animate-pulse space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item: number) => (
          <div key={item} className="h-24 sm:h-28 rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>

      <div className="h-64 sm:h-72 rounded-xl border border-gray-200 bg-white" />
      <div className="h-80 sm:h-96 rounded-xl border border-gray-200 bg-white" />
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function fetchAssessments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8000/api/assessments?limit=100", {
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

  function clearFilters() {
    setFilterTrack("");
    setStartDate("");
    setEndDate("");

    if ((window as any).addToast) {
      (window as any).addToast({
        message: "Filtros limpos.",
        type: "info",
      });
    }
  }

  useEffect(() => {
    fetchAssessments();
  }, []);

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item: Assessment) => {
      const matchesTrack = item.recommended_track
        .toLowerCase()
        .includes(filterTrack.toLowerCase());

      const createdAt = new Date(item.created_at);

      const matchesStart =
        !startDate || createdAt >= new Date(`${startDate}T00:00:00`);

      const matchesEnd =
        !endDate || createdAt <= new Date(`${endDate}T23:59:59`);

      return matchesTrack && matchesStart && matchesEnd;
    });
  }, [assessments, filterTrack, startDate, endDate]);

  const trackSummary = useMemo(() => {
    const summary: Record<string, number> = {};

    filteredAssessments.forEach((item: Assessment) => {
      summary[item.recommended_track] = (summary[item.recommended_track] || 0) + 1;
    });

    return Object.entries(summary)
      .map(([track, count]) => ({ track, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAssessments]);

  const averageMatchScore = useMemo(() => {
    if (filteredAssessments.length === 0) return 0;

    const total = filteredAssessments.reduce(
      (acc: number, item: Assessment) => acc + item.match_score,
      0
    );

    return Math.round(total / filteredAssessments.length);
  }, [filteredAssessments]);

  const topTrack = trackSummary.length > 0 ? trackSummary[0].track : "-";

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Visualize os últimos diagnósticos gerados pela aplicação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </a>

            <button
              onClick={fetchAssessments}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Recarregar
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Sair
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:text-base">
            {error}
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">Filtros</h2>
                <p className="text-sm text-gray-500">
                  Refine os dados por trilha e período de criação.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <div className="lg:col-span-2">
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
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setStartDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Data final
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEndDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <button
                  onClick={clearFilters}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Limpar filtros
                </button>

                <div className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-600">
                  {filteredAssessments.length} resultado(s) encontrado(s)
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-gray-500">Total carregado</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {assessments.length}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-gray-500">Após filtro</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {filteredAssessments.length}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-gray-500">Trilha líder</p>
                <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
                  {topTrack}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="text-sm text-gray-500">Match médio</p>
                <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {averageMatchScore}%
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  Distribuição por trilha
                </h2>
                <p className="text-sm text-gray-500">
                  Quantidade de assessments agrupados por trilha recomendada.
                </p>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[320px]">
                  <TrackBarChart data={trackSummary} />
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="mb-3 text-sm font-medium text-gray-700">Resumo por trilha</p>

              <div className="space-y-2">
                {trackSummary.length > 0 ? (
                  trackSummary.map((item: { track: string; count: number }) => (
                    <div
                      key={item.track}
                      className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
                    >
                      <span className="truncate text-sm text-gray-700">{item.track}</span>
                      <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {item.count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Sem dados para os filtros selecionados.</p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">Assessments</h2>
                <p className="text-sm text-gray-500">
                  Role horizontalmente no celular para ver todas as colunas.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        ID
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Trilha
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Match
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Área atual
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pretensão
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Data
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
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
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                          {assessment.id}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                            {assessment.recommended_track}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                          {assessment.match_score}%
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          {assessment.current_field}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                          R$ {assessment.target_salary.toLocaleString("pt-BR")}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                          {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-blue-600">
                          Ver detalhes
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAssessments.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500 sm:p-8">
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
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
          <div
            key={item}
            className="h-24 rounded-xl border border-gray-200 bg-white sm:h-28"
          />
        ))}
      </div>

      <div className="h-64 rounded-xl border border-gray-200 bg-white sm:h-72" />
      <div className="h-80 rounded-xl border border-gray-200 bg-white sm:h-96" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isForbidden, setIsForbidden] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [filterTrack, setFilterTrack] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function fetchAssessments() {
    try {
      setLoading(true);
      setError("");
      setIsForbidden(false);

      const response = await fetch("/api/admin/assessments?limit=100", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        window.location.assign("/login?redirect=/dashboard");
        return;
      }

      if (response.status === 403) {
        setAssessments([]);
        setIsForbidden(true);
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.detail || "Falha ao buscar assessments."
        );
      }

      setAssessments(Array.isArray(data) ? data : []);
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
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
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

      window.location.assign("/login");
    } catch (err) {
      console.error(err);

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Erro ao realizar logout.",
          type: "error",
        });
      }

      setIsLoggingOut(false);
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

  function escapeCsvValue(value: string | number) {
    const stringValue = String(value ?? "");
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  function handleExportCsv() {
    if (filteredAssessments.length === 0) {
      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Não há dados para exportar com os filtros atuais.",
          type: "info",
        });
      }
      return;
    }

    const headers = [
      "id",
      "idade",
      "escolaridade",
      "area_atual",
      "pretensao_salarial",
      "interesses",
      "trilha_recomendada",
      "match_score",
      "justificativa",
      "plano_30_dias",
      "cargos_exemplo",
      "created_at",
    ];

    const rows = filteredAssessments.map((item: Assessment) => [
      item.id,
      item.age,
      item.education,
      item.current_field,
      item.target_salary,
      item.interests,
      item.recommended_track,
      item.match_score,
      item.reason,
      item.plan_30_days,
      item.example_roles,
      new Date(item.created_at).toLocaleString("pt-BR"),
    ]);

    const csvContent = [
      headers.map((header: string) => escapeCsvValue(header)).join(","),
      ...rows.map((row: (string | number)[]) =>
        row.map((cell: string | number) => escapeCsvValue(cell)).join(",")
      ),
    ].join("\n");

    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const now = new Date();
    const fileName = `assessments-export-${now
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if ((window as any).addToast) {
      (window as any).addToast({
        message: "CSV exportado com sucesso.",
        type: "success",
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
      summary[item.recommended_track] =
        (summary[item.recommended_track] || 0) + 1;
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
  const hasFiltersApplied = Boolean(filterTrack || startDate || endDate);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <DashboardSkeleton />
        </div>
      </main>
    );
  }

  if (isForbidden) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Acesso negado</h1>
          <p className="mt-3 text-sm text-gray-600">
            Você não tem permissão para visualizar este dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => window.location.assign("/login")}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ir para o login
            </button>
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Erro ao carregar dashboard
          </h1>
          <p className="mt-3 text-sm text-gray-600">{error}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={fetchAssessments}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (assessments.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Nenhum assessment encontrado
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Ainda não existem diagnósticos registrados para exibir no dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={fetchAssessments}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Recarregar
            </button>
            <a
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Visualize os últimos diagnósticos gerados pela aplicação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
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
              onClick={handleExportCsv}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Exportar CSV
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Filtros
            </h2>
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
          <p className="mb-3 text-sm font-medium text-gray-700">
            Resumo por trilha
          </p>

          <div className="space-y-2">
            {trackSummary.length > 0 ? (
              trackSummary.map((item: { track: string; count: number }) => (
                <div
                  key={item.track}
                  className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="truncate text-sm text-gray-700">
                    {item.track}
                  </span>
                  <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                    {item.count}
                  </span>
                </div>
              ))
            ) : hasFiltersApplied ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                Nenhum assessment corresponde aos filtros selecionados. Tente
                ajustar a trilha ou o período.
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Sem dados para exibir no resumo.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Assessments
            </h2>
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
                      {new Date(assessment.created_at).toLocaleDateString(
                        "pt-BR"
                      )}
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
            <div className="p-6 text-center sm:p-8">
              <p className="text-sm text-gray-500">
                {hasFiltersApplied
                  ? "Nenhum assessment encontrado para esse filtro."
                  : "Nenhum assessment disponível para exibição."}
              </p>

              {hasFiltersApplied && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
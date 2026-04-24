"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";

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

type PaginatedResponse = {
  items: Assessment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

type SortField =
  | "created_at"
  | "match_score"
  | "target_salary"
  | "recommended_track"
  | "id";

type SortOrder = "asc" | "desc";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-4 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 rounded-xl border border-gray-200 bg-white sm:h-28"
          />
        ))}
      </div>
      <div className="h-80 rounded-xl border border-gray-200 bg-white sm:h-96" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("page_size") || "10");
  const search = searchParams.get("search") || "";
  const track = searchParams.get("track") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const sortBy = (searchParams.get("sort_by") || "created_at") as SortField;
  const sortOrder = (searchParams.get("sort_order") || "desc") as SortOrder;

  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  function buildApiUrl() {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    if (search) params.set("search", search);
    if (track) params.set("track", track);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);
    params.set("sort_by", sortBy);
    params.set("sort_order", sortOrder);

    return `${API_BASE_URL}/assessments?${params.toString()}`;
  }

  async function fetchAssessments(mode: "initial" | "refresh" = "initial") {
    try {
      if (mode === "initial") setLoading(true);
      else setIsRefreshing(true);

      setError("");

      const response = await fetch(buildApiUrl(), {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(json?.detail || json?.error || "Falha ao carregar assessments.");
      }

      const normalized: PaginatedResponse = Array.isArray(json)
        ? {
            items: json,
            total: json.length,
            page: 1,
            page_size: json.length || 10,
            total_pages: 1,
          }
        : json;

      setData(normalized);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao carregar dashboard."
      );
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      router.push("/login");
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
      setError("Erro ao realizar logout.");
    }
  }

  async function confirmBulkDelete() {
    if (selectedIds.length === 0) return;

    try {
      setIsBulkDeleting(true);

      const results = await Promise.allSettled(
        selectedIds.map((id) =>
          fetch(`${API_BASE_URL}/assessments/${id}`, {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          })
        )
      );

      const failed = results.filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.ok)
      ).length;

      if (failed > 0) {
        throw new Error("Alguns assessments não puderam ser excluídos.");
      }

      setSelectedIds([]);
      setShowBulkDeleteModal(false);
      await fetchAssessments("refresh");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao excluir assessments.");
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function clearFilters() {
    updateParams({
      search: "",
      track: "",
      start_date: "",
      end_date: "",
      page: "1",
    });
  }

  function updateSort(field: SortField) {
    const nextOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    updateParams({ sort_by: field, sort_order: nextOrder, page: "1" });
  }

  function setPage(nextPage: number) {
    updateParams({ page: String(nextPage) });
  }

  function setPageSize(nextSize: string) {
    updateParams({ page_size: nextSize, page: "1" });
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  const assessments = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 0;

  const allVisibleSelected =
    assessments.length > 0 &&
    assessments.every((item) => selectedIds.includes(item.id));

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !assessments.some((item) => item.id === id))
      );
      return;
    }

    setSelectedIds((current) => {
      const merged = new Set([...current, ...assessments.map((item) => item.id)]);
      return Array.from(merged);
    });
  }

  const trackSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    assessments.forEach((item) => {
      summary[item.recommended_track] =
        (summary[item.recommended_track] || 0) + 1;
    });
    return Object.entries(summary)
      .map(([trackName, count]) => ({ track: trackName, count }))
      .sort((a, b) => b.count - a.count);
  }, [assessments]);

  const averageMatchScore = useMemo(() => {
    if (assessments.length === 0) return 0;
    const totalScore = assessments.reduce((acc, item) => acc + item.match_score, 0);
    return Math.round(totalScore / assessments.length);
  }, [assessments]);

  const topTrack = trackSummary[0]?.track || "-";
  const hasFilters = Boolean(search || track || startDate || endDate);

  useEffect(() => {
    fetchAssessments("initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, track, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    setSelectedIds([]);
  }, [page, pageSize, search, track, startDate, endDate, sortBy, sortOrder]);

  function exportCsv() {
    if (assessments.length === 0) return;

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

    const escapeCsv = (value: string | number) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = assessments.map((item) => [
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
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assessments-page-${page}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-7xl">
          <DashboardSkeleton />
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
              Assessments com paginação, busca, filtros e ordenação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar para Home
            </button>

            <button
              onClick={() => fetchAssessments("refresh")}
              disabled={isRefreshing}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isRefreshing ? "Atualizando..." : "Recarregar"}
            </button>

            <button
              onClick={exportCsv}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Exportar CSV
            </button>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {isLoggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900 sm:text-lg">
              Filtros
            </h2>
            <p className="text-sm text-gray-500">
              Busca, trilha, período e tamanho da página.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Busca textual
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => updateParams({ search: e.target.value, page: "1" })}
                placeholder="Ex: dados, python, marketing"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Trilha
              </label>
              <input
                type="text"
                value={track}
                onChange={(e) => updateParams({ track: e.target.value, page: "1" })}
                placeholder="Ex: Dados"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tamanho da página
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Data inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateParams({ start_date: e.target.value, page: "1" })}
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
                onChange={(e) => updateParams({ end_date: e.target.value, page: "1" })}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Limpar filtros
            </button>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              {total} resultados
            </span>

            {hasFilters && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                filtros ativos
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-gray-500">Total filtrado</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-gray-500">Página atual</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {page}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-gray-500">Trilha líder</p>
            <p className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
              {topTrack}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-gray-500">Match médio da página</p>
            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              {averageMatchScore}%
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 sm:text-lg">
                  Assessments
                </h2>
                <p className="text-sm text-gray-500">
                  {assessments.length} itens nesta página de {totalPages || 1}
                </p>
              </div>

              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Excluir selecionados ({selectedIds.length})
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAllVisible}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>

                  {[
                    ["id", "ID"],
                    ["recommended_track", "Trilha"],
                    ["match_score", "Match"],
                    ["current_field", "Área atual"],
                    ["target_salary", "Pretensão"],
                    ["created_at", "Data"],
                  ].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => updateSort(field as SortField)}
                      className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                    >
                      {label}
                      {sortBy === field && (
                        <span className="ml-1">
                          {sortOrder === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </th>
                  ))}

                  <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {assessments.map((assessment) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(assessment.id)}
                        onChange={() => toggleSelected(assessment.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </td>

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

                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <button
                        onClick={() => router.push(`/dashboard/${assessment.id}`)}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assessments.length === 0 && (
            <div className="p-6 text-center sm:p-8">
              <p className="text-base font-semibold text-gray-900">
                Nenhum assessment encontrado
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Verifique os filtros aplicados ou a comunicação com a API.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>

          <div className="text-sm text-gray-600">
            Página <span className="font-semibold">{page}</span> de{" "}
            <span className="font-semibold">{totalPages || 1}</span>
          </div>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmBulkDelete}
        title="Excluir assessments selecionados"
        message={`Tem certeza que deseja excluir ${selectedIds.length} assessment${
          selectedIds.length > 1 ? "s" : ""
        }? Essa ação não pode ser desfeita.`}
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        isConfirming={isBulkDeleting}
      />
    </main>
  );
}
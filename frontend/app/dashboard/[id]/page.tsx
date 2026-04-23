"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 sm:space-y-6">
      <div className="h-8 w-40 rounded bg-gray-200" />
      <div className="grid gap-4 xl:grid-cols-4">
        <div className="h-24 rounded-xl border border-gray-200 bg-white" />
        <div className="h-24 rounded-xl border border-gray-200 bg-white" />
        <div className="h-24 rounded-xl border border-gray-200 bg-white" />
        <div className="h-24 rounded-xl border border-gray-200 bg-white" />
      </div>
      <div className="h-40 rounded-xl border border-gray-200 bg-white" />
      <div className="h-40 rounded-xl border border-gray-200 bg-white" />
      <div className="h-40 rounded-xl border border-gray-200 bg-white" />
    </div>
  );
}

export default function AssessmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const id = params?.id;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function fetchAssessment() {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/admin/assessments?limit=100`, {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        window.location.assign(`/login?redirect=/dashboard/${id}`);
        return;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || data?.detail || "Falha ao carregar assessment."
        );
      }

      const found = Array.isArray(data)
        ? data.find((item: Assessment) => String(item.id) === String(id))
        : null;

      if (!found) {
        setAssessment(null);
        setError("Assessment não encontrado.");
        return;
      }

      setAssessment(found);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "Erro ao carregar assessment.";

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

  function handleOpenDeleteModal() {
    if (isDeleting || !assessment) return;
    setIsConfirmOpen(true);
  }

  function handleCloseDeleteModal() {
    if (isDeleting) return;
    setIsConfirmOpen(false);
  }

  async function handleDelete() {
    if (!id || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/assessments/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });

      const data = await response.json().catch(() => null);

      if (response.status === 401) {
        window.location.assign(`/login?redirect=/dashboard/${id}`);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.detail || "Falha ao excluir assessment."
        );
      }

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Assessment excluído com sucesso.",
          type: "success",
        });
      }

      window.location.assign("/dashboard");
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "Erro ao excluir assessment.";

      if ((window as any).addToast) {
        (window as any).addToast({
          message,
          type: "error",
        });
      }

      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  }

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const planItems = useMemo(() => {
    if (!assessment?.plan_30_days) return [];

    return assessment.plan_30_days
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [assessment]);

  const exampleRoles = useMemo(() => {
    if (!assessment?.example_roles) return [];

    return assessment.example_roles
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [assessment]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <DetailSkeleton />
        </div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Assessment não encontrado
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {error || "Assessment não encontrado."}
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.assign("/dashboard")}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Voltar ao dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Assessment #{assessment.id}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                Assessment #{assessment.id}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Criado em{" "}
                {new Date(assessment.created_at).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => router.push("/dashboard")}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>

              <button
                onClick={handleOpenDeleteModal}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Excluindo..." : "Excluir assessment"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Trilha recomendada</p>
              <p className="mt-2 text-base font-bold text-gray-900">
                {assessment.recommended_track}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Match Score</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {assessment.match_score}%
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Pretensão Salarial</p>
              <p className="mt-2 text-base font-bold text-gray-900">
                R$ {assessment.target_salary.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Criado em</p>
              <p className="mt-2 text-base font-bold text-gray-900">
                {new Date(assessment.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Perfil informado
              </h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Idade
                  </p>
                  <p className="mt-1 text-sm text-gray-800">{assessment.age}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Escolaridade
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {assessment.education}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Área atual
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {assessment.current_field}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Interesses
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    {assessment.interests}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Diagnóstico</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Recomendação principal
                  </p>
                  <p className="mt-1 text-sm text-gray-800">
                    Trilha recomendada:{" "}
                    <strong>{assessment.recommended_track}</strong>
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Justificativa
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-800">
                    {assessment.reason}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">Plano de 30 dias</h2>

              {planItems.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {planItems.map((item, index) => (
                    <div
                      key={`${index}-${item}`}
                      className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-800"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Nenhum plano registrado.
                </p>
              )}
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Cargos de exemplo
              </h2>

              {exampleRoles.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {exampleRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  Nenhum cargo de exemplo registrado.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        title="Excluir assessment"
        message="Tem certeza que deseja excluir este assessment? Essa ação não pode ser desfeita."
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        isConfirming={isDeleting}
      />
    </>
  );
}
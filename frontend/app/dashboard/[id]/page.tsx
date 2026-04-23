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
      <div className="h-24 rounded-xl border border-gray-200 bg-white" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item: number) => (
          <div key={item} className="h-28 rounded-xl border border-gray-200 bg-white" />
        ))}
      </div>
      <div className="h-40 rounded-xl border border-gray-200 bg-white" />
      <div className="h-40 rounded-xl border border-gray-200 bg-white" />
    </div>
  );
}

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const adminToken = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`http://localhost:8000/api/assessments/${id}`, {
          headers: {
            "X-Admin-Token": adminToken || "",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || "Falha ao buscar assessment");
        }

        const data: Assessment = await response.json();
        setAssessment(data);
      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Erro ao carregar o assessment.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAssessment();
    }
  }, [id, adminToken]);

  const roleItems = useMemo(() => {
    if (!assessment?.example_roles) return [];
    return assessment.example_roles
      .split(",")
      .map((role: string) => role.trim())
      .filter(Boolean);
  }, [assessment]);

  const planItems = useMemo(() => {
    if (!assessment?.plan_30_days) return [];
    return assessment.plan_30_days
      .split(" | ")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }, [assessment]);

  function handlePrintPdf() {
    window.print();

    if ((window as any).addToast) {
      (window as any).addToast({
        message: "Janela de impressão aberta. Escolha 'Salvar como PDF'.",
        type: "info",
      });
    }
  }

  async function confirmDelete() {
    try {
      setDeleting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assessments?limit=100`, {
        method: "DELETE",
        headers: {
          "X-Admin-Token": adminToken || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Falha ao excluir assessment");
      }

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Assessment excluído com sucesso.",
          type: "success",
        });
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      if ((window as any).addToast) {
        (window as any).addToast({
          message: "Erro ao excluir assessment.",
          type: "error",
        });
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 print:bg-white print:p-0 sm:p-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
          <DetailSkeleton />
        </div>
      </main>
    );
  }

  if (error || !assessment) {
    return (
      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm sm:p-8">
          <p className="text-sm text-red-700 sm:text-base">
            {error || "Assessment não encontrado."}
          </p>
          <a
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline"
          >
            Voltar ao dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .print-title {
            font-size: 24px !important;
          }

          .print-section-title {
            font-size: 16px !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-6 sm:py-10 print:bg-white print:p-0">
        <div className="print-container mx-auto max-w-4xl space-y-4 sm:space-y-6">
          <div className="no-print flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-500">Assessment #{assessment.id}</p>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {assessment.recommended_track}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Criado em {new Date(assessment.created_at).toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Voltar
              </button>

              <button
                onClick={handlePrintPdf}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                Exportar PDF
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>

          <div className="hidden print:block rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">Assessment #{assessment.id}</p>
            <h1 className="print-title text-3xl font-bold text-gray-900">
              Relatório de Assessment
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Trilha recomendada: <strong>{assessment.recommended_track}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Gerado em {new Date(assessment.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Match Score</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {assessment.match_score}%
              </p>
            </div>

            <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="text-sm text-gray-500">Pretensão Salarial</p>
              <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                R$ {assessment.target_salary.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 sm:col-span-2 xl:col-span-1">
              <p className="text-sm text-gray-500">Escolaridade</p>
              <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                {assessment.education}
              </p>
            </div>
          </div>

          <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="print-section-title mb-4 text-base font-bold text-gray-900 sm:text-lg">
              Perfil informado
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Idade</p>
                <p className="font-medium text-gray-900">{assessment.age}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Área atual</p>
                <p className="font-medium text-gray-900">{assessment.current_field}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Interesses</p>
                <p className="break-words font-medium text-gray-900">
                  {assessment.interests}
                </p>
              </div>
            </div>
          </div>

          <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="print-section-title mb-4 text-base font-bold text-gray-900 sm:text-lg">
              Justificativa
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              {assessment.reason}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2 xl:gap-6">
            <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="print-section-title mb-4 text-base font-bold text-gray-900 sm:text-lg">
                Plano de 30 dias
              </h2>
              <ul className="space-y-3">
                {planItems.map((item: string, index: number) => (
                  <li
                    key={index}
                    className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="print-card rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="print-section-title mb-4 text-base font-bold text-gray-900 sm:text-lg">
                Vagas exemplo
              </h2>
              <div className="flex flex-wrap gap-2">
                {roleItems.map((role: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          title="Excluir assessment"
          message={`Tem certeza que deseja excluir o assessment #${assessment.id}? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
        />
      </main>
    </>
  );
}
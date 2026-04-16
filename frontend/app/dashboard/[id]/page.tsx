"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";

interface Assessment {
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
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

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
          throw new Error("Falha ao buscar assessment");
        }

        const data = await response.json();
        setAssessment(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar o assessment.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchAssessment();
    }
  }, [id]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

async function handleDelete() {
  setShowDeleteModal(true);
}

async function confirmDelete() {
  const confirmed = true; // Modal já confirmou
  if (!confirmed) return;

  try {
    setDeleting(true);
    setShowDeleteModal(false);

    const response = await fetch(`http://localhost:8000/api/assessments/${id}`, {
      method: "DELETE",
      headers: {
        "X-Admin-Token": adminToken || "",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao excluir assessment");
    }

    setToastMessage("Assessment excluído com sucesso.");
    setToastType("success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 700);
  } catch (err) {
    console.error(err);
    setToastMessage("Erro ao excluir assessment.");
    setToastType("error");
  } finally {
    setDeleting(false);
  }
}

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-gray-600">Carregando assessment...</p>
        </div>
      </main>
    );
  }

  if (error || !assessment) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-red-700">{error || "Assessment não encontrado."}</p>
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

  const planItems = assessment.plan_30_days.split(" | ");
  const roleItems = assessment.example_roles.split(",");

  return (
    <main className="min-h-screen bg-gray-50 p-6 py-10">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage("")}
        />
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Assessment #{assessment.id}</p>
            <h1 className="text-3xl font-bold text-gray-900">{assessment.recommended_track}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Criado em {new Date(assessment.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Voltar
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </button>

            {/* Modal no final do JSX */}
            <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={confirmDelete}
              message={`Tem certeza que deseja excluir o assessment #${id}? Esta ação não pode ser desfeita.`}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Match Score</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{assessment.match_score}%</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pretensão Salarial</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              R$ {assessment.target_salary.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Escolaridade</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{assessment.education}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Perfil informado</h2>

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
              <p className="font-medium text-gray-900">{assessment.interests}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Justificativa</h2>
          <p className="leading-relaxed text-gray-700">{assessment.reason}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Plano de 30 dias</h2>
            <ul className="space-y-3">
              {planItems.map((item, index) => (
                <li key={index} className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Vagas exemplo</h2>
            <div className="flex flex-wrap gap-2">
              {roleItems.map((role, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                >
                  {role.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
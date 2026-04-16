"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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
  const id = params.id;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssessment() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`http://127.0.0.1:8000/api/assessments/${id}`);

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
          <a href="/dashboard" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline">
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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Assessment #{assessment.id}</p>
            <h1 className="text-3xl font-bold text-gray-900">{assessment.recommended_track}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Criado em {new Date(assessment.created_at).toLocaleString("pt-BR")}
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Voltar
          </a>
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
                <li key={index} className="flex items-start">
                  <span className="mr-2 mt-1 text-blue-500">•</span>
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
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 px-3 py-6 sm:p-4 sm:py-10">
          <div className="mx-auto max-w-7xl">
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
          </div>
        </main>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
"use client";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  onClose,
}: ToastProps) {
  const styles = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <div
        className={`min-w-[280px] rounded-xl border px-4 py-3 shadow-lg ${styles[type]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="text-xs font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

declare global {
  interface Window {
    addToast?: (toast: { message: string; type: ToastType }) => void;
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    window.addToast = ({ message, type }) => {
      const id = Date.now() + Math.random();

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    };

    return () => {
      window.addToast = undefined;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getStyles = (type: ToastType) => {
    if (type === "success") {
      return "border-green-200 bg-green-50 text-green-800";
    }

    if (type === "error") {
      return "border-red-200 bg-red-50 text-red-800";
    }

    return "border-blue-200 bg-blue-50 text-blue-800";
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-md ${getStyles(
            toast.type
          )}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{toast.message}</p>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-xs font-bold opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
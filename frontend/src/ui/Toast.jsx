import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const value = useMemo(
    () => ({
      toast,
      show(message, type = "info") {
        setToast({ message, type, id: String(Date.now()) });
        window.clearTimeout(window.__tjm_toast_timer);
        window.__tjm_toast_timer = window.setTimeout(() => setToast(null), 2500);
      }
    }),
    [toast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2">
          <div
            className={[
              "card px-4 py-3 text-sm",
              toast.type === "error" ? "border-rose-300 dark:border-rose-800" : ""
            ].join(" ")}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


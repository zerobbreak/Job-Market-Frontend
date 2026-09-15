import * as React from "react"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { cn } from "../../lib/utils"

type ToastItem = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error"
}

type ToastContextValue = {
  toasts: ToastItem[]
  show: (t: Omit<ToastItem, "id">) => void
  remove: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const timersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  React.useEffect(() => {
    // Cleanup all timers on unmount
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout)
    }
  }, [])

  const show = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2)
    const item = { id, ...t }
    setToasts((prev) => [...prev, item])

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
      delete timersRef.current[id]
    }, 4000)
    timersRef.current[id] = timer
  }, [])

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, show, remove }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("Missing ToastProvider")
  return ctx
}

export function ToastViewport() {
  const { toasts, remove } = useToast()
  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] space-y-2 sm:left-auto sm:w-96">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.variant === "error" ? "alert" : "status"}
          className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.18)] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {t.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : t.variant === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          )}
          <div className="min-w-0 flex-1">
            {t.title && <p className="font-medium">{t.title}</p>}
            {t.description && <p className={cn("text-neutral-500", t.title && "mt-0.5")}>{t.description}</p>}
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            className="-m-1 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            onClick={() => remove(t.id)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

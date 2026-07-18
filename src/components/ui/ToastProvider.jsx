import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const TOAST_DURATION_MS = 2800

let toastSeq = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'success') => {
      toastSeq += 1
      const id = toastSeq
      setToasts((prev) => [...prev.slice(-2), { id, message, type }])
      const timer = setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
      timersRef.current.set(id, timer)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-5"
        >
          {toasts.map((toast) => (
            <button
              key={toast.id}
              type="button"
              onClick={() => dismissToast(toast.id)}
              className={`pointer-events-auto flex w-full max-w-[350px] items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ring-1 backdrop-blur ${
                toast.type === 'error'
                  ? 'bg-red-50/95 text-red-700 ring-red-200'
                  : 'bg-[#E6F4EA]/95 text-[#2F6B45] ring-[#BBDCC7]'
              }`}
            >
              {toast.type === 'error' ? (
                <XCircle size={18} className="shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="shrink-0" />
              )}
              <span className="text-left">{toast.message}</span>
            </button>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있습니다.')
  }
  return context
}

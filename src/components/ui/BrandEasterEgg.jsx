import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import {
  BRAND_EASTER_EGG,
  BRAND_EASTER_EGG_HINT,
  BRAND_NAME_KO,
} from '@/constants/brand'

const TAP_NEED = 5
const TAP_WINDOW_MS = 1600

/** 로고를 5번 연속 탭하면 log₂(sol) 이스터에그 팝업을 연다. */
function BrandEasterEgg({ children, className = '' }) {
  const tapsRef = useRef([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const handleTap = () => {
    const now = Date.now()
    tapsRef.current = [
      ...tapsRef.current.filter((t) => now - t < TAP_WINDOW_MS),
      now,
    ]
    if (tapsRef.current.length < TAP_NEED) return
    tapsRef.current = []
    setOpen(true)
  }

  return (
    <>
      <div className={className}>
        <button
          type="button"
          onClick={handleTap}
          aria-label="솔로그 로고"
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D8B5A]/40"
        >
          {children}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 px-6"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="이스터에그"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[280px] rounded-3xl bg-[#FDFBF7] p-5 text-center shadow-xl ring-1 ring-[#E8E2D9]"
          >
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-[#E6F4EA] hover:text-[#2F6B45]"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[11px] font-medium tracking-wide text-[#3D8B5A]">
              {BRAND_NAME_KO}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-wide text-stone-800">
              {BRAND_EASTER_EGG}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              {BRAND_EASTER_EGG_HINT}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 min-h-11 w-full rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white"
            >
              알겠어요
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default BrandEasterEgg

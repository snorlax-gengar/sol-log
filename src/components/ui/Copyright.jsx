import { COPYRIGHT_LINE, BRAND_EASTER_EGG } from '@/constants/brand'

function Copyright({ className = '', showEasterHint = false }) {
  return (
    <p className={`text-center text-[10px] leading-relaxed text-stone-400 ${className}`}>
      {COPYRIGHT_LINE}
      {showEasterHint && (
        <>
          <span className="mx-1.5 text-stone-300">·</span>
          <span className="font-mono text-stone-400">{BRAND_EASTER_EGG}</span>
        </>
      )}
    </p>
  )
}

export default Copyright

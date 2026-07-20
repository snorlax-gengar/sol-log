import ChipButton from '@/components/quickLog/ChipButton'
import {
  DIAPER_STATUSES,
  POOP_COLORS,
  POOP_DIAPER_STATUSES,
  POOP_TEXTURES,
} from '@/constants/careLog'

function DiaperSection({
  diaperStatus,
  diaperPoopColor,
  diaperPoopTexture,
  onStatusChange,
  onColorChange,
  onTextureChange,
}) {
  const showPoopDetails = POOP_DIAPER_STATUSES.has(diaperStatus)

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">기저귀</h2>

      <div className="flex flex-wrap gap-2">
        {DIAPER_STATUSES.map((item) => (
          <ChipButton
            key={item.value}
            selected={diaperStatus === item.value}
            onClick={() =>
              onStatusChange(diaperStatus === item.value ? 'none' : item.value)
            }
            className="gap-1.5"
          >
            {item.emoji && <span aria-hidden>{item.emoji}</span>}
            {item.label}
          </ChipButton>
        ))}
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          showPoopDetails
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
            <div>
              <p className="mb-2 text-xs font-medium text-stone-500">대변 색상</p>
              <div className="flex flex-wrap gap-2">
                {POOP_COLORS.map((item) => (
                  <ChipButton
                    key={item.value}
                    selected={diaperPoopColor === item.value}
                    onClick={() => onColorChange(item.value)}
                    className="gap-2"
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: item.swatch }}
                      aria-hidden
                    />
                    {item.label}
                  </ChipButton>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-stone-500">대변 상태</p>
              <div className="flex flex-wrap gap-2">
                {POOP_TEXTURES.map((item) => (
                  <ChipButton
                    key={item.value}
                    selected={diaperPoopTexture === item.value}
                    onClick={() => onTextureChange(item.value)}
                  >
                    {item.label}
                  </ChipButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiaperSection

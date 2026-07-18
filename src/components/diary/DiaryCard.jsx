import { Pencil, Trash2 } from 'lucide-react'
import { formatShortDate } from '@/utils/dateTime'

/** 일기 카드 (Pure Component). authorName은 자녀 열람 시에만 전달된다. */
function DiaryCard({ diary, authorName, canEdit, isBusy, onEdit, onDelete }) {
  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-stone-800">
            {formatShortDate(new Date(`${diary.diary_date}T00:00`))}
          </p>
          {authorName && (
            <p className="mt-0.5 text-xs font-medium text-[#2F6B45]">
              {authorName}의 일기
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="일기 수정"
              disabled={isBusy}
              onClick={() => onEdit(diary)}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-[#E6F4EA] hover:text-[#2F6B45] disabled:opacity-50"
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              aria-label="일기 삭제"
              disabled={isBusy}
              onClick={() => onDelete(diary)}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
        {diary.content}
      </p>

      {diary.photoUrls?.length > 0 && (
        <div
          className={`mt-3 grid gap-2 ${
            diary.photoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {diary.photoUrls.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`일기 사진 ${index + 1}`}
              loading="lazy"
              className={`w-full rounded-xl object-cover ring-1 ring-[#E8E2D9] ${
                diary.photoUrls.length === 1 ? 'max-h-80' : 'aspect-square'
              }`}
            />
          ))}
        </div>
      )}
    </article>
  )
}

export default DiaryCard

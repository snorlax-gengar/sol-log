import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { toLocalDateValue } from '@/utils/dateTime'

const MAX_PHOTOS = 5

/** 일기 수정 모달. 기존 사진 유지/삭제 + 새 사진 추가. */
function DiaryEditModal({ diary, isSaving, onClose, onSave }) {
  const [content, setContent] = useState(diary.content)
  const [diaryDate, setDiaryDate] = useState(diary.diary_date)
  // 기존 사진: { path, url } 유지 목록
  const [kept, setKept] = useState(() =>
    (diary.photo_paths || []).map((path, i) => ({
      path,
      url: diary.photoUrls?.[i],
    })),
  )
  const [newItems, setNewItems] = useState([]) // { file, previewUrl }
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  useEffect(
    () => () => newItems.forEach((item) => URL.revokeObjectURL(item.previewUrl)),
    [newItems],
  )

  const photoCount = kept.length + newItems.length

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || [])
    e.target.value = ''
    setNewItems((prev) => {
      const room = MAX_PHOTOS - kept.length - prev.length
      if (picked.length > room) {
        setError(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어요.`)
      }
      return [
        ...prev,
        ...picked.slice(0, room).map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]
    })
  }

  const removeKept = (path) =>
    setKept((prev) => prev.filter((item) => item.path !== path))

  const removeNew = (index) =>
    setNewItems((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    const result = await onSave({
      diary,
      content: content.trim(),
      diaryDate,
      keptPaths: kept.map((item) => item.path),
      newFiles: newItems.map((item) => item.file),
    })
    if (result?.error) setError(result.error)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="일기 수정"
        className="flex max-h-[92dvh] w-full max-w-[390px] flex-col rounded-t-3xl bg-[#FDFBF7] shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-[#E8E2D9] px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-800">일기 수정</h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-500 hover:bg-[#E6F4EA]"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-700">날짜</span>
            <input
              type="date"
              value={diaryDate}
              max={toLocalDateValue(new Date())}
              onChange={(e) => e.target.value && setDiaryDate(e.target.value)}
              className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2F6B45] ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
            />
          </div>

          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              setError('')
            }}
            rows={6}
            className="min-h-36 w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm leading-relaxed text-stone-700 outline-none ring-1 ring-[#E8E2D9] focus:ring-2 focus:ring-[#3D8B5A]/40"
          />

          {photoCount > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {kept.map((item) => (
                <div key={item.path} className="relative">
                  <img
                    src={item.url}
                    alt="기존 사진"
                    className="aspect-square w-full rounded-xl object-cover ring-1 ring-[#E8E2D9]"
                  />
                  <button
                    type="button"
                    aria-label="사진 제거"
                    onClick={() => removeKept(item.path)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {newItems.map((item, index) => (
                <div key={item.previewUrl} className="relative">
                  <img
                    src={item.previewUrl}
                    alt="새 사진"
                    className="aspect-square w-full rounded-xl object-cover ring-1 ring-[#3D8B5A]/40"
                  />
                  <button
                    type="button"
                    aria-label="사진 제거"
                    onClick={() => removeNew(index)}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={photoCount >= MAX_PHOTOS}
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white text-sm font-medium text-stone-600 ring-1 ring-[#E8E2D9] transition-colors hover:bg-[#E6F4EA]/60 disabled:opacity-50"
          >
            <ImagePlus size={16} />
            사진 추가 ({photoCount}/{MAX_PHOTOS})
          </button>

          <div className="sticky bottom-0 flex gap-2 bg-[#FDFBF7] pb-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 flex-1 rounded-2xl bg-white text-sm font-semibold text-stone-600 ring-1 ring-[#E8E2D9]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-12 flex-1 rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? '저장 중…' : '수정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DiaryEditModal

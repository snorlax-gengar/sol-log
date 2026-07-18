import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Send, X } from 'lucide-react'
import { toLocalDateValue } from '@/utils/dateTime'

const MAX_PHOTOS = 5

/** 일기 작성 폼 (Pure Component). 날짜를 과거로 바꿔 밀린 일기도 쓸 수 있다. */
function DiaryComposer({ isSaving, onSubmit }) {
  const [content, setContent] = useState('')
  const [diaryDate, setDiaryDate] = useState(() => toLocalDateValue(new Date()))
  const [files, setFiles] = useState([]) // { file, previewUrl }
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  // 미리보기 URL 정리
  useEffect(
    () => () => files.forEach((item) => URL.revokeObjectURL(item.previewUrl)),
    [files],
  )

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // 같은 파일 재선택 허용

    setFiles((prev) => {
      const room = MAX_PHOTOS - prev.length
      const next = picked.slice(0, room).map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      if (picked.length > room) {
        setError(`사진은 최대 ${MAX_PHOTOS}장까지 첨부할 수 있어요.`)
      }
      return [...prev, ...next]
    })
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    const result = await onSubmit({
      content: content.trim(),
      diaryDate,
      files: files.map((item) => item.file),
    })

    if (!result?.error) {
      setContent('')
      setDiaryDate(toLocalDateValue(new Date()))
      setFiles([])
      setError('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-800">일기 쓰기</h2>
        <input
          type="date"
          value={diaryDate}
          max={toLocalDateValue(new Date())}
          onChange={(e) => e.target.value && setDiaryDate(e.target.value)}
          aria-label="일기 날짜"
          className="rounded-lg bg-[#FDFBF7] px-2.5 py-1.5 text-xs font-semibold text-[#2F6B45] ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
        />
      </div>

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
          setError('')
        }}
        rows={4}
        placeholder="오늘 있었던 일, 아이에게 전하고 싶은 말을 남겨보세요. 이 일기는 나만 볼 수 있어요. (나중에 아이가 읽을 수 있어요)"
        className="min-h-28 w-full resize-none rounded-xl bg-[#FDFBF7] px-3 py-2.5 text-sm leading-relaxed text-stone-700 outline-none ring-1 ring-[#E8E2D9] placeholder:text-stone-400 focus:ring-2 focus:ring-[#3D8B5A]/40"
      />

      {files.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {files.map((item, index) => (
            <div key={item.previewUrl} className="relative">
              <img
                src={item.previewUrl}
                alt={`첨부 사진 ${index + 1}`}
                className="aspect-square w-full rounded-xl object-cover ring-1 ring-[#E8E2D9]"
              />
              <button
                type="button"
                aria-label="사진 제거"
                onClick={() => handleRemoveFile(index)}
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900/60 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
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
          disabled={files.length >= MAX_PHOTOS}
          className="flex min-h-12 items-center gap-1.5 rounded-2xl bg-[#FDFBF7] px-4 text-sm font-medium text-stone-600 ring-1 ring-[#E8E2D9] transition-colors hover:bg-[#E6F4EA]/60 disabled:opacity-50"
        >
          <ImagePlus size={16} />
          사진 ({files.length}/{MAX_PHOTOS})
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
        >
          <Send size={16} />
          {isSaving ? '남기는 중…' : '일기 남기기'}
        </button>
      </div>
    </form>
  )
}

export default DiaryComposer

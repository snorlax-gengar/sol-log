import DiaryComposer from '@/components/diary/DiaryComposer'
import DiaryCard from '@/components/diary/DiaryCard'
import { useDiaries } from '@/hooks/useDiaries'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/ToastProvider'

function Diary() {
  const { user, role } = useAuth()
  const isChild = role === 'child'
  const { diaries, authorNames, isLoading, isSaving, error, insertDiary, deleteDiary } =
    useDiaries({ userId: user?.id })
  const { showToast } = useToast()

  const handleSubmit = async (payload) => {
    const result = await insertDiary(payload)
    if (result.error) {
      showToast(`저장 실패: ${result.error}`, 'error')
    } else {
      showToast('일기가 저장되었습니다.')
    }
    return result
  }

  const handleDelete = async (diary) => {
    const confirmed = window.confirm('이 일기를 삭제할까요? 사진도 함께 삭제됩니다.')
    if (!confirmed) return

    const { error: deleteError } = await deleteDiary(diary)
    if (deleteError) {
      showToast(`삭제 실패: ${deleteError}`, 'error')
    } else {
      showToast('일기가 삭제되었습니다.')
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">일기</h1>
        <p className="mt-1 text-sm text-stone-500">
          {isChild
            ? '엄마 아빠가 남긴 육아 일기예요.'
            : '나만 볼 수 있는 육아 일기 — 나중에 아이가 읽을 수 있어요.'}
        </p>
      </div>

      {!isChild && <DiaryComposer isSaving={isSaving} onSubmit={handleSubmit} />}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          일기를 불러오는 중…
        </div>
      ) : diaries.length === 0 ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          {isChild
            ? '아직 읽을 수 있는 일기가 없어요.'
            : '아직 일기가 없어요. 오늘의 첫 일기를 남겨보세요.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {diaries.map((diary) => (
            <li key={diary.id}>
              <DiaryCard
                diary={diary}
                authorName={isChild ? authorNames[diary.author_id] : null}
                canDelete={!isChild && diary.author_id === user?.id}
                isBusy={isSaving}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Diary

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { DIARY_BUCKET as BUCKET, signPhotoPaths } from '@/lib/diaryPhotos'

function sortDiaries(rows) {
  return [...rows].sort(
    (a, b) =>
      new Date(b.diary_date) - new Date(a.diary_date) ||
      new Date(b.created_at) - new Date(a.created_at),
  )
}

/**
 * photo_paths -> 서명 URL 부여.
 * photos: [{ path, url }] (path 유지 -> 만료 시 개별 재발급 가능)
 * photoUrls: 유효한 URL 배열 (기존 소비자 호환용)
 */
async function withPhotoUrls(rows) {
  const allPaths = rows.flatMap((row) => row.photo_paths || [])
  const urlMap = await signPhotoPaths(allPaths)

  return rows.map((row) => {
    const photos = (row.photo_paths || []).map((path) => ({
      path,
      url: urlMap.get(path) || null,
    }))
    return {
      ...row,
      photos,
      photoUrls: photos.map((p) => p.url).filter(Boolean),
    }
  })
}

/**
 * 일기 CRUD. RLS가 접근 범위를 결정한다:
 * - 부모: 본인이 쓴 일기만 조회/작성/삭제 (서로의 일기는 DB 레벨에서 차단)
 * - 자녀: 모든 일기 읽기 전용
 */
export function useDiaries({ userId } = {}) {
  const [diaries, setDiaries] = useState([])
  const [authorNames, setAuthorNames] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchDiaries = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [{ data: rows, error: fetchError }, { data: profiles }] =
        await Promise.all([
          supabase
            .from('diaries')
            .select('*')
            .order('diary_date', { ascending: false })
            .order('created_at', { ascending: false }),
          supabase.from('profiles').select('id, display_name'),
        ])

      if (fetchError) throw fetchError

      setAuthorNames(
        Object.fromEntries(
          (profiles || []).map((p) => [p.id, p.display_name]),
        ),
      )
      setDiaries(await withPhotoUrls(rows || []))
      return rows || []
    } catch (err) {
      setError(err?.message || '일기를 불러오지 못했습니다.')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDiaries()
  }, [fetchDiaries])

  const insertDiary = useCallback(
    async ({ content, diaryDate, files = [] }) => {
      setIsSaving(true)
      setError(null)
      const uploadedPaths = []

      try {
        if (!userId) throw new Error('로그인이 필요합니다.')

        // 1) 사진 업로드 (본인 폴더)
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i]
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
          const path = `${userId}/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type || 'image/jpeg' })
          if (uploadError) throw uploadError
          uploadedPaths.push(path)
        }

        // 2) 일기 저장
        const { data, error: insertError } = await supabase
          .from('diaries')
          .insert({
            author_id: userId,
            content,
            ...(diaryDate ? { diary_date: diaryDate } : {}),
            photo_paths: uploadedPaths,
          })
          .select()
          .single()

        if (insertError) throw insertError

        const [withUrls] = await withPhotoUrls([data])
        setDiaries((prev) => sortDiaries([withUrls, ...prev]))
        return { data, error: null }
      } catch (err) {
        // 업로드된 사진 롤백
        if (uploadedPaths.length > 0) {
          supabase.storage.from(BUCKET).remove(uploadedPaths)
        }
        const message = err?.message || '일기 저장에 실패했습니다.'
        setError(message)
        return { data: null, error: message }
      } finally {
        setIsSaving(false)
      }
    },
    [userId],
  )

  const updateDiary = useCallback(
    async ({ diary, content, diaryDate, keptPaths = [], newFiles = [] }) => {
      setIsSaving(true)
      setError(null)
      const uploadedPaths = []

      try {
        if (!userId) throw new Error('로그인이 필요합니다.')

        // 새 사진 업로드
        for (let i = 0; i < newFiles.length; i += 1) {
          const file = newFiles[i]
          const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
          const path = `${userId}/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type || 'image/jpeg' })
          if (uploadError) throw uploadError
          uploadedPaths.push(path)
        }

        const nextPaths = [...keptPaths, ...uploadedPaths]

        const { data, error: updateError } = await supabase
          .from('diaries')
          .update({
            content,
            ...(diaryDate ? { diary_date: diaryDate } : {}),
            photo_paths: nextPaths,
          })
          .eq('id', diary.id)
          .select()
          .single()

        if (updateError) throw updateError

        // 제거된 사진은 Storage에서 삭제 (실패해도 본문 저장은 유지)
        const removed = (diary.photo_paths || []).filter(
          (path) => !keptPaths.includes(path),
        )
        if (removed.length > 0) {
          await supabase.storage.from(BUCKET).remove(removed)
        }

        const [withUrls] = await withPhotoUrls([data])
        setDiaries((prev) =>
          sortDiaries(prev.map((item) => (item.id === diary.id ? withUrls : item))),
        )
        return { data, error: null }
      } catch (err) {
        if (uploadedPaths.length > 0) {
          supabase.storage.from(BUCKET).remove(uploadedPaths)
        }
        const message = err?.message || '일기 수정에 실패했습니다.'
        setError(message)
        return { data: null, error: message }
      } finally {
        setIsSaving(false)
      }
    },
    [userId],
  )

  const deleteDiary = useCallback(async (diary) => {
    setIsSaving(true)
    setError(null)

    try {
      if (diary.photo_paths?.length > 0) {
        await supabase.storage.from(BUCKET).remove(diary.photo_paths)
      }

      const { error: deleteError } = await supabase
        .from('diaries')
        .delete()
        .eq('id', diary.id)

      if (deleteError) throw deleteError

      setDiaries((prev) => prev.filter((item) => item.id !== diary.id))
      return { error: null }
    } catch (err) {
      const message = err?.message || '일기 삭제에 실패했습니다.'
      setError(message)
      return { error: message }
    } finally {
      setIsSaving(false)
    }
  }, [])

  return {
    diaries,
    authorNames,
    isLoading,
    isSaving,
    error,
    fetchDiaries,
    insertDiary,
    updateDiary,
    deleteDiary,
  }
}

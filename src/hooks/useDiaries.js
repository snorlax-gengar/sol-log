import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const BUCKET = 'diary-photos'
const SIGNED_URL_TTL_SEC = 3600

function sortDiaries(rows) {
  return [...rows].sort(
    (a, b) =>
      new Date(b.diary_date) - new Date(a.diary_date) ||
      new Date(b.created_at) - new Date(a.created_at),
  )
}

/** photo_paths -> 1시간짜리 서명 URL 배열(photoUrls)로 변환 */
async function withPhotoUrls(rows) {
  const allPaths = rows.flatMap((row) => row.photo_paths || [])
  if (allPaths.length === 0) {
    return rows.map((row) => ({ ...row, photoUrls: [] }))
  }

  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(allPaths, SIGNED_URL_TTL_SEC)

  const urlMap = new Map()
  ;(data || []).forEach((item) => {
    if (item.signedUrl) urlMap.set(item.path, item.signedUrl)
  })

  return rows.map((row) => ({
    ...row,
    photoUrls: (row.photo_paths || [])
      .map((path) => urlMap.get(path))
      .filter(Boolean),
  }))
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
    deleteDiary,
  }
}

/**
 * 성과 API 함수
 * - Supabase RLS: 본인 성과만 접근 가능 (user_id = auth.uid())
 * - 삭제는 소프트 삭제 (deleted_at 설정). SELECT 정책이 deleted_at IS NULL 만 반환.
 */
import { supabase } from './supabase'

/** 성과 목록 조회 (활성 항목만, 최신순) */
export const getAchievements = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
}

/** 성과 수동 등록 */
export const createAchievement = async (data: Record<string, unknown>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('achievements')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()
}

/** 성과 상세 조회 */
export const getAchievement = (id: string) =>
  supabase
    .from('achievements')
    .select('*')
    .eq('id', id)
    .single()

/** 성과 수정 */
export const updateAchievement = (id: string, data: Record<string, unknown>) =>
  supabase
    .from('achievements')
    .update(data)
    .eq('id', id)
    .select()
    .single()

/** 성과 소프트 삭제 (deleted_at 설정) */
export const deleteAchievement = (id: string) =>
  supabase
    .from('achievements')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

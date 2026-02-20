/**
 * 프로필 API 함수
 * - Supabase RLS: 본인 데이터만 접근 가능 (user_id = auth.uid())
 * - profile_skills 조인으로 보유 스킬 함께 조회
 */
import { supabase } from './supabase'

/** 내 프로필 + 스킬 목록 조회 */
export const getProfile = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('profiles')
    .select(`
      *,
      profile_skills (
        id,
        level,
        skills ( id, name, category )
      )
    `)
    .eq('user_id', user.id)
    .single()
}

/** 프로필 수정 (변경된 필드만 전달) */
export const updateProfile = async (data: Record<string, unknown>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('profiles')
    .update(data)
    .eq('user_id', user.id)
    .select()
    .single()
}

/** 스킬 추가 (profile_skills INSERT) */
export const addSkill = async (skillId: string, level: number) => {
  // 참고: profile_id 조회 후 삽입
  const { data: profile, error } = await getProfile()
  if (error || !profile) throw new Error('프로필 조회 실패')

  return supabase
    .from('profile_skills')
    .insert({ profile_id: profile.id, skill_id: skillId, level })
    .select()
    .single()
}

/** 스킬 삭제 (profile_skills.id 기준 삭제) */
export const removeSkill = (profileSkillId: string) =>
  supabase
    .from('profile_skills')
    .delete()
    .eq('id', profileSkillId)

/** 스킬 마스터 목록 조회 (스킬 추가 화면에서 검색용) */
export const searchSkills = (query: string) =>
  supabase
    .from('skills')
    .select('id, name, category')
    .ilike('name', `%${query}%`)
    .limit(20)

/**
 * 프로필 상태 스토어 (Zustand)
 * - Supabase schema 필드명 기준으로 정렬 (uuid → string)
 */
import { create } from 'zustand'

/** Supabase profiles 테이블 컬럼 기준 */
interface Profile {
  id: string
  user_id: string
  display_name: string | null
  job_title: string | null
  company: string | null
  years_of_exp: number
  bio: string | null
  avatar_url: string | null
  completeness: number
  created_at: string
  updated_at: string
  // profile_skills 조인 결과 (선택적)
  profile_skills?: Array<{
    id: string
    level: number | null
    skills: { id: string; name: string; category: string | null } | null
  }>
}

interface ProfileState {
  profile: Profile | null
  setProfile: (profile: Profile) => void
  updateProfile: (partial: Partial<Profile>) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  updateProfile: (partial) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...partial } : null,
    })),

  clearProfile: () => set({ profile: null }),
}))

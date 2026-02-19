/**
 * 프로필 상태 스토어 (Zustand)
 */
import { create } from 'zustand'

interface Skill {
  id: number
  name: string
  proficiencyLevel: string
}

interface Profile {
  id: number
  userId: number
  jobTitle: string | null
  jobCategory: string | null
  yearsOfExperience: number
  companyName: string | null
  bio: string | null
  isJobSeeking: boolean
  completionScore: number
  marketValueMin: number | null
  marketValueMax: number | null
  hireProbability: number | null
  skills?: Skill[]
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

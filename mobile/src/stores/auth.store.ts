/**
 * 인증 상태 스토어 (Zustand)
 * - Supabase Auth 세션 기반으로 교체
 * - 토큰 관리는 SDK가 AsyncStorage를 통해 자동 처리 (수동 저장 불필요)
 */
import { create } from 'zustand'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { supabase } from '../api/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  isLoggedIn: boolean

  // 액션
  setSession: (session: Session | null) => void
  logout: () => Promise<void>
  restoreAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoggedIn: false,

  /** 세션 설정 (로그인 / 세션 복원 공통 사용) */
  setSession: (session) => {
    set({ session, user: session?.user ?? null, isLoggedIn: !!session })
  },

  /** 로그아웃 — Supabase 세션 파기 + 상태 초기화 */
  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, isLoggedIn: false })
  },

  /** 앱 시작 시 저장된 세션 복원 */
  restoreAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, isLoggedIn: !!session })

    // 세션 변경 이벤트 구독 (토큰 자동 갱신 시 상태 동기화)
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, newSession: Session | null) => {
      set({ session: newSession, user: newSession?.user ?? null, isLoggedIn: !!newSession })
    })
  },
}))

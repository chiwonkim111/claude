/**
 * 인증 상태 스토어 (Zustand)
 * - user, accessToken, isLoggedIn 상태 관리
 * - AsyncStorage를 통한 토큰 영속성
 */
import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface User {
  id: number
  email: string
  name: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoggedIn: boolean

  // 액션
  login: (user: User, accessToken: string) => Promise<void>
  logout: () => Promise<void>
  setToken: (token: string) => void
  restoreAuth: () => Promise<void>
}

const ACCESS_TOKEN_KEY = '@remember:accessToken'
const USER_KEY = '@remember:user'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,

  /** 로그인 — 상태 저장 + AsyncStorage 영속화 */
  login: async (user, accessToken) => {
    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ])
    set({ user, accessToken, isLoggedIn: true })
  },

  /** 로그아웃 — 상태 초기화 + AsyncStorage 삭제 */
  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
    set({ user: null, accessToken: null, isLoggedIn: false })
  },

  /** Access Token 갱신 (인터셉터에서 사용) */
  setToken: (token) => {
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, token)
    set({ accessToken: token })
  },

  /** 앱 시작 시 저장된 인증 상태 복원 */
  restoreAuth: async () => {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ])
    if (token && userJson) {
      const user = JSON.parse(userJson) as User
      set({ user, accessToken: token, isLoggedIn: true })
    }
  },
}))

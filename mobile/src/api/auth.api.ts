/**
 * 인증 API 함수
 * - Supabase Auth 사용 (이메일/비밀번호)
 * - 토큰 관리는 Supabase SDK가 AsyncStorage를 통해 자동 처리
 */
import { supabase } from './supabase'

/** 회원가입 — raw_user_meta_data.full_name 으로 이름 저장 (fn_handle_new_user 트리거가 profiles 자동 생성) */
export const register = (data: { email: string; password: string; name: string }) =>
  supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.name } },
  })

/** 로그인 */
export const login = (data: { email: string; password: string }) =>
  supabase.auth.signInWithPassword({ email: data.email, password: data.password })

/** 로그아웃 */
export const logout = () => supabase.auth.signOut()

/** 현재 세션 조회 (앱 시작 시 인증 상태 복원에 사용) */
export const getSession = () => supabase.auth.getSession()

/** 현재 로그인 유저 정보 조회 */
export const getUser = () => supabase.auth.getUser()

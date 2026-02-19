/**
 * 인증 API 함수
 */
import apiClient from './client'

/** 회원가입 */
export const register = (data: { name: string; email: string; password: string }) =>
  apiClient.post('/api/v1/auth/register', data)

/** 로그인 */
export const login = (data: { email: string; password: string }) =>
  apiClient.post('/api/v1/auth/login', data)

/** 로그아웃 */
export const logout = () =>
  apiClient.post('/api/v1/auth/logout')

/** 토큰 갱신 */
export const refresh = () =>
  apiClient.post('/api/v1/auth/refresh')

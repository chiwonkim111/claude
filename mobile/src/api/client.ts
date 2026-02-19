/**
 * Axios API 클라이언트
 * - 요청 인터셉터: Authorization Bearer 헤더 자동 주입
 * - 응답 인터셉터: 401 시 토큰 갱신 → 요청 재시도
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 토큰 갱신 중 여부 플래그 (중복 갱신 방지)
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

/** 요청 인터셉터 — Bearer 토큰 자동 주입 */
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await AsyncStorage.getItem('@remember:accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 응답 인터셉터 — 401 시 토큰 갱신 후 재시도 */
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 갱신 중이면 완료 대기 후 재시도
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await apiClient.post('/api/v1/auth/refresh')
        const newToken = (res as any).data?.accessToken
        if (newToken) {
          await AsyncStorage.setItem('@remember:accessToken', newToken)
          onTokenRefreshed(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch {
        // 갱신 실패 시 로그아웃 처리 필요
        await AsyncStorage.multiRemove(['@remember:accessToken', '@remember:user'])
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient

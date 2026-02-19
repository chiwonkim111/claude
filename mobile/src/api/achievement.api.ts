/**
 * 성과 API 함수
 */
import apiClient from './client'

export const getAchievements = () => apiClient.get('/api/v1/achievements')

export const createAchievement = (data: Record<string, unknown>) =>
  apiClient.post('/api/v1/achievements', data)

export const getAchievement = (id: number) => apiClient.get(`/api/v1/achievements/${id}`)

export const updateAchievement = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/api/v1/achievements/${id}`, data)

export const deleteAchievement = (id: number) => apiClient.delete(`/api/v1/achievements/${id}`)

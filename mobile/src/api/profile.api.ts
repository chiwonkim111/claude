/**
 * 프로필 API 함수
 */
import apiClient from './client'

export const getProfile = () => apiClient.get('/api/v1/profile')

export const updateProfile = (data: Record<string, unknown>) =>
  apiClient.patch('/api/v1/profile', data)

export const addSkill = (skillId: number, proficiencyLevel: string) =>
  apiClient.post('/api/v1/profile/skills', { skillId, proficiencyLevel })

export const removeSkill = (skillId: number) =>
  apiClient.delete(`/api/v1/profile/skills/${skillId}`)

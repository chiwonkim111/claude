/**
 * 알림 API 함수
 */
import apiClient from './client'

export const getNotifications = () => apiClient.get('/api/v1/notifications')

export const markAsRead = (id: number) => apiClient.post(`/api/v1/notifications/${id}/read`)

export const getSettings = () => apiClient.get('/api/v1/notifications/settings')

export const updateSettings = (data: Record<string, unknown>) =>
  apiClient.patch('/api/v1/notifications/settings', data)

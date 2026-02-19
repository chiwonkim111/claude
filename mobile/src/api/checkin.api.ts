/**
 * 체크인 API 함수
 */
import apiClient from './client'

export const getSessions = () => apiClient.get('/api/v1/checkins')

export const createSession = () => apiClient.post('/api/v1/checkins')

export const getQuestions = (sessionId: number) =>
  apiClient.get(`/api/v1/checkins/${sessionId}/questions`)

export const saveAnswer = (sessionId: number, questionId: number, answerText: string) =>
  apiClient.patch(`/api/v1/checkins/${sessionId}/questions/${questionId}`, { answerText })

export const completeCheckin = (sessionId: number) =>
  apiClient.post(`/api/v1/checkins/${sessionId}/complete`)

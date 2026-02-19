/**
 * 마켓 밸류 API 함수
 */
import apiClient from './client'

export const getMarketValue = () => apiClient.get('/api/v1/market-value')

export const calculateMarketValue = () => apiClient.post('/api/v1/market-value/calculate')

export const getHistory = () => apiClient.get('/api/v1/market-value/history')

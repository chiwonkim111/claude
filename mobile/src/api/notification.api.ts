/**
 * 알림 API 함수
 * - Supabase RLS: 본인 설정만 접근 가능
 */
import { supabase } from './supabase'

/** 알림 설정 조회 */
export const getSettings = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()
}

/** 알림 설정 수정 */
export const updateSettings = async (data: Record<string, unknown>) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('notification_settings')
    .update(data)
    .eq('user_id', user.id)
    .select()
    .single()
}

// 참고: notification_logs 테이블은 현재 schema.sql에 미포함.
// 추후 테이블 추가 또는 Edge Function 이력 저장 방식으로 구현 예정.
export const getNotifications = async () => ({ data: [] as never[], error: null })

export const markAsRead = (_id: string) => Promise.resolve({ data: null, error: null })

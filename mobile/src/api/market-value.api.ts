/**
 * 마켓 밸류 API 함수
 * - Supabase RLS: 본인 스냅샷만 접근 가능
 * - calculateMarketValue: 복잡한 집계 로직 → Edge Function 위임
 */
import { supabase } from './supabase'

/** 최신 마켓 밸류 스냅샷 조회 */
export const getMarketValue = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('market_value_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()
}

/** 마켓 밸류 변화 이력 조회 */
export const getHistory = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('market_value_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .order('calculated_at', { ascending: false })
}

/** 마켓 밸류 재계산 요청 (Edge Function 호출) */
export const calculateMarketValue = () =>
  supabase.functions.invoke('calculate-market-value')

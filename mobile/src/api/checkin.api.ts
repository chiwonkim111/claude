/**
 * 체크인 API 함수
 * - Supabase RLS: 본인 세션/질문만 접근 가능
 * - 참고: checkin_questions INSERT는 service_role(Edge Function)만 가능
 *         → createSession 후 Edge Function 'generate-checkin-questions' 가 질문을 자동 삽입
 */
import { supabase } from './supabase'

/** 현재 분기 및 연도 계산 */
const getCurrentQuarter = (): { quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; year: number } => {
  const month = new Date().getMonth() + 1
  const quarter = month <= 3 ? 'Q1' : month <= 6 ? 'Q2' : month <= 9 ? 'Q3' : 'Q4'
  return { quarter: quarter as 'Q1' | 'Q2' | 'Q3' | 'Q4', year: new Date().getFullYear() }
}

/** 체크인 세션 목록 조회 */
export const getSessions = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('인증되지 않은 사용자')

  return supabase
    .from('checkin_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('year', { ascending: false })
}

/** 분기 체크인 세션 생성 + 질문 자동 삽입 (Supabase RPC 함수 사용)
 *  RPC 'create_checkin_session' 은 SECURITY DEFINER 로 동작하여
 *  checkin_questions INSERT RLS 를 우회하고 기본 질문 4개를 삽입합니다.
 *  RETURNS SETOF → data 가 배열로 반환되므로 [0] 인덱스로 접근
 */
export const createSession = async () => {
  const { quarter, year } = getCurrentQuarter()

  const { data, error } = await supabase.rpc('create_checkin_session', {
    p_quarter: quarter,
    p_year: year,
  })

  // RETURNS SETOF 는 배열로 반환 — 첫 번째 행을 단일 객체로 반환
  return {
    data: Array.isArray(data) ? (data[0] ?? null) : data,
    error,
  }
}

/** 체크인 질문 목록 조회 (seq 순서로 정렬) */
export const getQuestions = (sessionId: string) =>
  supabase
    .from('checkin_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('seq', { ascending: true })

/** 질문 답변 저장 (유저는 answer 필드만 UPDATE 가능) */
export const saveAnswer = (questionId: string, answer: string) =>
  supabase
    .from('checkin_questions')
    .update({ answer })
    .eq('id', questionId)
    .select()
    .single()

/** 체크인 완료 처리 */
export const completeCheckin = (sessionId: string) =>
  supabase
    .from('checkin_sessions')
    .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single()

/**
 * 체크인 상태 스토어 (Zustand)
 * - Supabase schema 기준: id → string(uuid), order → seq
 */
import { create } from 'zustand'

/** Supabase checkin_sessions 컬럼 기준 */
interface CheckinSession {
  id: string
  user_id: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: number
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  completed_at: string | null
  created_at: string
}

/** Supabase checkin_questions 컬럼 기준 (QuestionCard 타입과 일치) */
interface CheckinQuestion {
  id: string
  session_id: string
  seq: number
  question: string  // 질문 텍스트
  answer: string | null
}

interface CheckinState {
  currentSession: CheckinSession | null
  questions: CheckinQuestion[]

  setSession: (session: CheckinSession) => void
  setQuestions: (questions: CheckinQuestion[]) => void
  updateAnswer: (questionId: string, answer: string) => void
  reset: () => void
}

export const useCheckinStore = create<CheckinState>((set) => ({
  currentSession: null,
  questions: [],

  setSession: (session) => set({ currentSession: session }),

  setQuestions: (questions) => set({ questions }),

  updateAnswer: (questionId, answer) =>
    set((state) => ({
      questions: state.questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q,
      ),
    })),

  reset: () => set({ currentSession: null, questions: [] }),
}))

/**
 * 체크인 상태 스토어 (Zustand)
 */
import { create } from 'zustand'

interface CheckinSession {
  id: number
  quarter: string
  year: number
  status: string
}

interface CheckinQuestion {
  id: number
  order: number
  text: string
  answer: string | null
}

interface CheckinState {
  currentSession: CheckinSession | null
  questions: CheckinQuestion[]

  setSession: (session: CheckinSession) => void
  setQuestions: (questions: CheckinQuestion[]) => void
  updateAnswer: (questionId: number, answer: string) => void
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

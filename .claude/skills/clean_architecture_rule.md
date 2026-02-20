---
name: supabase-pattern
description: Supabase BaaS 아키텍처 구현 패턴 스킬. developer 에이전트가 Supabase 클라이언트, RLS, Edge Function, API 레이어를 일관되게 구현할 때 사용합니다.
---

Supabase 기반 코드를 구현할 때 아래 패턴을 반드시 따릅니다.

## 아키텍처 레이어 및 역할

```
┌─────────────────────────────────┐
│     Screen / Component          │  UI 렌더링, 로딩·에러 상태 표시
├─────────────────────────────────┤
│       Zustand Store             │  전역 상태 (auth, profile, checkin)
├─────────────────────────────────┤
│        API Layer                │  src/api/*.api.ts — Supabase 쿼리 함수
├─────────────────────────────────┤
│      Supabase Client            │  src/api/supabase.ts — 싱글턴 인스턴스
├─────────────────────────────────┤
│     Supabase Backend            │  Auth · PostgreSQL(RLS) · Edge Functions
└─────────────────────────────────┘

의존성 방향: Screen → Store → API → Supabase Client → Backend
```

**핵심 원칙**: Screen에서 Supabase 클라이언트를 직접 호출하지 않습니다. 반드시 `src/api/` 레이어를 통해서만 접근합니다.

---

## Supabase Client 싱글턴

```typescript
// src/api/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

/** Supabase 클라이언트 싱글턴 — 앱 전체에서 이 인스턴스만 사용 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

---

## API 레이어 패턴 (src/api/*.api.ts)

### 기본 CRUD 패턴

```typescript
// src/api/profile.api.ts
import { supabase } from './supabase'

/** 현재 로그인 유저의 프로필 조회 (RLS: 본인만 조회 가능) */
export const getProfile = () =>
  supabase
    .from('profiles')
    .select('*, profile_skills(*, skills(id, name, category))')
    .single()

/** 프로필 정보 업데이트 */
export const updateProfile = async (updates: ProfileUpdate) => {
  const { data: { user } } = await supabase.auth.getUser()
  return supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user!.id)
    .select()
    .single()
}
```

### 에러 처리 패턴

```typescript
// ✅ 올바른 예: { data, error } 구조 유지
export const getAchievements = () =>
  supabase
    .from('achievements')
    .select('*')
    .is('deleted_at', null)
    .order('started_at', { ascending: false })

// Screen에서 호출 시
const { data, error } = await getAchievements()
if (error) throw error
setAchievements(data ?? [])

// ❌ 잘못된 예: API 레이어에서 에러를 삼켜버림
export const getAchievements = async () => {
  try {
    const { data } = await supabase.from('achievements').select('*')
    return data  // error 정보 손실
  } catch { return [] }
}
```

### RPC (PostgreSQL 함수) 호출 패턴

```typescript
/** 체크인 세션 생성 — SECURITY DEFINER RPC로 질문 자동 삽입 */
export const createSession = async () => {
  const now = new Date()
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}` as CheckinQuarter
  const year = now.getFullYear()

  const { data, error } = await supabase.rpc('create_checkin_session', {
    p_quarter: quarter,
    p_year: year,
  })

  if (error) return { data: null, error }

  // RETURNS SETOF 함수는 배열로 반환
  const session = Array.isArray(data) ? data[0] : data
  return { data: session, error: null }
}
```

### Edge Function 호출 패턴

```typescript
/** AI 마켓밸류 계산 — 서버 사이드 처리 (Edge Function) */
export const calculateMarketValue = () =>
  supabase.functions.invoke('calculate-market-value', { body: {} })
```

---

## Zustand Store 패턴 (src/stores/*.store.ts)

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand'
import { supabase } from '@/api/supabase'
import { User, Session } from '@supabase/supabase-js'

interface AuthStore {
  user: User | null
  session: Session | null
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  restoreAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoggedIn: false,

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setSession: (session) => set({ session, user: session?.user ?? null, isLoggedIn: !!session }),

  /** 앱 시작 시 저장된 세션 복원 */
  restoreAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, isLoggedIn: !!session })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, isLoggedIn: false })
  },
}))
```

---

## Supabase 인증 패턴

```typescript
// src/api/auth.api.ts

/** 이메일/비밀번호 로그인 */
export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

/** 회원가입 */
export const signUp = (email: string, password: string, fullName: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })

/** 로그아웃 */
export const signOut = () => supabase.auth.signOut()

/** 현재 세션 조회 */
export const getSession = () => supabase.auth.getSession()
```

---

## RLS 정책 설계 원칙

```sql
-- 패턴 1: 본인 데이터만 접근
CREATE POLICY "테이블: 본인 SELECT"
  ON public.테이블 FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 패턴 2: 관계 테이블 (profiles.id 경유)
CREATE POLICY "profile_skills: 본인 INSERT"
  ON public.profile_skills FOR INSERT TO authenticated
  WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 패턴 3: SECURITY DEFINER RPC로 RLS 우회 (AI가 삽입하는 경우)
CREATE OR REPLACE FUNCTION create_checkin_session(p_quarter checkin_quarter, p_year int)
RETURNS SETOF checkin_sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RLS 우회하여 관련 레코드 생성 가능
  INSERT INTO checkin_questions ...
  RETURN QUERY SELECT * FROM checkin_sessions WHERE ...;
END;
$$;
```

---

## Screen 구현 원칙

```typescript
const HomeScreen: React.FC = memo(() => {
  // ─── 상태 ──────────────────────────────────────────
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DataType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)

  // ─── 데이터 로드 ───────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const { data: result, error } = await getData()
      if (error) throw error
      setData(result ?? [])
    } catch {
      setToast({ type: 'error', message: '데이터를 불러오지 못했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ─── 렌더 ──────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {isLoading ? <Skeleton /> : <Content data={data} />}
      </ScrollView>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </View>
  )
})
```

---

## 레이어 간 import 금지 규칙

```
Screen    → supabase 직접 import 금지 (반드시 API 레이어 경유)
API Layer → Store import 금지 (단방향 의존성 유지)
Store     → Screen import 금지
```

---

## 자주 쓰는 Supabase 쿼리 패턴

```typescript
// 조건 필터
supabase.from('table').select('*').eq('column', value)
supabase.from('table').select('*').is('deleted_at', null)
supabase.from('table').select('*').in('status', ['PENDING', 'IN_PROGRESS'])

// 정렬 및 페이지네이션
supabase.from('table').select('*').order('created_at', { ascending: false }).limit(10)

// JOIN (외래키 관계)
supabase.from('profile_skills').select('*, skills(id, name, category)')

// UPSERT (있으면 업데이트, 없으면 삽입)
supabase.from('profiles').upsert({ user_id: uid, ...data }, { onConflict: 'user_id' })

// Soft Delete
supabase.from('achievements').update({ deleted_at: new Date().toISOString() }).eq('id', id)
```

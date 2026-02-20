-- =============================================================================
-- Remember 커리어 프로필 다이어리 - Supabase Database Schema
-- =============================================================================
-- 실행 순서: extensions → tables → triggers → RLS → policies → indexes
-- Supabase SQL Editor에 그대로 붙여넣기하여 실행 가능
-- =============================================================================


-- =============================================================================
-- SECTION 1: EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 텍스트 검색 최적화용


-- =============================================================================
-- SECTION 2: TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2-1. profiles
-- auth.users와 1:1 연결. 커리어 프로필 정보 저장
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    text,
    job_title       text,
    company         text,
    years_of_exp    smallint CHECK (years_of_exp >= 0),
    bio             text,
    avatar_url      text,
    completeness    smallint NOT NULL DEFAULT 0 CHECK (completeness BETWEEN 0 AND 100),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles                IS '커리어 프로필 (auth.users와 1:1)';
COMMENT ON COLUMN public.profiles.completeness   IS '프로필 완성도 (0~100%)';
COMMENT ON COLUMN public.profiles.years_of_exp   IS '총 경력 연수';


-- ---------------------------------------------------------------------------
-- 2-2. skills
-- 스킬 마스터 테이블. INSERT는 서비스 롤만 허용
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        text NOT NULL UNIQUE,
    category    text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.skills IS '스킬 마스터 테이블 (플랫폼 관리)';


-- ---------------------------------------------------------------------------
-- 2-3. profile_skills
-- 프로필-스킬 다대다 연결
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_skills (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_id    uuid NOT NULL REFERENCES public.skills(id)   ON DELETE CASCADE,
    level       smallint CHECK (level BETWEEN 1 AND 5),   -- 1: 입문 ~ 5: 전문가
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (profile_id, skill_id)
);

COMMENT ON TABLE  public.profile_skills        IS '프로필-스킬 다대다 연결';
COMMENT ON COLUMN public.profile_skills.level  IS '숙련도 (1: 입문 ~ 5: 전문가)';


-- ---------------------------------------------------------------------------
-- 2-4. checkin_sessions
-- 분기별 체크인 세션. 동일 유저의 같은 분기/연도 중복 불가
-- ---------------------------------------------------------------------------
CREATE TYPE public.checkin_quarter AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');
CREATE TYPE public.checkin_status  AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE IF NOT EXISTS public.checkin_sessions (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quarter     public.checkin_quarter NOT NULL,
    year        smallint NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    status      public.checkin_status NOT NULL DEFAULT 'PENDING',
    completed_at timestamptz,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, quarter, year)
);

COMMENT ON TABLE public.checkin_sessions IS '분기별 체크인 세션 (Q1~Q4)';


-- ---------------------------------------------------------------------------
-- 2-5. checkin_questions
-- 세션당 AI 생성 질문 (최대 4개). 유저는 answer 필드만 업데이트 가능
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.checkin_questions (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id  uuid NOT NULL REFERENCES public.checkin_sessions(id) ON DELETE CASCADE,
    seq         smallint NOT NULL CHECK (seq BETWEEN 1 AND 4),
    question    text NOT NULL,
    answer      text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (session_id, seq)
);

COMMENT ON TABLE  public.checkin_questions           IS 'AI 생성 체크인 질문 (세션당 최대 4개)';
COMMENT ON COLUMN public.checkin_questions.seq       IS '질문 순서 (1~4)';
COMMENT ON COLUMN public.checkin_questions.answer    IS '유저 답변 (본인만 수정 가능)';


-- ---------------------------------------------------------------------------
-- 2-6. achievements
-- 커리어 성과. Soft delete 지원 (deleted_at)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           text NOT NULL,
    description     text,
    project_name    text,
    started_at      date,
    ended_at        date,
    is_verified     boolean NOT NULL DEFAULT false,
    deleted_at      timestamptz,   -- Soft delete
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.achievements              IS '커리어 성과 (Soft delete 지원)';
COMMENT ON COLUMN public.achievements.is_verified  IS '동료 인증 완료 여부';
COMMENT ON COLUMN public.achievements.deleted_at   IS 'Soft delete 타임스탬프 (NULL = 활성)';


-- ---------------------------------------------------------------------------
-- 2-7. peer_verifications
-- 동료 인증 요청. 동일 achievement/verifier 쌍 중복 불가
-- ---------------------------------------------------------------------------
CREATE TYPE public.verification_status AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRED');

CREATE TABLE IF NOT EXISTS public.peer_verifications (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_id  uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    requester_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    verifier_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status          public.verification_status NOT NULL DEFAULT 'REQUESTED',
    message         text,          -- 요청자가 보내는 메시지
    feedback        text,          -- 인증자의 피드백
    responded_at    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (achievement_id, verifier_id),
    CHECK (requester_id <> verifier_id)
);

COMMENT ON TABLE  public.peer_verifications              IS '동료 인증 요청';
COMMENT ON COLUMN public.peer_verifications.message      IS '요청자가 인증자에게 보내는 메시지';
COMMENT ON COLUMN public.peer_verifications.feedback     IS '인증자의 승인/거절 피드백';
COMMENT ON COLUMN public.peer_verifications.responded_at IS '인증자 응답 시각';


-- ---------------------------------------------------------------------------
-- 2-8. market_value_snapshots
-- 분기별 마켓밸류 스냅샷
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_value_snapshots (
    id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quarter             public.checkin_quarter NOT NULL,
    year                smallint NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    salary_min          integer CHECK (salary_min >= 0),        -- 만원 단위
    salary_max          integer CHECK (salary_max >= 0),
    hire_probability    numeric(5, 2) CHECK (hire_probability BETWEEN 0 AND 100),  -- %
    score               numeric(5, 2),                          -- 마켓밸류 점수
    metadata            jsonb,                                   -- 추가 분석 데이터
    calculated_at       timestamptz NOT NULL DEFAULT now(),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

COMMENT ON TABLE  public.market_value_snapshots                  IS '분기별 마켓밸류 스냅샷';
COMMENT ON COLUMN public.market_value_snapshots.salary_min       IS '예상 연봉 하한 (만원)';
COMMENT ON COLUMN public.market_value_snapshots.salary_max       IS '예상 연봉 상한 (만원)';
COMMENT ON COLUMN public.market_value_snapshots.hire_probability IS '채용 가능성 (0~100%)';
COMMENT ON COLUMN public.market_value_snapshots.metadata         IS '추가 분석 데이터 (JSON)';


-- ---------------------------------------------------------------------------
-- 2-9. notification_settings
-- 유저별 알림 설정 (auth.users 신규 가입 시 자동 생성)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id                          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_reminder            boolean NOT NULL DEFAULT true,
    market_value_update         boolean NOT NULL DEFAULT true,
    peer_verification_request   boolean NOT NULL DEFAULT true,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notification_settings                          IS '유저별 알림 설정';
COMMENT ON COLUMN public.notification_settings.checkin_reminder         IS '체크인 리마인더 알림';
COMMENT ON COLUMN public.notification_settings.market_value_update      IS '마켓밸류 업데이트 알림';
COMMENT ON COLUMN public.notification_settings.peer_verification_request IS '동료 인증 요청 알림';


-- =============================================================================
-- SECTION 3: TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3-1. updated_at 자동 갱신 함수
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 각 테이블에 updated_at 트리거 등록
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_skills_updated_at
    BEFORE UPDATE ON public.skills
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_profile_skills_updated_at
    BEFORE UPDATE ON public.profile_skills
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_checkin_sessions_updated_at
    BEFORE UPDATE ON public.checkin_sessions
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_checkin_questions_updated_at
    BEFORE UPDATE ON public.checkin_questions
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_peer_verifications_updated_at
    BEFORE UPDATE ON public.peer_verifications
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_market_value_snapshots_updated_at
    BEFORE UPDATE ON public.market_value_snapshots
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE TRIGGER trg_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();


-- ---------------------------------------------------------------------------
-- 3-2. 신규 유저 가입 시 profiles + notification_settings 자동 생성
-- auth.users INSERT 이벤트를 감지하여 두 행을 자동으로 삽입
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 프로필 자동 생성
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 알림 설정 자동 생성
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();


-- =============================================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS) 활성화
-- =============================================================================

ALTER TABLE public.profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkin_questions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_verifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_value_snapshots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings    ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- SECTION 5: RLS POLICIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5-1. profiles: 본인 데이터만 SELECT / UPDATE
-- ---------------------------------------------------------------------------
CREATE POLICY "profiles: 본인 SELECT"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "profiles: 본인 UPDATE"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5-2. skills: 모든 인증 유저 SELECT, INSERT는 서비스 롤만
-- ---------------------------------------------------------------------------
CREATE POLICY "skills: 인증 유저 SELECT"
    ON public.skills FOR SELECT
    TO authenticated
    USING (true);

-- INSERT 는 service_role 만 가능 (RLS 우회). authenticated 에는 정책 없음 = 차단.


-- ---------------------------------------------------------------------------
-- 5-3. profile_skills: 본인 프로필에만 SELECT / INSERT / DELETE
-- ---------------------------------------------------------------------------
CREATE POLICY "profile_skills: 본인 SELECT"
    ON public.profile_skills FOR SELECT
    TO authenticated
    USING (
        profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "profile_skills: 본인 INSERT"
    ON public.profile_skills FOR INSERT
    TO authenticated
    WITH CHECK (
        profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "profile_skills: 본인 DELETE"
    ON public.profile_skills FOR DELETE
    TO authenticated
    USING (
        profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );


-- ---------------------------------------------------------------------------
-- 5-4. checkin_sessions: 본인 데이터만 CRUD
-- ---------------------------------------------------------------------------
CREATE POLICY "checkin_sessions: 본인 SELECT"
    ON public.checkin_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "checkin_sessions: 본인 INSERT"
    ON public.checkin_sessions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "checkin_sessions: 본인 UPDATE"
    ON public.checkin_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "checkin_sessions: 본인 DELETE"
    ON public.checkin_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5-5. checkin_questions: 세션 소유자만 SELECT / UPDATE (answer 필드)
-- ---------------------------------------------------------------------------
CREATE POLICY "checkin_questions: 세션 소유자 SELECT"
    ON public.checkin_questions FOR SELECT
    TO authenticated
    USING (
        session_id IN (
            SELECT id FROM public.checkin_sessions WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "checkin_questions: 세션 소유자 UPDATE"
    ON public.checkin_questions FOR UPDATE
    TO authenticated
    USING (
        session_id IN (
            SELECT id FROM public.checkin_sessions WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        session_id IN (
            SELECT id FROM public.checkin_sessions WHERE user_id = auth.uid()
        )
    );

-- INSERT / DELETE 는 서비스 롤(AI 생성)만 가능. authenticated 에는 정책 없음 = 차단.


-- ---------------------------------------------------------------------------
-- 5-6. achievements: 본인 데이터만 CRUD (deleted_at IS NULL 필터 포함)
-- ---------------------------------------------------------------------------
CREATE POLICY "achievements: 본인 SELECT"
    ON public.achievements FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "achievements: 본인 INSERT"
    ON public.achievements FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievements: 본인 UPDATE"
    ON public.achievements FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL)
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievements: 본인 DELETE (soft)"
    ON public.achievements FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5-7. peer_verifications
--   - SELECT : requester 또는 verifier
--   - INSERT : requester만 (requester_id = auth.uid())
--   - UPDATE : verifier만 (verifier_id = auth.uid())
-- ---------------------------------------------------------------------------
CREATE POLICY "peer_verifications: 당사자 SELECT"
    ON public.peer_verifications FOR SELECT
    TO authenticated
    USING (
        requester_id = auth.uid() OR verifier_id = auth.uid()
    );

CREATE POLICY "peer_verifications: requester INSERT"
    ON public.peer_verifications FOR INSERT
    TO authenticated
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "peer_verifications: verifier UPDATE"
    ON public.peer_verifications FOR UPDATE
    TO authenticated
    USING (verifier_id = auth.uid())
    WITH CHECK (verifier_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5-8. market_value_snapshots: 본인 데이터만 SELECT / INSERT
-- ---------------------------------------------------------------------------
CREATE POLICY "market_value_snapshots: 본인 SELECT"
    ON public.market_value_snapshots FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "market_value_snapshots: 본인 INSERT"
    ON public.market_value_snapshots FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());


-- ---------------------------------------------------------------------------
-- 5-9. notification_settings: 본인 데이터만 SELECT / UPDATE
-- ---------------------------------------------------------------------------
CREATE POLICY "notification_settings: 본인 SELECT"
    ON public.notification_settings FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "notification_settings: 본인 UPDATE"
    ON public.notification_settings FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- SECTION 6: INDEXES
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
    ON public.profiles (user_id);

-- skills
CREATE INDEX IF NOT EXISTS idx_skills_name_trgm
    ON public.skills USING gin (name gin_trgm_ops);  -- 텍스트 부분 검색

-- profile_skills
CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id
    ON public.profile_skills (profile_id);

CREATE INDEX IF NOT EXISTS idx_profile_skills_skill_id
    ON public.profile_skills (skill_id);

-- checkin_sessions
CREATE INDEX IF NOT EXISTS idx_checkin_sessions_user_quarter_year
    ON public.checkin_sessions (user_id, quarter, year);

-- checkin_questions
CREATE INDEX IF NOT EXISTS idx_checkin_questions_session_id
    ON public.checkin_questions (session_id);

-- achievements
CREATE INDEX IF NOT EXISTS idx_achievements_user_deleted_at
    ON public.achievements (user_id, deleted_at);

-- peer_verifications
CREATE INDEX IF NOT EXISTS idx_peer_verifications_achievement_id
    ON public.peer_verifications (achievement_id);

CREATE INDEX IF NOT EXISTS idx_peer_verifications_requester_id
    ON public.peer_verifications (requester_id);

CREATE INDEX IF NOT EXISTS idx_peer_verifications_verifier_id
    ON public.peer_verifications (verifier_id);

-- market_value_snapshots
CREATE INDEX IF NOT EXISTS idx_market_value_snapshots_user_calculated_at
    ON public.market_value_snapshots (user_id, calculated_at DESC);

-- notification_settings
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id
    ON public.notification_settings (user_id);


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================

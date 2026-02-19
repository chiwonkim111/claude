---
name: command-plan
description: 사용자가 /plan [아이디어] 입력 시 실행되는 기획 워크플로우
---

# Workflow

사용자가 "/plan" 명령을 내리면 다음 단계를 수행한다:

1. `planner` 에이전트를 호출하여 요구사항을 분석한다.
2. `architect` 에이전트와 협의하여 `docs/PLAN.md`에 기술 스택과 DB 구조를 설계한다.
3. 작업 완료 후 사용자에게 설계 요약본을 보고한다.

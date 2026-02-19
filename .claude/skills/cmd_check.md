---
name: command-check
description: 사용자가 /check 입력 시 실행되는 검수 워크플로우
---

# Workflow

사용자가 "/check" 명령을 내리면 다음 단계를 수행한다:

1. `qa` 에이전트가 `docs/PLAN.md`와 현재 코드를 비교한다.
2. `qa-checklist` 스킬에 따라 0~100% 점수가 포함된 리포트를 작성한다.
3. 발견된 버그나 미구현 기능 목록을 우선순위별로 나열한다.

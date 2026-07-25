# NAN2026 제출 체크리스트 — 「이상 없음 (ALL CLEAR)」

> NHN GAME × AI HACKATHON (NAN2026) 사전 과제 · 개인 참가
> 마감: **2026-08-10** · 저장소: https://github.com/kjs844-art/NHNPRE (public)

이 문서는 제출을 끝내기 위해 **남은 단계**와, 이미 준비된 **제출물 상태**를 정리한 것입니다.

---

## ✅ 준비 완료 (코드/문서 — 저장소에 있음)

| 요건 | 상태 | 위치 |
|---|---|---|
| ① 플레이 가능한 웹 빌드 + 전체 소스 + 커밋 기록 | 준비됨 (Pages 활성화 대기) | 저장소 전체, `.github/workflows/deploy.yml` |
| ② 플레이 영상 30~60초 | 2종 제작됨 (1일차 / 3일차) | 채팅으로 전달 — **YouTube 업로드 필요** |
| ③ 게임 소개·설명 문서 PDF | 완성 | `docs/game-intro.html` → PDF |
| ④ AI 활용 기술 문서 PDF | 완성 | `docs/ai-tech.html` → PDF |
| ⑤ 팀원 롤 기술서 | 해당 없음 (개인 참가) | — |

**검증 완료:** 타입체크·린트 경고 0 / 엔진 단위 테스트 19개 통과 / Playwright 5일 밤 전체·반전·배드엔딩 완주(콘솔 에러 0) / 프로덕션 빌드를 실제 Pages 경로(`/NHNPRE/`)로 서빙해 부팅·플레이·자산 로드 확인.

---

## ⬜ 남은 단계 (사용자 계정 권한 필요)

### 1. PR을 main에 머지
- PR #1: https://github.com/kjs844-art/NHNPRE/pull/1
- Pages 배포는 기본 브랜치(main)에서 가장 안정적이므로 먼저 머지 권장.

### 2. GitHub Pages 활성화
- **Settings → Pages → Build and deployment → Source: "GitHub Actions"** 선택.
- (필요 시 Settings → Actions → General에서 Actions가 **Allow** 상태인지 확인.)
- 머지 후 자동 배포가 돌면 다음 주소로 접속: **https://kjs844-art.github.io/NHNPRE/**
- 심사자용: 주소 끝에 `?judge=1`을 붙이면 모든 밤 선택 가능 → 5일차 반전 바로 확인.

### 3. 플레이 영상 YouTube 업로드
- 전달한 영상 2종 중 하나 선택 (3일차 컷 권장 — 게임을 더 잘 보여줌).
- 업로드 후, 아래 두 문서의 `[YouTube 링크]` 자리에 실제 링크 기입:
  - `docs/game-intro.html` (게임 소개 PDF)
  - 필요 시 재-PDF 변환 (브라우저에서 HTML 열고 인쇄 → PDF 저장).

### 4. 참가 신청 폼 제출
- https://nan2026.nhn.com 의 "참가 신청"에서 5개 제출물 제출:
  1. GitHub 링크 (빌드+소스) — https://github.com/kjs844-art/NHNPRE
  2. YouTube 링크 (플레이 영상)
  3. 게임 소개·설명 PDF
  4. AI 활용 기술 문서 PDF
  5. (개인 참가 → 팀원 롤 기술서 생략)
- 개인정보 수집·이용 및 저작권 동의 포함.

---

## 유의 (요강 기준)

- **심사 종료 시점까지** GitHub 저장소를 public으로, YouTube 영상을 접근 가능하게 유지.
- 접수 마감(8/10) 후에는 제출 내용 변경 불가.
- 외부 에셋 0개(전 요소 코드 생성) — 이미 AI 활용 기술 문서에 명시됨.
- 본행사: 2026-09-04~06, 성남 NHN 사옥, 48시간 전일 참여(온라인 불가). 참가팀 발표 8/22.

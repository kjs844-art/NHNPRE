# 이상 없음 (ALL CLEAR)

> **오늘 밤도, 이상 없음.**
> 낡은 빌라의 야간 원격 관제사가 되어 CCTV 화면 속 '이상 현상'을 찾아 보고하는 관찰 심리 호러 게임.
> 단, 마지막 밤에는 카메라가 당신을 비춘다.

**NHN GAME × AI HACKATHON (NAN2026) 사전 과제 제출작** · 브라우저에서 바로 플레이 · 개인 참가

---

## ▶ 플레이

- **플레이 링크:** https://kjs844-art.github.io/NHNPRE/ *(GitHub Pages 활성화 후 접속 가능 — 아래 배포 안내 참고)*
- **로컬 실행:**
  ```bash
  git clone https://github.com/kjs844-art/NHNPRE.git
  cd NHNPRE
  npm install
  npm run dev
  ```
  권장: 데스크톱 Chrome/Edge · 마우스 · 소리 켜기

## 게임 방법

- 하단 **CAM 버튼**으로 CCTV를 전환하며 순찰한다.
- 화면에서 달라진 것을 발견하면 우측 하단 **[보고]** → 이상 유형을 선택한다.
- 이상 유형: 물체 이동 · 물체 소실 · 침입자 · 조명 이상 · 개방 · 화면 왜곡 (밤이 지날수록 해금)
- 이상을 **방치하면 침식도가 상승**하고, 침입자는 카메라 쪽으로 다가온다. 침식도 100% → 배드엔딩.
- 없는 것을 보고하면 기록이 남는다. **확실할 때만.**
- 변화는 **당신이 보고 있지 않을 때** 일어난다. 순찰 리듬이 곧 생존이다.
- 5일 밤의 수습 근무를 마치면 — CAM 07이 켜진다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| UI / 상태 | React 19 + TypeScript |
| 렌더링 | Phaser 3 (Canvas) |
| 빌드 | Vite 8 |
| 아트 | 100% 코드 드로잉 (Phaser Graphics) — 외부 이미지 0개 |
| 사운드 | 100% WebAudio 합성 — 외부 음원 0개 |

- **밤 엔진**(`src/game/engine/`)은 프레임워크에 독립적인 순수 TypeScript 상태머신으로, 시드 가능한 RNG 위에서 동작해 자동 테스트로 재현·검증한다.
- **AI 디렉터**(`src/game/engine/director.ts`)가 플레이어의 탐지 정확도·속도를 추적해 스폰 간격·이상 유형·동시 발생 수를 실시간 조정하며, 침식도가 높으면 '자비 규칙'으로 좌절을 방지한다.

## 프로젝트 구조

```
src/
  game/
    engine/     # 순수 TS: 밤 상태머신, AI 디렉터, 시드 RNG, 타입
    rooms/      # 6개 CCTV 방 + 관제실(CAM 07) 코드 드로잉
    scenes/     # Phaser 카메라 씬 (노이즈/스캔라인/비네트/왜곡)
    data/       # 밤 구성, 대사·스토리 스크립트
    AudioEngine.ts, EventBus.ts, save.ts
  components/   # React UI: 메뉴, 근무자 등록, 브리핑, HUD, 채팅,
                #           보고 모달, 반전 모달, 엔딩
  App.tsx       # 게임 흐름 오케스트레이션
docs/           # 디자인 문서, 게임 소개 PDF 원본, AI 활용 기술 문서 원본
```

## 개발 스크립트

```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (tsc + vite)
npm run lint     # oxlint
npm test         # 밤 엔진 단위 테스트 (node:test + tsx) — 19개
```

URL 파라미터:
- `?judge=1` — **심사자 모드**: 모든 밤을 즉시 선택 가능(메뉴의 '밤 선택'). 반전이 있는 5일차로 바로 진입해 3~10분 안에 게임 전체를 볼 수 있다.
- `?seed=42` — 재현 가능한 밤(고정 시드)
- `?speed=4` — 테스트용 배속(1~8)

## 배포 (GitHub Pages)

`.github/workflows/deploy.yml`이 푸시 시 자동 빌드·배포한다. **최초 1회**, 저장소
**Settings → Pages → Build and deployment → Source: "GitHub Actions"** 를 선택해야
활성화된다. (Vite `base`는 `GITHUB_PAGES=true`일 때 `/NHNPRE/`로 전환된다.)

## AI 활용

이 게임은 기획·구현·아트·사운드·테스트·문서까지 Claude(Claude Code)로 제작했으며,
설계 비평과 코드 리뷰는 다중 AI 에이전트 워크플로우로 수행했다. 상세 내역은
`docs/ai-tech.html`(제출용 AI 활용 기술 문서)에 정리돼 있다.

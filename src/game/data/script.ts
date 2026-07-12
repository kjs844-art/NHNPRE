export const GAME_TITLE = '이상 없음'
export const GAME_TITLE_EN = 'ALL CLEAR'
export const GAME_TAGLINE = '오늘 밤도, 이상 없음.'

/** 대사 속 {NAME} 은 근무자 등록 이름으로 치환된다 */
export interface ChatLine {
  /** 밤 경과 시간(초). 없으면 브리핑/아웃트로 용 */
  at?: number
  from: 'boss' | 'system'
  text: string
}

export interface NightScript {
  briefing: ChatLine[]
  timed: ChatLine[]
  onFirstResolve?: string
  onFalse: string[]
  onFalseGraced?: string
  onNearMiss: string
  onStrike: string
  onErosionHigh?: string
  clearOutro: string[]
}

export const BOSS_NAME = '박 주임'

export const NIGHT_SCRIPTS: Record<number, NightScript> = {
  1: {
    briefing: [
      { from: 'system', text: '한빛빌라 통합관제 v2.3 — REMOTE ACCESS 연결됨' },
      { from: 'boss', text: '신입, 첫 출근 축하해. 관제팀 박 주임이야. 요즘 관제는 다 재택이지.' },
      { from: 'boss', text: '일은 단순해. 카메라를 돌려 보다가 뭔가 이상하면 [보고]를 눌러.' },
      { from: 'boss', text: '우선 카메라 세 대를 한 바퀴 돌면서 눈에 익혀 둬. 그게 기본이야.' },
    ],
    timed: [
      { at: 12, from: 'boss', text: '잠깐 — 4층 복도 카메라 좀 봐봐. 지금.' },
      { at: 26, from: 'boss', text: '그래, 그런 식이야. 이상하면 바로 [보고].' },
      { at: 40, from: 'boss', text: '이상한 건 오래 두지 마. 이 건물은 방치하면 나빠지는 게 빨라.' },
      { at: 62, from: 'boss', text: '없는 걸 보고하는 건 안 돼. 확실할 때만.' },
    ],
    onFirstResolve: '접수 완료. 그렇게 하면 돼. 손이 빠르네.',
    onFalse: ['음? 그 화면엔 아무것도 없는데. 침착하게, 확실할 때만.'],
    onFalseGraced: '그건 원래 그래. 처음이니까 봐주는 거야. 잘 봐 둬.',
    onNearMiss: '뭔가 있긴 한데… 그게 아니야. 다시 봐.',
    onStrike: '오탐 3회. …감사팀에 기록됐어.',
    onErosionHigh: '신입, 화면 상태가 왜 이래? 빨리 잡아. 늦으면 걷잡을 수 없어.',
    clearOutro: [
      '오전 6:00 — 근무 종료. 보고서 전송됨: 「이상 없음」',
      '박 주임: 첫날치고 나쁘지 않네. 아, 전임자가 갑자기 그만두는 바람에 네가 급하게 온 거야. 내일 봐.',
    ],
  },
  2: {
    briefing: [
      { from: 'system', text: '야간 근무 2일차 — REMOTE ACCESS 연결됨' },
      { from: 'boss', text: '오늘부터 지하 주차장도 네 담당이야.' },
      { from: 'boss', text: '문이 열려 있으면 [개방], 물건이 자리를 옮겼으면 [물체 이동]으로.' },
      { from: 'boss', text: '…그런데 하나만 묻자. 어제 새벽에 관제실 들어갔었어?' },
      { from: 'boss', text: '출입 기록이 떠서. 아, 너 재택이지. 시스템 오류겠네. 신경 쓰지 마.' },
    ],
    timed: [
      { at: 30, from: 'boss', text: '주차장 셔터는 자정 이후엔 항상 닫혀 있어야 해.' },
      { at: 70, from: 'boss', text: '입주민 민원이 왔는데… 새벽에 복도에서 발소리가 난대. 별일 아니겠지.' },
    ],
    onFirstResolve: '접수. 손이 빨라졌네.',
    onFalse: ['아무것도 없어. 화면을 좀 더 오래 보고 판단해.', '오탐 2회째. 다음은 기록 남아.'],
    onNearMiss: '방향은 맞는데 유형이 틀렸어. 뭐가 달라졌는지 다시 봐.',
    onStrike: '오탐 3회. 감사팀 통보됐어. 정신 차려.',
    onErosionHigh: '침식 수치가 올라가고 있어. 이상 현상부터 처리해, 빨리.',
    clearOutro: [
      '오전 6:00 — 근무 종료. 보고서 전송됨: 「이상 없음」',
      '박 주임: 수고했어. …관제실 출입 기록, 오늘도 떴더라. 점검 요청해 놨어.',
    ],
  },
  3: {
    briefing: [
      { from: 'system', text: '야간 근무 3일차 — REMOTE ACCESS 연결됨' },
      { from: 'boss', text: '엘리베이터 카메라 추가야. 오래된 기종이라 화면이 가끔 튀어.' },
      { from: 'boss', text: '화면이 지지직거리거나 기울면 [화면 왜곡]으로 보고해.' },
      { from: 'boss', text: '전임자 짐을 정리하다 근무 일지를 찾았는데, 마지막 장에 이렇게 적혀 있더라.' },
      { from: 'boss', text: '「화면 속에 내가 있다」 …과로였겠지. 너는 무리하지 마.' },
    ],
    timed: [
      { at: 35, from: 'boss', text: '동시에 두 군데서 뜰 수도 있어. 우선순위는 침입자부터.' },
      { at: 80, from: 'boss', text: '수고했어, {NAME}… 아니, 미안. 신입. 전임자 이름이랑 헷갈렸네.' },
    ],
    onFirstResolve: '접수 완료. 오늘도 부탁해.',
    onFalse: ['없는 걸 봤어? …이 건물, 오래 보고 있으면 가끔 그래.', '오탐 2회. 침착해.'],
    onNearMiss: '뭔가 있긴 한데 그게 아니야.',
    onStrike: '오탐 3회째야. …전임자도 막판엔 오탐이 부쩍 늘었었는데.',
    onErosionHigh: '수치가 위험해. 지금 화면에 뜬 것부터 잡아.',
    clearOutro: [
      '오전 6:00 — 근무 종료. 보고서 전송됨: 「이상 없음」',
      '박 주임: 오늘 새벽 4시 44분에 관제실 카메라가 3초간 켜졌었어. 재택인 네가 알 리 없겠지만.',
    ],
  },
  4: {
    briefing: [
      { from: 'system', text: '야간 근무 4일차 — REMOTE ACCESS 연결됨' },
      { from: 'system', text: '경고: 근무자 인증 정보 불일치 — 관리자에게 문의하십시오' },
      { from: 'boss', text: '옥상까지 전부 네 담당이야. 오늘은 좀 많이 뜰 거야.' },
      { from: 'boss', text: '민원 또 왔어. 새벽 4시에 4층 복도를 걷는 사람이 있대.' },
      { from: 'boss', text: '그 시간 녹화본엔 아무도 없어. 네 보고서에도 「이상 없음」이었고.' },
      { from: 'boss', text: '…신입. 혹시 나한테 메시지 보낼 때, 계정 두 개로 보내고 있어?' },
    ],
    timed: [
      { at: 40, from: 'boss', text: '옥상 문은 항상 잠겨 있어야 해. 열려 있으면 바로 보고해.' },
      { at: 90, from: 'boss', text: '너 지금… 아니다. 화면에 집중해.' },
      { at: 115, from: 'system', text: '수신 오류: 동일한 보고서가 두 번 접수되었습니다' },
    ],
    onFirstResolve: '접수. 반응이 점점 빨라지네. 전임자 최고 기록에 가까워.',
    onFalse: ['그 화면엔 아무것도 없어. …정말 없어야 하는데.', '오탐 2회. 손 떨려?'],
    onNearMiss: '아니야, 그게 아니야. 다시.',
    onStrike: '오탐 3회. …너 요즘 잠은 자? 전임자도 그랬어. 잠을 못 잔댔어.',
    onErosionHigh: '침식도가 한계야. 뭐가 됐든 지금 당장 잡아.',
    clearOutro: [
      '오전 6:00 — 근무 종료. 보고서 전송됨: 「이상 없음」',
      '박 주임: 내일이 5일차, 마지막 수습 근무야. 끝나고 정직원 서류 쓰자.',
      '박 주임: …그리고 미안한데, 내일은 감사팀이 함께 지켜볼 거야. 절차상 그래.',
    ],
  },
  5: {
    briefing: [
      { from: 'system', text: '야간 근무 5일차 — REMOTE ACCESS 연결됨' },
      { from: 'system', text: '경고: 근무자 인증 정보 불일치 (21일째)' },
      { from: 'boss', text: '마지막 밤이야. 평소대로만 하면 돼.' },
      { from: 'boss', text: '감사팀도 접속해 있으니까, 침착하게. 확실할 때만 보고.' },
    ],
    timed: [
      { at: 20, from: 'boss', text: '좋아, 안정적이야.' },
      { at: 45, from: 'boss', text: '…잠깐. 방금 뭐 지나가지 않았어? 아니다. 계속해.' },
    ],
    onFirstResolve: '접수 완료.',
    onFalse: ['오탐이야. 감사팀이 보고 있어, 침착해.', '오탐 2회. 제발.'],
    onNearMiss: '유형이 틀렸어. 침착해.',
    onStrike: '오탐 3회. 감사팀에서 네 계정을 조회하기 시작했어.',
    onErosionHigh: '수치가 위험해!',
    clearOutro: [],
  },
}

/** 5일차 반전: 모든 이상이 일제히 사라진 직후의 시퀀스 (delay는 직전 스텝 기준 초) */
export const TWIST_CHAT: Array<{ delay: number; from: 'boss' | 'system'; text: string }> = [
  { delay: 1.0, from: 'system', text: '알림: 모든 카메라 상태 — 정상' },
  { delay: 2.2, from: 'boss', text: '…방금 전부 한꺼번에 정상으로 돌아왔어. 그럴 리가 없는데.' },
  { delay: 2.4, from: 'system', text: '신규 피드 감지: CAM 07 — 관제실' },
  { delay: 2.0, from: 'boss', text: 'CAM 07? 그 채널은 3주 전에 폐쇄됐어.' },
  { delay: 2.6, from: 'boss', text: '신입, 오늘 관제실은 비어 있어야 해. 너 재택이잖아.' },
  { delay: 2.4, from: 'boss', text: '…지금 화면에 보이는 거, 누구야?' },
]

/**
 * CAM 07 규칙: 화면 속 인물은 보고 있는 동안 절대 움직이지 않는다.
 * 다른 카메라로 눈을 돌렸다 돌아올 때마다 한 단계씩 달라져 있다.
 * stage 0: 책상 앞 뒷모습 → 1: 고개가 기울어짐 → 2: 몸이 이쪽으로 돌아 있음 → 3: 의자가 비어 있음
 */
export const TWIST_STAGE_CHAT: Record<number, Array<{ delay: number; from: 'boss' | 'system'; text: string }>> = {
  0: [
    { delay: 1.6, from: 'boss', text: '책상에 앉아 있는 사람… 보여? 미동도 없어.' },
    { delay: 3.0, from: 'boss', text: '잠깐, 저 모니터에 떠 있는 화면… 지금 네가 보고 있는 화면이랑 똑같아.' },
  ],
  1: [
    { delay: 1.2, from: 'boss', text: '…방금 다른 카메라 봤지? 고개 각도가 달라졌어.' },
    { delay: 2.6, from: 'boss', text: '보고 있을 땐 안 움직여. 네가 눈을 돌릴 때만 움직이고 있어.' },
  ],
  2: [
    { delay: 1.2, from: 'system', text: '경고: 시선 감지 — 대상이 카메라를 인식했습니다' },
    { delay: 2.2, from: 'boss', text: '이쪽을 보고 있어. 나와, 당장 그 화면에서 나와!' },
  ],
  3: [
    { delay: 1.4, from: 'system', text: '경고: 대상 소실 — 최종 보고가 필요합니다' },
    { delay: 2.4, from: 'boss', text: '어디 갔어. 어디 갔냐고. …신입, 마지막 보고를 올려. 지금.' },
  ],
}

/** 마지막 보고 접수 후 엔딩 타이프라이터 */
export const TRUE_ENDING_LINES: string[] = [
  '보고가 접수되었습니다.',
  '유형: 실종자',
  '위치: CAM 07 — 관제실',
  '대상 조회 중…',
  '대상: {NAME} — 한빛빌라 야간 관제사',
  '실종 신고: 21일 전 접수',
  '판정: 이상 현상 아님',
  '사유: 해당 인원은 3주째 정상 근무 중입니다.',
  '…',
  '당신은 5일 동안 화면 속 건물을 감시한 것이 아니다.',
  '건물이 3주 동안, 화면 밖의 당신을 지켜보고 있었다.',
  '박 주임이 매일 밤 인사를 건넨 상대는 신입이 아니었다.',
  '관제실 의자에서 한 번도 일어나지 못한 채,',
  '매일 밤 자신의 실종을 「이상 없음」으로 보고해 온 것은 — 당신이다.',
  '금일 보고: 이상 없음.',
]

/** 엔딩 후 정적 속에서 한 줄 더 — 루프의 증거 */
export const POST_CREDIT_LINE = '[21일 전] 박 주임: 신입, 첫 출근 축하해. 관제팀 박 주임이야.'

export const BAD_ENDING_LINES: string[] = [
  '침식도 100% — 관제 시스템 응답 없음.',
  '모든 화면이 노이즈에 잠긴다.',
  '마지막 프레임.',
  '관제실 문 앞에, 무언가 서 있다.',
  '문손잡이가 천천히 돌아간다.',
  '당신은 재택근무라고 들었다.',
  '그런데 왜, 등 뒤에서 문소리가 나는가.',
]

export const CLEAR_STATS_LABEL = {
  resolved: '처리한 이상 현상',
  false: '오탐',
  erosion: '최종 침식도',
}

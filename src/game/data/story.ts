export interface Clue {
  id: string
  title: string
  text: string
}

export interface Hotspot {
  id: string
  x: number
  y: number
  label: string
  lines: string[]
  revisitLine?: string
  clue?: Clue
  isMirror?: boolean
}

export interface RoomData {
  id: string
  title: string
  subtitle: string
  top: number
  bottom: number
  accent: number
  radioIntro: string[]
  radioOutro: string[]
  hotspots: Hotspot[]
  exitLabel: string
}

export const GAME_TITLE = '잔상'
export const GAME_SUBTITLE = '그 방은, 아직도 그날 밤을 기억한다'

export const ROOMS: RoomData[] = [
  {
    id: 'living-room',
    title: '거실',
    subtitle: '1년 전, 이서연이 마지막으로 목격된 곳',
    top: 0x1a1014,
    bottom: 0x2c1620,
    accent: 0x8a1f2b,
    radioIntro: [
      '강형사: 지연아, 정말 혼자 갈 거야?',
      '강형사: …알았다. 무전은 계속 켜놔. 내가 계속 듣고 있을게.',
      '강형사: 거긴 서연 씨가 실종되기 전까지 살던 집이야. 이상한 게 있으면 바로 얘기해.',
    ],
    radioOutro: ['강형사: …다 확인했어? 좋아, 다음 방으로 가 봐.', '강형사: 조심하고.'],
    exitLabel: '복도로 나간다 →',
    hotspots: [
      {
        id: 'blanket',
        x: 22,
        y: 68,
        label: '소파 위 담요',
        lines: [
          '구겨진 담요를 걷어내자, 오래되어 검게 마른 얼룩이 드러난다.',
          '핏자국처럼 보이지만… 감식 보고서 어디에도 이런 흔적은 없었다.',
        ],
        revisitLine: '검게 마른 얼룩. 다시 봐도 소름이 돋는다.',
        clue: {
          id: 'blood-stain',
          title: '마른 얼룩',
          text: '소파 담요 밑에서 발견한 검게 마른 얼룩. 1년 전 감식 기록에는 존재하지 않는다.',
        },
      },
      {
        id: 'photo-frame',
        x: 74,
        y: 34,
        label: '벽에 걸린 사진',
        lines: [
          '가족사진 속, 서연의 얼굴만 날카로운 것으로 긁혀 지워져 있다.',
          '원한일까. 아니면… 누군가 스스로를 지우고 싶었던 걸까.',
        ],
        revisitLine: '긁혀 지워진 얼굴. 자꾸만 눈이 간다.',
        clue: {
          id: 'scratched-photo',
          title: '긁힌 사진',
          text: '사진 속 서연의 얼굴만 골라 긁어 지운 흔적. 손톱 자국처럼 보인다.',
        },
      },
      {
        id: 'diary1',
        x: 48,
        y: 80,
        label: '탁자 위 다이어리',
        lines: [
          '다이어리 첫 장이 펼쳐져 있다.',
          '『그 사람은 매일 밤 내 방문 앞에 선다. 문을 열어달라고 하지 않는다. 그냥, 서 있는다.』',
        ],
        revisitLine: '다이어리 첫 장. 글씨가 점점 떨리듯 흐트러진다.',
        clue: {
          id: 'diary-1',
          title: '일기장 · 첫 장',
          text: '"그 사람은 매일 밤 내 방문 앞에 선다. 문을 열어달라고 하지 않는다. 그냥, 서 있는다."',
        },
      },
    ],
  },
  {
    id: 'bedroom',
    title: '침실',
    subtitle: '서연이 마지막으로 목격된 방',
    top: 0x0d1220,
    bottom: 0x1b1030,
    accent: 0x3a2a6b,
    radioIntro: [
      '강형사: 거기가 서연 씨 방이야.',
      '강형사: 마지막으로 그 사람을 본 게 이 방이라는 진술이 있었어.',
      '강형사: …그 사람이 누군지는, 아직도 밝혀지지 않았지만.',
    ],
    radioOutro: ['강형사: …괜찮아? 목소리가 좀 이상해.', '강형사: 계속 갈 수 있겠어?'],
    exitLabel: '지하로 내려간다 →',
    hotspots: [
      {
        id: 'locket',
        x: 28,
        y: 58,
        label: '화장대 서랍',
        lines: [
          '서랍 안에서 낡은 로켓 목걸이를 발견했다.',
          '열어보니 사진이 두 장. 하나는 서연. 다른 하나는… 무언가로 긁혀 알아볼 수 없다.',
        ],
        revisitLine: '로켓 속 지워진 얼굴. 누구였을까.',
        clue: {
          id: 'locket',
          title: '로켓 목걸이',
          text: '서연의 사진과, 얼굴을 알아볼 수 없게 긁힌 또 다른 사진이 함께 들어 있다.',
        },
      },
      {
        id: 'diary2',
        x: 56,
        y: 42,
        label: '침대 밑 상자',
        lines: [
          '침대 밑에서 낡은 상자를 꺼냈다. 다이어리 두 번째 장이 들어 있다.',
          '『그 사람 목소리를 들으면 온몸이 굳는다. 다정해서 더 무섭다. 언젠가부터, 그 목소리가 내 목소리와 구분이 안 된다.』',
        ],
        revisitLine: '다이어리 두 번째 장. 다시 읽어도 등골이 서늘하다.',
        clue: {
          id: 'diary-2',
          title: '일기장 · 두 번째 장',
          text: '"그 사람 목소리를 들으면 온몸이 굳는다. 다정해서 더 무섭다. 언젠가부터, 그 목소리가 내 목소리와 구분이 안 된다."',
        },
      },
      {
        id: 'closet',
        x: 78,
        y: 56,
        label: '옷장',
        lines: [
          '옷장 안, 낯선 넥타이 하나가 걸려 있다.',
          '안쪽에 이니셜이 수놓아져 있다 — 『J.Y.』',
          '…익숙한 이니셜이다. 착각이겠지.',
        ],
        revisitLine: 'J.Y. 이니셜. 왜 자꾸 마음에 걸리는 걸까.',
        clue: {
          id: 'necktie',
          title: '이니셜 넥타이',
          text: "옷장 속 낯선 넥타이. 안감에 'J.Y.'라는 이니셜이 수놓아져 있다.",
        },
      },
    ],
  },
  {
    id: 'basement',
    title: '지하 서재',
    subtitle: '아무도 들어가지 않았던 마지막 방',
    top: 0x05070a,
    bottom: 0x140a0a,
    accent: 0x6b1414,
    radioIntro: [
      '강형사: 지연아... 거긴, 들어가지 않는 게—',
      '(지지직 —— 무전 잡음)',
      '강형사: ...연아. 내 말 들려?',
    ],
    radioOutro: ['강형사: …벽에 걸린 거울, 보여?', '강형사: 한번… 봐 봐.'],
    exitLabel: '',
    hotspots: [
      {
        id: 'diary3',
        x: 32,
        y: 62,
        label: '책상 위 다이어리',
        lines: [
          '다이어리의 마지막 장이 펼쳐져 있다.',
          '『나는 오늘 떠나기로 했다. 그 사람에게는 말하지 않을 것이다. 이 집을 나서면, 다시는 뒤돌아보지 않을 것이다.』',
        ],
        revisitLine: '마지막 장. 여기서 기록은 끝나 있다.',
        clue: {
          id: 'diary-3',
          title: '일기장 · 마지막 장',
          text: '"나는 오늘 떠나기로 했다. 그 사람에게는 말하지 않을 것이다. 이 집을 나서면, 다시는 뒤돌아보지 않을 것이다."',
        },
      },
      {
        id: 'photo2',
        x: 68,
        y: 44,
        label: '서랍 속 사진',
        lines: [
          '서랍 깊숙한 곳에서 사진 한 장을 발견했다.',
          '사진 속엔 누군가와 다정하게 웃고 있는 여자가 있다 — 그 얼굴은, 나다.',
          '뒷면에 적힌 날짜. 서연이 실종된 바로 그날이다.',
        ],
        revisitLine: '사진 속 얼굴이 자꾸 나를 닮아 보인다.',
        clue: {
          id: 'photo-2',
          title: '낯선 사진',
          text: '사진 속 여자의 얼굴은 나와 똑같다. 뒷면엔 서연이 실종된 날짜가 적혀 있다. 나는 이 집에 온 적이 없는데.',
        },
      },
      {
        id: 'mirror',
        x: 50,
        y: 26,
        label: '낡은 거울',
        lines: [],
        isMirror: true,
      },
    ],
  },
]

export const ENDING_LINES: string[] = [
  '거울 앞으로 손을 뻗는다.',
  '거울 속엔, 한지연이 없다.',
  '대신 — 사진 속에서 긁혀 지워졌던 그 얼굴이, 당신을 마주 본다.',
  '무전기 너머로 목소리가 속삭인다.',
  '"연아. 이제 그만 돌아와."',
  '그 목소리는, 처음부터 강형사가 아니었다.',
  '당신은 형사가 아니다.',
  '당신은 1년 전 이 방에서 사라진, 이서연이다.',
  '그리고 그 목소리의 주인은 — 사진 속에서, 언제나 당신 곁에 있었다.',
  '당신이 형사라고 믿었던 순간부터, 당신은 단 한 번도 이 집을 떠난 적이 없었다.',
  '잔상은, 반복된다.',
]

export const END_SCREEN_SUBTITLE = '그리고 오늘 밤도, 문 앞에 누군가 서 있다.'

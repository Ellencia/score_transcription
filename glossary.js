// =============================================================================
// AMT 마스터 용어집 — hover 카드 데이터 (00_마스터_용어집.md 기반)
// =============================================================================
// 구조: key / label / short / long / category / papers / aliases
// 자동 마킹: .auto-glossary 안에서 aliases의 *첫 등장*만 <dfn>으로 래핑
// =============================================================================

window.__SF_GLOSSARY = {

  "Automatic Music Transcription": {
    label: "자동 음악 채보 · Automatic Music Transcription (AMT)",
    short: "오디오 음원을 분석해 악보·MIDI·기타 탭 같은 기보 형태로 자동 변환하는 기술. '채보'의 영어 표현이 바로 AMT다.",
    long: "<p>마이크나 음원 파일로 들어온 소리를 분석해, 어떤 음이 언제 얼마나 울렸는지 알아내고 이를 악보·MIDI·기타 탭으로 바꾸는 기술. 사람이 귀로 듣고 악보로 받아 적는 '채보'를 컴퓨터가 하는 것이다. 피아노는 거의 해결됐지만 다중악기·기타·보컬은 여전히 어렵다.</p>",
    category: "§1 문제 정의",
    papers: "1,2,3,4,5,6,7,13",
    aliases: ["Automatic Music Transcription", "AMT", "자동 음악 채보", "음악 채보", "채보"]
  },

  "Onset": {
    label: "온셋 (음 시작) · Onset",
    short: "음이 시작되는 바로 그 순간. 피아노로 치면 건반을 누르는 타건 시점이다.",
    long: "<p>한 음이 울리기 시작하는 시점. 채보에서 가장 중요한 단서로, 대부분의 평가가 이 onset 시점이 정답과 ±50ms 안에 들어오는지로 채점한다. 타건처럼 명확한 onset일수록 검출이 쉽다.</p>",
    category: "§2 모델·아키텍처",
    papers: "1,2,3,4",
    aliases: ["Onset", "온셋", "음 시작"]
  },

  "Frame": {
    label: "프레임 · Frame",
    short: "오디오를 잘게 쪼갠 짧은 시간 조각(보통 10ms 안팎). 음이 '울리고 있는' 구간을 프레임 단위로 표시한다.",
    long: "<p>오디오를 10ms 정도의 작은 시간 칸으로 나눈 단위. onset이 '음의 시작점'이라면 frame은 '음이 지속되는 모든 순간'을 가리킨다. Onsets and Frames는 이 둘을 따로 검출해 결합한다.</p>",
    category: "§2 모델·아키텍처",
    papers: "1,3",
    aliases: ["Frame", "프레임"]
  },

  "Polyphonic": {
    label: "다성(폴리포닉) · Polyphonic",
    short: "여러 음이 동시에 울리는 상태. 화음이나 여러 악기가 겹치는 경우로, 단선율(monophonic)보다 훨씬 어렵다.",
    long: "<p>한 번에 여러 음이 동시에 울리는 음악. 화음을 치는 피아노나 여러 악기가 함께 연주하는 곡이 여기 해당한다. 주파수 성분이 겹쳐서 분리가 어렵기 때문에 채보 난이도가 급격히 올라간다.</p>",
    category: "§1 문제 정의",
    papers: "1,7,9",
    aliases: ["Polyphonic", "polyphony", "다성", "폴리포닉", "다성음악"]
  },

  "Pitch": {
    label: "음고(피치) · Pitch",
    short: "소리의 높낮이. 도·레·미처럼 음이 얼마나 높은지를 가리키며, 채보의 핵심 출력 중 하나다.",
    long: "<p>소리가 얼마나 높은가를 나타내는 값. 피아노는 88개 건반의 이산적(discrete) 음고를 갖지만, 기타 벤딩이나 보컬 비브라토는 음고가 연속적으로 변해서 채보가 어렵다.</p>",
    category: "§1 문제 정의",
    papers: "7,9,13",
    aliases: ["Pitch", "음고", "피치"]
  },

  "MIDI": {
    label: "MIDI",
    short: "음의 높이·세기·시작·길이를 숫자로 기록한 연주 데이터 포맷. 채보 모델의 1차 출력이지만 그 자체로는 '읽는 악보'가 아니다.",
    long: "<p>Musical Instrument Digital Interface. 어떤 음을 언제 얼마나 세게 얼마 동안 쳤는지를 숫자로 담는다. 단 올림표/내림표 구분(C#과 Db)이 없어서, 그대로는 사람이 보는 악보가 되지 못한다. 악보가 되려면 MusicXML로의 변환이 필요하다.</p>",
    category: "§6 도구·파이프라인",
    papers: "1,2,5,7",
    aliases: ["MIDI", "미디"]
  },

  "MusicXML": {
    label: "MusicXML",
    short: "악보 표기의 표준 교환 포맷. 올림/내림·박자표·조표·마디 등 '사람이 읽는 악보' 정보를 담는다.",
    long: "<p>악보를 컴퓨터끼리 주고받는 표준 포맷. MIDI가 '연주 데이터'라면 MusicXML은 '악보 그 자체'에 가깝다. MuseScore·Sibelius 같은 악보 프로그램이 모두 지원하며, 채보 파이프라인의 최종 출력 목표가 된다.</p>",
    category: "§6 도구·파이프라인",
    papers: "7,12",
    aliases: ["MusicXML", "뮤직XML"]
  },

  "F1": {
    label: "F1 점수 · F1 Score (Precision / Recall)",
    short: "정밀도(Precision)와 재현율(Recall)의 조화평균. 채보 성능을 한 숫자로 나타내며 1(=100%)에 가까울수록 좋다.",
    long: "<p>Precision(모델이 '있다'고 한 음 중 맞은 비율)과 Recall(실제 음 중 잡아낸 비율)을 균형 있게 합친 점수. 둘 중 하나만 높아도 F1은 낮아진다. 채보 논문의 표준 평가 지표.</p>",
    category: "§3 데이터·평가",
    papers: "1,2,3,4,5,6,10,11",
    aliases: ["F1", "F-measure", "F-score", "F1 점수", "Precision", "Recall", "정밀도", "재현율"]
  },

  "Onset F1": {
    label: "온셋 F1 · Note Onset F1",
    short: "추정한 음의 시작 시점이 정답 ±50ms 안에 들면 정답으로 치는 채점 방식. 가장 널리 쓰이는 음 단위 지표다.",
    long: "<p>음의 onset(시작점)이 정답으로부터 50ms 이내면 맞은 것으로 보고 계산한 F1. offset(끝)과 velocity(세기)는 무시한다. 피아노에서 96~97%, 클린 기타에서 87~90% 수준이며, 실제 혼합 음원에서는 더 낮다.</p>",
    category: "§3 데이터·평가",
    papers: "1,2,4,10,11",
    aliases: ["Onset F1", "note onset F1", "온셋 F1", "onset-only F1"]
  },

  "CQT": {
    label: "상수-Q 변환 · Constant-Q Transform (CQT)",
    short: "오디오를 음악의 음정 간격에 맞춰 주파수 분석하는 방법. 스펙트로그램의 음악 특화 버전이다.",
    long: "<p>주파수 축을 음악의 옥타브 구조(로그 간격)에 맞춰 나눈 시간-주파수 표현. 일반 스펙트로그램보다 음정 구조를 잡기 좋아 기타 채보(TabCNN/FretNet)의 표준 입력 특징으로 쓰인다.</p>",
    category: "§2 모델·아키텍처",
    papers: "8,9",
    aliases: ["CQT", "Constant-Q Transform", "상수-Q 변환"]
  },

  "Spectrogram": {
    label: "스펙트로그램 · Spectrogram",
    short: "시간에 따라 어떤 주파수 성분이 얼마나 강한지를 그림처럼 펼친 표현. 채보 모델의 기본 입력이다.",
    long: "<p>소리를 가로축 시간, 세로축 주파수로 펼쳐 색의 진하기로 세기를 나타낸 2차원 그림. 모델은 이 '소리 사진'을 보고 음을 읽어낸다. mel-spectrogram, log-spectrogram 등 변형이 많다.</p>",
    category: "§2 모델·아키텍처",
    papers: "1,3,4,5",
    aliases: ["Spectrogram", "스펙트로그램", "mel-spectrogram"]
  },

  "Transformer": {
    label: "트랜스포머 · Transformer",
    short: "어텐션(attention)으로 시퀀스 전체의 관계를 한꺼번에 보는 신경망 구조. 최신 채보·OMR의 공통 백본이다.",
    long: "<p>입력의 모든 위치가 서로를 참조하는 attention 메커니즘 기반 신경망. 번역·언어 모델에서 출발했으나, 채보(MT3·YourMT3+·hFT)와 악보 이미지 인식(OLiMPiC)이 모두 이 구조로 수렴했다.</p>",
    category: "§2 모델·아키텍처",
    papers: "3,4,5,6,12",
    aliases: ["Transformer", "트랜스포머", "attention", "어텐션"]
  },

  "seq2seq": {
    label: "시퀀스-투-시퀀스 · Sequence-to-Sequence",
    short: "입력 시퀀스를 출력 시퀀스로 '번역'하는 방식. 채보를 '스펙트로그램 → MIDI 토큰 번역' 문제로 재정의했다.",
    long: "<p>한 줄짜리 입력(스펙트로그램 프레임들)을 다른 줄짜리 출력(MIDI 이벤트 토큰들)으로 바꾸는 encoder-decoder 패러다임. 기계번역과 같은 틀로, Hawthorne 2021이 채보에 도입하고 MT3가 다중악기로 확장했다.</p>",
    category: "§2 모델·아키텍처",
    papers: "4,5,6",
    aliases: ["seq2seq", "sequence-to-sequence", "시퀀스-투-시퀀스", "encoder-decoder", "인코더-디코더"]
  },

  "T5": {
    label: "T5",
    short: "구글의 범용 encoder-decoder Transformer. MT3가 이 백본을 그대로 채보에 가져다 썼다.",
    long: "<p>Text-to-Text Transfer Transformer. 원래 자연어용 범용 모델인데, MT3는 음악 채보를 '텍스트 번역'처럼 다루기 위해 이 T5(약 6천만 파라미터)를 백본으로 채택했다.</p>",
    category: "§2 모델·아키텍처",
    papers: "5",
    aliases: ["T5"]
  },

  "Mixture-of-Experts": {
    label: "전문가 혼합 · Mixture-of-Experts (MoE)",
    short: "여러 '전문가' 하위망 중 입력에 맞는 것만 골라 쓰는 구조. YourMT3+가 성능을 끌어올리는 데 사용했다.",
    long: "<p>입력마다 적합한 일부 전문가(expert) 하위 네트워크만 활성화해 계산 효율과 성능을 동시에 노리는 기법. YourMT3+가 다중악기 채보 정확도를 높이기 위해 도입했다.</p>",
    category: "§2 모델·아키텍처",
    papers: "6",
    aliases: ["Mixture-of-Experts", "MoE", "전문가 혼합"]
  },

  "Source Separation": {
    label: "음원 분리 · Source Separation",
    short: "섞인 음원을 보컬·드럼·베이스 등 악기별로 갈라내는 기술. 다중악기 채보의 전처리로 쓰인다.",
    long: "<p>하나로 믹스된 곡을 악기별 트랙(stem)으로 분리하는 기술. 단일 악기에 강한 채보 모델 앞단에 붙여, 악기별로 나눈 뒤 각각 채보하면 다중악기 문제를 완화할 수 있다.</p>",
    category: "§6 도구·파이프라인",
    papers: "6,13",
    aliases: ["Source Separation", "음원 분리", "stem separation", "스템 분리", "stem", "스템"]
  },

  "Demucs": {
    label: "Demucs",
    short: "Meta가 만든 음원 분리 SOTA 도구. 보컬/드럼/베이스 등 4~6개 stem으로 분리한다.",
    long: "<p>현재 오픈소스 음원 분리 최강 도구. htdemucs는 vocals/drums/bass/other 4분리, 6-stem 버전은 guitar/piano까지 나눈다. 채보 파이프라인의 표준 전처리로 자주 쓰인다.</p>",
    category: "§6 도구·파이프라인",
    papers: "",
    aliases: ["Demucs", "데뮥스"]
  },

  "Tablature": {
    label: "타블러처(기타 탭) · Tablature (TAB)",
    short: "어느 현의 몇 번째 프렛을 누르는지로 표기하는 기타 악보. '무엇을' 넘어 '어떻게 치는가'를 담는다.",
    long: "<p>오선보가 '무슨 음'인지를 적는다면, 타브는 '몇 번 현의 몇 번 프렛'인지를 적는다. 같은 음을 여러 위치에서 칠 수 있어, 음을 맞춰도 어디서 쳤는지(프렛/현 할당)를 추가로 풀어야 한다.</p>",
    category: "§4 기타 TAB",
    papers: "8,9,10,11",
    aliases: ["Tablature", "타블러처", "기타 탭", "TAB", "탭"]
  },

  "Fret/String assignment": {
    label: "프렛/현 할당 · Fret/String Assignment",
    short: "같은 음을 칠 수 있는 여러 (현,프렛) 위치 중 실제로 어디서 쳤는지 정하는 문제. TAB 고유의 난제다.",
    long: "<p>기타에서 한 음높이는 보통 2~4개의 서로 다른 (현,프렛) 조합으로 연주 가능하다. 오디오만으로는 거의 구분이 안 돼, 운지 난이도 비용을 최소화하는 경로 탐색(HMM/Viterbi, 그래프 최단경로) 등으로 푼다.</p>",
    category: "§4 기타 TAB",
    papers: "8,9,10",
    aliases: ["Fret/String assignment", "프렛/현 할당", "프렛 할당", "fret assignment", "string assignment"]
  },

  "TDR": {
    label: "타브 판별율 · Tablature Disambiguation Rate (TDR)",
    short: "정확히 맞춘 음들 중, 현/프렛 위치까지 맞춘 비율. 프렛/현 할당 성능을 직접 재는 지표다.",
    long: "<p>음높이는 맞췄다고 할 때, 그 음을 친 현/프렛까지 올바르게 골랐는지를 재는 비율. tablature F는 항상 multipitch F보다 낮아, '음은 맞춰도 위치에서 점수를 잃는' TAB의 특성을 보여준다.</p>",
    category: "§4 기타 TAB",
    papers: "8",
    aliases: ["TDR", "Tablature Disambiguation Rate", "타브 판별율"]
  },

  "GuitarSet": {
    label: "GuitarSet",
    short: "기타 채보의 표준 벤치마크 데이터셋. 헥사포닉 픽업으로 현별 정답을 따로 녹음했다.",
    long: "<p>360개 발췌(각 ~30초), 6명 연주자. 현마다 따로 수음하는 hexaphonic pickup으로 현/프렛 정답 라벨을 정확히 확보했다. 단 클린 어쿠스틱 단일 기타라 실제 혼합 음원과는 괴리가 있다.</p>",
    category: "§3 데이터·평가",
    papers: "8,9,10,11",
    aliases: ["GuitarSet", "기타셋"]
  },

  "MAESTRO": {
    label: "MAESTRO",
    short: "약 200시간의 클래식 피아노 오디오-MIDI 정밀 정렬 데이터셋. 피아노 채보의 표준 벤치마크다.",
    long: "<p>약 198.7시간, 1,276개 연주. Disklavier(MIDI 캡처 피아노)로 오디오와 MIDI를 약 3ms 정밀도로 정렬했다. 이 풍부한 고품질 데이터 덕분에 피아노 채보가 거의 해결될 수 있었다.</p>",
    category: "§3 데이터·평가",
    papers: "1,2,3,4,5",
    aliases: ["MAESTRO", "마에스트로"]
  },

  "DadaGP": {
    label: "DadaGP",
    short: "2.6만 곡 규모의 기타 탭(Guitar Pro) 데이터셋. 단 심볼릭 탭만 있고 오디오가 없다.",
    long: "<p>26,181곡의 Guitar Pro 파일을 토큰으로 인코딩한 대규모 데이터셋. 문제는 오디오가 없다는 점 — 그래서 SynthTab은 이 탭들을 합성 오디오로 만들어 페어 데이터 부족을 우회한다.</p>",
    category: "§3 데이터·평가",
    papers: "11",
    aliases: ["DadaGP"]
  },

  "OMR": {
    label: "광학 악보 인식 · Optical Music Recognition (OMR)",
    short: "악보 이미지/PDF를 편집 가능한 디지털 악보로 바꾸는 기술. 오디오가 아니라 '그림'이 입력이다.",
    long: "<p>인쇄·스캔된 악보 이미지를 읽어 MusicXML/MIDI로 바꾸는 기술. 텍스트 OCR보다 어렵다 — 2차원 배치가 의미를 결정하고, 조표 하나만 틀려도 여러 음이 연쇄적으로 틀어진다(cascading error).</p>",
    category: "§5 OMR",
    papers: "12",
    aliases: ["OMR", "Optical Music Recognition", "광학 악보 인식", "악보 이미지 인식"]
  },

  "LMX": {
    label: "선형화 MusicXML · Linearized MusicXML (LMX)",
    short: "MusicXML을 한 줄 토큰 시퀀스로 펼친 포맷. end-to-end OMR 모델의 학습 출력으로 쓰인다.",
    long: "<p>2차원 구조의 MusicXML을 seq2seq 모델이 출력하기 좋게 한 줄로 펼친 표현. OLiMPiC(ICDAR 2024)이 제안했으며, 함께 나온 TEDn(tree-edit-distance) 지표로 악보 구조 정확도를 평가한다.</p>",
    category: "§5 OMR",
    papers: "12",
    aliases: ["LMX", "Linearized MusicXML", "선형화 MusicXML", "TEDn"]
  },

  "Quantization": {
    label: "리듬 양자화 · Rhythm Quantization",
    short: "들쭉날쭉한 연주 타이밍을 정확한 박/음표 길이에 맞춰 정돈하는 단계. 악보 가독성의 핵심 병목이다.",
    long: "<p>채보된 MIDI의 불규칙한 시간을 '4분음표·8분음표' 같은 정확한 박자 격자에 스냅하는 후처리. 음정 검출이 끝나도 이 양자화가 어긋나면 사람이 읽을 수 없는 악보가 된다. 모든 도구의 약점.</p>",
    category: "§6 도구·파이프라인",
    papers: "",
    aliases: ["Quantization", "리듬 양자화", "양자화", "rhythm quantization"]
  },

  "Velocity": {
    label: "벨로시티(세기) · Velocity",
    short: "음을 얼마나 세게 쳤는지를 나타내는 값. 표현력 있는 채보를 위해 함께 추정한다.",
    long: "<p>건반을 누르는 세기, 즉 음의 강약(다이내믹). ByteDance High-Res 모델은 onset/offset과 함께 velocity까지 회귀해 더 표현력 있는 MIDI를 만든다.</p>",
    category: "§3 데이터·평가",
    papers: "1,2",
    aliases: ["Velocity", "벨로시티", "세기"]
  },

  "Pedal": {
    label: "서스테인 페달 · Sustain Pedal",
    short: "피아노에서 음을 길게 끄는 페달. 그 작동 여부까지 채보하는 것이 ByteDance 모델의 차별점이었다.",
    long: "<p>밟으면 음이 길게 이어지는 피아노 페달. 소리에 미묘하게 작용해 채보가 까다로운데, Kong 2021이 페달 onset F1 91.86%로 처음 벤치마크를 세웠다.</p>",
    category: "§3 데이터·평가",
    papers: "2",
    aliases: ["Pedal", "서스테인 페달", "페달", "sustain pedal"]
  },

  "Self-supervised": {
    label: "자기지도학습 · Self-Supervised Learning",
    short: "라벨 없는 대량의 오디오로 미리 학습하는 방식. 채보용 라벨 데이터 부족을 보완한다.",
    long: "<p>사람이 단 정답 라벨 없이, 데이터 자체에서 학습 신호를 만들어 사전학습하는 방법. 채보는 정답 라벨이 비싸고 희소해서, MusicFM 같은 self-supervised foundation model이 대안으로 주목받는다.</p>",
    category: "§2 모델·아키텍처",
    papers: "",
    aliases: ["Self-supervised", "자기지도학습", "self-supervised learning", "foundation model"]
  },

  "Domain Adaptation": {
    label: "도메인 적응 · Domain Adaptation",
    short: "한 영역(피아노)에서 학습한 모델을 다른 영역(기타)에 맞춰 옮기는 기법. 기타 데이터 부족을 우회한다.",
    long: "<p>데이터가 풍부한 영역에서 학습한 모델을 데이터가 부족한 영역으로 이식·미세조정하는 방법. Riley 2024는 ByteDance 피아노 모델을 기타로 도메인 적응해 GuitarSet F1 87~90%를 달성했다.</p>",
    category: "§4 기타 TAB",
    papers: "10,11",
    aliases: ["Domain Adaptation", "도메인 적응", "domain adaptation"]
  },

  "basic-pitch": {
    label: "Basic Pitch",
    short: "Spotify가 공개한 경량 오픈소스 채보 모델. 악기 무관 polyphonic 변환을 CPU에서도 빠르게 한다.",
    long: "<p>약 17K 파라미터의 작은 CNN. 악기를 가리지 않고(instrument-agnostic) 여러 음을 동시에 MIDI로 변환하며 pitch bend도 잡는다. 무료 오픈소스로 풀려 NeuralNote 등 여러 도구의 표준 엔진이 됐다.</p>",
    category: "§6 도구·파이프라인",
    papers: "7",
    aliases: ["basic-pitch", "Basic Pitch", "베이직 피치"]
  },

  "Multipitch Estimation": {
    label: "다중음 추정 · Multipitch Estimation",
    short: "동시에 울리는 여러 음의 높이를 한꺼번에 추정하는 과제. polyphonic 채보의 핵심 하위 문제다.",
    long: "<p>한 순간에 울리는 모든 음높이를 동시에 알아내는 일. 음 단위(note-level) 채보의 전 단계로, Basic Pitch는 multipitch와 note onset을 함께 출력한다.</p>",
    category: "§1 문제 정의",
    papers: "7",
    aliases: ["Multipitch Estimation", "다중음 추정", "multipitch", "multi-pitch"]
  },

  "MIR": {
    label: "음악 정보 검색 · Music Information Retrieval (MIR)",
    short: "음악에서 멜로디·코드·박자·음색 등 정보를 컴퓨터로 추출·분석하는 연구 분야. 채보는 그 핵심 하위 과제다.",
    long: "<p>오디오·악보에서 음악적 정보를 자동으로 뽑아내는 학문 분야. 채보(AMT), 음원 분리, 코드 인식, 비트 추적 등이 모두 MIR에 속하며, ISMIR이 대표 학회다.</p>",
    category: "§1 문제 정의",
    papers: "",
    aliases: ["MIR", "Music Information Retrieval", "음악 정보 검색"]
  }

};

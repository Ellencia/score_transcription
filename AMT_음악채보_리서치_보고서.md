# 자동 음악 채보(Automatic Music Transcription, AMT) 리서치 보고서

> 작성일: 2026-06-20 · 대상: 음악 채보 프로젝트 기획/구현
> 범위: 모든 악기·장르 전반(폴리포닉 다중 악기, 피아노, 보컬/멜로디, 기타)
> 구성: ① 학술/기술 ② 시장 현황/규모 ③ 우세 기업/제품 전략 ④ 기술 구현 가이드

---

## 0. 핵심 요약 (먼저 읽기)

**AMT(Automatic Music Transcription)** = 오디오 음원을 분석해 악보(MIDI, MusicXML, 악보 이미지)로 자동 변환하는 기술. "채보"의 영어 표현이 AMT임.

이번 리서치에서 가장 중요한 결론 5가지:

1. **피아노 채보는 거의 해결됨(near-solved).** 음정이 이산적(88건반 고정)이고 정밀 라벨 데이터(MAESTRO ~200시간)가 풍부해서, note onset F1이 96~97%대까지 올라옴. 반면 **다중 악기·기타·보컬은 여전히 어려운 미해결 영역**.

2. **연구 트렌드는 "전용 모델 → 범용 Transformer"로 수렴 중.** Google의 MT3(2022)가 여러 악기를 하나의 seq2seq Transformer로 동시 채보하는 패러다임을 열었고, 이후 YourMT3+·자기지도학습 foundation model로 확장되고 있음.

3. **AMT 전용 시장 규모 수치는 존재하지 않음.** 가장 가까운 대리 시장은 악보 표기(notation) SW 시장(~CAGR 9~10%, 단 출처별 규모 편차 5배). AMT는 독립 시장이 아니라 스트리밍·음악교육·DAW 시장에 **기능으로 편입**되어 성장하는 구조.

4. **빅테크(Spotify·Google·ByteDance)는 채보를 직접 돈 받고 팔지 않음.** 오픈소스로 풀어 연구 평판·데이터·생태계 영향력을 확보. 그 무료 엔진(특히 Spotify basic-pitch)이 상용 제품의 기반 부품이 됨.

5. **구현 진입점은 명확함.** 초보자는 `basic-pitch`(오디오→MIDI) + `music21`(MIDI→악보) + MuseScore(렌더) 3단 조합으로 시작하면 됨. 가장 어려운 병목은 일관되게 **리듬 양자화(rhythm quantization)** 와 **악보 포맷팅**.

---

# 1. 학술/기술 (Academic & Technical)

## 1.1 기념비적(Landmark) 딥러닝 AMT 논문

채보 기술의 발전사를 논문 단위로 보면 다음 흐름임: **이중 검출(Onsets and Frames) → 회귀 기반 고해상도(ByteDance) → seq2seq Transformer(MT3 계열) → 자기지도 foundation model**.

### Onsets and Frames (Hawthorne et al., Google Magenta, 2018, ISMIR)
- **접근**: 신경망을 두 갈래(dual-objective)로 나눔 — 하나는 **onset(음의 시작 순간)** 만 검출, 다른 하나는 **음이 울리는 모든 프레임(frame)** 을 검출. onset 예측으로 frame 예측을 제어해서, 새 음을 만들려면 두 갈래가 합의하도록 설계 → 거짓 검출(false positive)을 크게 줄임.
- **의미**: 이후 모든 피아노 채보 연구의 기준(baseline). MAPS 데이터셋에서 note onset F1 **약 94.7%**.
- 출처: https://archives.ismir.net/ismir2018/paper/000019.pdf , https://arxiv.org/pdf/1710.11153

### High-Resolution Piano Transcription (Kong et al., ByteDance, 2021, IEEE TASLP)
- **접근**: 프레임을 "음이 있다/없다"로 분류하는 대신, **onset/offset 시점 자체를 연속값으로 회귀(regression)**. velocity(세기)와 **서스테인 페달**까지 함께 검출.
- **의미**: MAESTRO에서 onset F1 **약 96.7%** 로 Onsets and Frames를 능가. 현재까지 피아노 채보의 강력한 표준. 오픈소스(`bytedance/piano_transcription`)로 공개되어 실무에서 가장 많이 인용되는 피아노 엔진.
- 출처: https://arxiv.org/pdf/2010.01815

### Sequence-to-Sequence Piano Transcription with Transformers (Hawthorne et al., Google, 2021, ISMIR)
- **접근**: 채보 전용 아키텍처를 버리고 **범용 encoder-decoder Transformer** 로 스펙트로그램을 MIDI-like 이벤트 토큰 시퀀스로 "번역(translate)". 채보를 기계번역과 같은 seq2seq 문제로 재정의.
- **의미**: 복잡한 후처리 없이 표준 Transformer만으로 전용 모델급 성능 입증 → MT3·YourMT3의 토대.
- 출처: https://archives.ismir.net/ismir2021/paper/000030.pdf

### MT3: Multi-Task Multitrack Music Transcription (Gardner et al., Google, 2022, ICLR)
- **접근**: 위 seq2seq를 **다중 악기(multi-instrument)** 로 확장. T5 백본(소형, 약 6,000만~7,700만 파라미터)으로 여러 데이터셋(MAESTRO·Slakh2100·MusicNet·GuitarSet·URMP 등)을 단일 토큰 어휘로 통합 학습.
- **의미**: 단일 범용 Transformer가 임의의 악기 조합을 트랙별로 동시 채보 가능함을 입증. 특히 **데이터가 적은 악기(기타 등)의 성능을 크게 향상**시키면서 피아노 성능은 유지. 다중 악기 AMT의 사실상 표준 baseline.
- 출처: https://arxiv.org/abs/2111.03017 , https://github.com/magenta/mt3

### Basic Pitch (Bittner et al., Spotify, 2022, ICASSP)
- **접근**: 매우 작은 CNN(약 17K 파라미터). **instrument-agnostic(악기 무관)**, polyphonic, pitch bend 검출 포함. audio→MIDI.
- **의미**: 소형·고속이라 CPU에서도 실용적. 오픈소스 audio-to-MIDI 변환을 대중화시켜 사실상 업계 표준 무료 엔진이 됨.
- 출처: https://engineering.atspotify.com/2022/06/meet-basic-pitch , https://github.com/spotify/basic-pitch

### hFT-Transformer (Toyama et al., Sony AI, 2023, ISMIR)
- **접근**: 2단계 **계층적 주파수-시간 Transformer(hierarchical frequency-time)**. 시간축과 주파수축 양쪽에 Transformer attention을 적용해 장기 의존성을 포착.
- **의미**: 피아노 채보에서 SOTA급 성능(96~97%대). 시간·주파수 양축 attention 결합의 대표 사례.
- 출처: https://archives.ismir.net/ismir2023/paper/000024.pdf , https://github.com/sony/hFT-Transformer

## 1.2 핵심 데이터셋(Datasets)

| 데이터셋 | 규모 | 내용 | 용도 |
|---|---|---|---|
| **MAESTRO** (v3) | 약 198.7시간, 1,276개 연주 | 클래식 **피아노** 독주. Disklavier(MIDI 캡처 피아노)로 오디오-MIDI **약 3ms 정밀 정렬** | 피아노 채보 표준 벤치마크 |
| **Slakh2100** | 약 145시간, 34개 악기 카테고리 | **합성(synthetic)** 다중 악기 + 정렬된 MIDI | 다중 악기 채보 / 음원 분리 |
| **GuitarSet** | 라이브 기타 연주 | **hexaphonic pickup**(현별 개별 수음)으로 현별 MIDI 라벨 | 기타 채보, 현/프렛 추정 |
| **MusicNet** | 자유 라이선스 클래식 녹음 | 다양한 악기 실연주 + 전문가 라벨 | 다중 악기(관현악) 채보 |
| **URMP** | 44곡 클래식 | 앙상블 편성, multi-stem 오디오 + 10ms 라벨 | 다중 악기 채보 / 분리 |
| **MAPS** | 클래식 피아노 | 합성 + 실제 녹음 | (구) 피아노 벤치마크 |

출처: https://magenta.withgoogle.com/datasets/maestro , https://arxiv.org/abs/1810.12247 , https://arxiv.org/pdf/2111.03017

## 1.3 SOTA 성능 지표 및 평가 메트릭

채보 성능은 주로 **F1 점수**로 측정함. 용어 설명:

- **Precision(정밀도)** = 모델이 "있다"고 한 음 중 실제로 맞은 비율.
- **Recall(재현율)** = 실제 음 중 모델이 잡아낸 비율.
- **F1** = 정밀도와 재현율의 조화평균(둘의 균형 점수). 1(=100%)에 가까울수록 좋음.
- **Note Onset F1**: 추정한 음의 **시작 시점이 정답 ±50ms 이내**면 맞은 것으로 채점. 가장 널리 쓰임.
- **Frame-level F1**: 10ms 단위 시간 프레임마다 음의 유무를 채점(음의 지속 구간 정확도).

핵심 수치(MAESTRO 피아노, note onset F1):

| 모델 | onset F1 | 비고 |
|---|---|---|
| Onsets and Frames (2018) | 약 94.7~94.8% | 최초 SOTA |
| High-Resolution / ByteDance (2021) | 약 96.7% | 페달까지 채보 |
| hFT-Transformer (2023) | 96~97%대 | time-freq Transformer |

> **결론**: 피아노 단일 악기 onset 채보는 거의 성숙(near-solved). 연구 프런티어는 다중 악기·기타·보컬로 이동.

출처: https://mir-eval.readthedocs.io/latest/api/transcription.html , https://arxiv.org/pdf/2010.01815

## 1.4 현재 연구 트렌드 (2024–2025)

1. **seq2seq Transformer 확장이 주류** — MT3를 잇는 **YourMT3+ (2024, MLSP)** 가 전 데이터셋에서 MT3를 능가. 보컬을 분리 전처리 없이 직접 채보하는 multi-channel decoding 도입.
2. **자기지도학습(self-supervised) foundation model** — MusicFM 등이 대량 비라벨 오디오로 사전학습해 라벨 부족 문제 보완. Aria-MIDI 같은 대규모 데이터셋 등장.
3. **보컬/멜로디 채보** — wav2vec 2.0 등 음성 도메인 인코더를 음악에 이식.
4. **효율성/실시간** — pruning·quantization으로 실시간 채보 목표.

출처: https://arxiv.org/abs/2407.04822 , https://arxiv.org/pdf/2506.23869

## 1.5 왜 피아노는 쉽고 기타·보컬은 어려운가 (난제 분석)

| 악기 | 난이도 | 이유 |
|---|---|---|
| **피아노** | 쉬움 | 이산적 음고(88건반, bend 없음) → 분류 문제. 3ms 정밀 라벨 데이터 풍부. 명확한 타건 onset |
| **다중 악기** | 매우 어려움 | **중첩 harmonics**(여러 음원 주파수 성분이 겹쳐 분리 불가). 악기 1→3개로 늘면 F1 급락 |
| **기타** | 어려움 | bending/sliding으로 **연속적 음고**. 같은 음을 여러 현/프렛으로 연주 가능(매핑 모호) |
| **보컬** | 어려움 | vibrato·glissando 등 풍부한 연속 음고 → MIDI 변환 시 정보 손실. 라벨 데이터 부족 |

출처: https://engineering.atspotify.com/2022/06/meet-basic-pitch , https://arxiv.org/html/2408.08653v1

---

# 2. 시장 현황/규모 (Market)

## 2.1 가장 중요한 주의사항

리서치 결과 **"AI in music market" 수치가 출처마다 10배 가까이 차이**가 남. 각 리포트가 측정하는 대상이 다르기 때문임:

- **Grand View Research**의 "Generative AI in Music"(생성형 작곡 SW 한정) → 2024년 약 **5.7억 달러**
- **Market.us**의 "AI in Music"(AI 음악 산업 전체: 스트리밍 추천·마스터링·작곡·분리 포함) → 2024년 약 **52억 달러**

즉 약 **9배 차이**. 그리고 **AMT(채보)는 어느 리포트에서도 독립 세그먼트로 측정되지 않음**. 아래 수치는 AMT의 인접/대리(proxy) 시장으로 해석해야 함.

## 2.2 핵심 시장 규모 (구분 필수)

### AI in Music / Generative AI Music

| 출처 | 시장 정의 | 2024 규모 | 전망 | CAGR | 신뢰도 |
|---|---|---|---|---|---|
| Grand View Research | 생성형 작곡 SW 중심 | USD 569.7M | 2030: 2,794.7M | 30.5% | 중상 |
| Market.us | AI 음악 산업 광의 | USD 5.20B | 2034: 60.44B | 27.8% | 중 |

### Music Notation / Sheet Music Software (AMT의 가장 가까운 인접 시장)

| 출처 | 기준 규모 | 전망 | CAGR | 신뢰도 |
|---|---|---|---|---|
| Verified Market Research | 2023: USD 2.74B | 2031: 5.42B | 8.90% | 중 |
| Verified Market Reports | 2024: USD 500M | 2033: 1.2B | 10.5% | 저 |
| Cognitive Market Research | 2025: USD 1.2B | 2034: 2.5B | 9.2% | 저 |

> 절대 규모는 5억~27억 달러로 **5배 이상 산포**하나, CAGR은 **약 9~10%로 수렴**. AMT 자체 규모는 이 인접치로 간접 추정만 가능.

출처: https://www.grandviewresearch.com/industry-analysis/generative-ai-in-music-market-report , https://market.us/report/ai-in-music-market/ , https://www.verifiedmarketresearch.com/product/music-notation-software-market/

## 2.3 인접 시장 (AMT가 기능으로 편입되는 상위 풀)

| 시장 | 규모(2025경) | CAGR | 신뢰도 | 출처 |
|---|---|---|---|---|
| 음악 스트리밍 | USD 54.1B | 14.2% | 상 | Grand View Research |
| 온라인 음악 교육 | USD 3.9B | 15.2% | 중상 | Mordor Intelligence |
| 음악 제작 SW(DAW) | USD 4.4B | 9~9.4% | 중 | Global Growth Insights 등 |

스트리밍·교육·DAW 리포트들이 stem separation·chord generation·AI mastering을 명시적 성장동력으로 거론 → **AMT 기술이 이들 시장에 통합 기능으로 흡수되는 추세**.

출처: https://www.grandviewresearch.com/industry-analysis/music-streaming-market , https://www.mordorintelligence.com/industry-reports/online-music-education-market

## 2.4 AMT 수요를 견인하는 응용 세그먼트

1. **음악 교육 / 악기 학습** — 오디오를 악보로 변환해 학습자에게 제공. AMT의 가장 직접적인 B2C 수요처.
2. **콘텐츠 제작 / 스트리밍 (stem 분리 & 노래방)** — 보컬/악기 분리 후 가사·멜로디 채보로 노래방 서비스 구성.
3. **작곡 / 송라이팅 도구** — MIDI/악보 출력으로 작곡 워크플로우 연결.
4. **MIR(Music Information Retrieval)** — 멜로디·음색·리듬 분석. AMT는 MIR의 핵심 하위 과제.

## 2.5 주요 펀딩 (인접 맥락 — 대부분 생성형 음악)

| 기업 | 최신 라운드 | 밸류에이션 | 비고 |
|---|---|---|---|
| Suno | Series D (2026.06) | **USD 5.4B** | 생성형 작곡 (채보 아님) |
| Udio | Series A (2024) | ~USD 200M+ | 생성형 작곡 |
| **Music AI (Moises)** | Series A $40M (2025) | 비공개 | **채보 인접성 가장 높음**, 5천만+ 사용자 |
| LANDR | Series B $26M | 비공개 | AI 마스터링 |

> 펀딩 핫스팟은 생성형 음악(Suno/Udio)이며, **채보에 가장 가까운 자금력 있는 기업은 Moises/Music.AI**.

출처: https://variety.com/2026/digital/news/ai-music-suno-funding-round-400-million-5-4-billion-valuation-1236765727/ , https://www.musicbusinessworldwide.com/music-ai-raises-40m-in-series-a-round-as-its-moises-platform-hits-50m-users/

---

# 3. 우세 기업/제품 전략 (Competitive Landscape)

시장은 **4개 전략 세그먼트**로 갈라져 있고 각 세그먼트의 승자가 다름.

## 3.1 플레이어별 분석

### AnthemScore (Lunaverus) — 데스크톱 일회성 라이선스의 정석
- 오디오→악보 변환 데스크톱 SW(Win/Mac/Linux), CNN 기반.
- **구독 없는 일회성 구매**: Lite $29 / Professional $44 / Studio(배치 처리). PDF·MIDI·MusicXML export.
- 전략: "한 번 사면 영원히" 메시지로 구독 피로 사용자 정조준. 개인 데스크톱 채보 시장 대표주자.
- 출처: https://www.lunaverus.com/transcribe/pricing

### Klangio — 모바일 + API 하이브리드
- 악기별 앱군(Piano2Notes·Guitar2Tabs·Melody Scanner). 오디오→MIDI/MusicXML/PDF/GP5.
- **구독 + 티켓 소비 모델**. 별도 B2B "AI Music Analysis API"로 채보·스템분리·코드/비트 검출 제공.
- 전략: AMT를 악기별 소비자 앱으로 쪼개 앱스토어 장악 + 동일 엔진 API로 B2B 양면 판매.
- 출처: https://klang.io/piano2notes/ , https://klang.io/api/

### Moises / Music.AI — 자금력·규모·B2B 전환의 선두
- 스템 분리 + 코드 검출 + 채보 + 피치/템포 변경. B2C 앱 + B2B API/SDK.
- B2C **7천만+ 사용자**, 2024 Apple iPad 올해의 앱. **Series A $40M(2025)**, 일 250만+ 분 처리.
- 가격(B2C): Free / Premium ~$3.99 / Pro ~$5.99~9.99 / Master ~$11.99~24.99 (지역·주기별 편차).
- 전략: "Music.AI" B2B 브랜드로 재편 — 소비자 앱은 데이터·검증 채널, 수익 엔진은 **"윤리적 AI 오디오" B2B API/SDK**. **API/B2B 세그먼트 현재 선두**.
- 출처: https://moises.ai/ , https://www.musicbusinessworldwide.com/music-ai-raises-40m-in-series-a-round-as-its-moises-platform-hits-50m-users/

### Spotify basic-pitch — 오픈소스/무료/생태계 전략
- 경량 신경망 audio→MIDI(폴리포닉, 피치벤드). **완전 무료 오픈소스(Apache 2.0)**.
- Spotify가 공개한 이유: 직접 수익화가 아니라 **연구 평판 + 생태계 영향력**. 무료 엔진이 서드파티(NeuralNote 등)의 표준 부품이 됨.
- 출처: https://engineering.atspotify.com/2022/06/meet-basic-pitch , https://github.com/spotify/basic-pitch

### Google Magenta / MT3 — 연구/오픈소스 SOTA
- T5 기반 범용 Transformer로 멀티트랙 동시 채보. 사전학습 모델 공개.
- 전략: 제품화가 아닌 **순수 연구·오픈소스 리더십**. 음악 AI 학술 레퍼런스 선점.
- 출처: https://github.com/magenta/mt3

### ByteDance 고해상도 피아노 채보 — 연구/벤치마크
- onset/offset을 회귀로 정밀 채보(페달 포함). Onsets and Frames 능가.
- 파생 자산: 대규모 피아노 MIDI 데이터셋 **GiantMIDI-Piano** 구축.
- 전략: 연구·오픈소스 기여로 기술 신뢰성·데이터 자산 확보(빅테크 패턴). 피아노 단일 도메인 최다 인용 오픈 엔진.
- 출처: https://github.com/bytedance/piano_transcription

### 인접/틈새 플레이어
- **ScoreCloud**: 노래(허밍)·연주→악보. 무료 + 구독(Plus $4.99 / Songwriter $10.99 / Pro $19.99).
- **Neuratron AudioScore**: 프로 데스크톱(일회성 ~$249~369), Sibelius 번들.
- **Transcribe!**: 음원 슬로다운+코드분석 보조 도구, 일회성 ~$50.
- **Samplab / NeuralNote**: DAW 플러그인(NeuralNote는 무료 오픈소스, basic-pitch 엔진 내장).
- **Soundslice**: 채보가 아니라 "악보-음원 실시간 싱크" 학습 플랫폼.
- 출처: https://scorecloud.com/studio/ , https://github.com/DamRsn/NeuralNote , https://www.soundslice.com/plans/

## 3.2 4개 세그먼트와 각 승자

| 세그먼트 | 과금 방식 | 대표 플레이어 | 현재 승자 |
|---|---|---|---|
| **데스크톱 SW** | 일회성 영구 라이선스 | AnthemScore, AudioScore, Transcribe! | **AnthemScore** (개인 시장) |
| **모바일 앱** | 구독 | Klangio, Moises, ScoreCloud | **Moises** (7천만 사용자) |
| **API / B2B** | 사용량/SDK | Music.AI, Klangio API | **Music.AI** (자본·규모) |
| **오픈소스** | 무료 | basic-pitch, MT3, ByteDance, NeuralNote | **Spotify basic-pitch** (표준 엔진) |

## 3.3 핵심 전략 통찰

1. **빅테크는 채보를 직접 수익화하지 않음.** 오픈소스로 연구 평판·데이터·생태계 영향력 확보. 그 무료 엔진이 상용 제품 기반 부품이 됨(basic-pitch → NeuralNote가 증거).
2. **상용 진영의 수익 축이 B2C 앱 → B2B API로 이동 중.** Moises의 "Music.AI" 리브랜딩이 가장 분명한 신호.
3. **데스크톱 일회성 모델은 축소되지만 죽지 않음.** "구독 거부" 사용자와 프로 워크플로(Sibelius 번들)에서 견고한 니치 유지.
4. **차별화 축이 "정확도"에서 "워크플로 통합"으로 이동.** 채보 결과물을 어떤 워크플로(학습·마스터링·DAW)에 끼워 넣느냐가 경쟁 포인트.

---

# 4. 기술 구현 가이드 (Implementation)

## 4.1 전형적인 AMT 파이프라인

```
오디오 입력 (wav/mp3)
   ↓
[선택] 음원 분리  ── Demucs / Spleeter (악기별 stem)
   ↓
특징 추출  ── librosa / torchaudio (CQT, log-mel spectrogram)
   ↓
모델 추론  ── onset/pitch 검출 (basic-pitch / ByteDance / MT3 / Omnizart)
   ↓
MIDI 생성  ── 음 시작·길이·피치·velocity
   ↓
리듬 양자화 / 비트 트래킹  ── 템포 추정 + 박자 정렬 (가장 어려운 단계)
   ↓
MusicXML / 악보 렌더링  ── music21 + MuseScore / LilyPond
```

## 4.2 바로 쓸 수 있는 오픈소스 모델

| 모델 | 설치 | 특징 | 한계 | 라이선스 |
|---|---|---|---|---|
| **Spotify basic-pitch** | `pip install basic-pitch` | 경량(~17K), polyphonic, 악기 무관, CPU 가능 | "한 번에 한 악기"가 베스트 | Apache 2.0 |
| **ByteDance piano_transcription** | `pip install piano_transcription_inference` | 피아노 고정밀, 페달 포함 | 피아노 전용 | 오픈 |
| **Magenta MT3** | T5X/JAX (Colab 권장) | 멀티트랙 동시 채보 SOTA(~77M) | 설치 난이도 최고, 일반화 약함 | 오픈 |
| **Omnizart** | `pip install omnizart` | 보컬/드럼/코드/비트까지 종합 | TF 1.x 의존성 까다로움 | 오픈 |

출처: https://github.com/spotify/basic-pitch , https://github.com/qiuqiangkong/piano_transcription_inference , https://github.com/magenta/mt3 , https://github.com/Music-and-Culture-Technology-Lab/omnizart

## 4.3 오디오 처리 보조 라이브러리

| 도구 | 역할 |
|---|---|
| **librosa** | 오디오 로딩·특징 추출 표준(STFT, CQT, mel-spectrogram, onset detection) |
| **torchaudio** | PyTorch 학습 파이프라인용 오디오→텐서 전처리 |
| **CREPE / torchcrepe** | 신경망 기반 모노포닉 피치(f0) 추정 — 보컬/솔로 멜로디 |
| **Demucs** | 음원 분리(Meta, 활발히 유지보수). 4~6 stem 분리 후 단일 악기 채보에 투입 |
| **Spleeter** | 음원 분리(Deezer, 빠르지만 업데이트 중단). 품질은 Demucs 우위 |

**핵심 패턴**: basic-pitch처럼 단일 악기에 강한 모델 앞단에 **Demucs로 stem 분리** → stem별 채보 → 합치면 멀티 악기 곡도 처리 가능.

## 4.4 출력 포맷: MIDI vs MusicXML

- **MIDI**: 연주 데이터(피치 번호·velocity·길이). 이명동음(C#/Db) 구분 없음 → 그대로는 "읽는 악보"가 아님. 채보 모델 1차 출력.
- **MusicXML**: 악보 표기 표준(올림/내림·박자표·조표·마디). 사람이 읽는 악보 교환 포맷.
- **music21** (Python, MIT): MIDI ↔ MusicXML ↔ LilyPond 변환 허브. 단 **실연주 녹음 MIDI는 정돈이 어려워** 양자화 전처리가 중요.
- **렌더링**: MuseScore(가장 일반적) 또는 LilyPond(고품질 조판, PDF).

출처: https://music21.org/music21docs/about/faq.html

## 4.5 모델 선택 가이드 (의사결정 트리)

| 상황 | 추천 |
|---|---|
| 빠른 프로토타입 / 잡다한 악기 / 학습 부담 최소 | **basic-pitch** (pip 한 줄, CPU 가능) |
| 피아노 단일 악기 고정밀(페달 포함) | **ByteDance piano_transcription** |
| 여러 악기를 트랙별로 한 번에 | **MT3** (Colab) 또는 **Demucs 분리 + basic-pitch** |
| 보컬/드럼/코드/비트 종합 | **Omnizart** |
| 운영 부담 없이 결과만(비개발/상용) | **Klangio API / AnthemScore** |

## 4.6 초급~중급 빌더를 위한 실전 조언

**가장 쉬운 시작 경로**:
1. `pip install basic-pitch` → 오디오를 MIDI로 변환 (GPU 불필요)
2. `pip install music21` → MIDI를 MusicXML로 변환, MuseScore 연동 렌더
3. 멀티 악기 곡이면 앞단에 Demucs로 stem 분리

**가장 어려운 병목 3가지**:
- **리듬 양자화**: 채보 MIDI의 불규칙 타이밍을 정확한 박/음표 길이로 정돈 — 악보 가독성의 핵심 병목.
- **멀티 악기 분리·채보**: 단일 모델로는 어렵고 "Demucs 분리 + 단일 악기 채보" 조합이 현실적.
- **악보 포맷팅**: 이명동음·조표·성부 분리 등 후처리(music21) 필요.

**GPU 필요성**: basic-pitch·ByteDance 추론은 CPU로 충분(GPU는 속도 이점). MT3는 Colab GPU 권장. Demucs는 GPU 있으면 빠름.

출처: https://arxiv.org/pdf/2410.00210 (양자화 연구)

---

# 5. 프로젝트 시사점 (종합 제언)

리서치를 종합하면, 음악 채보 프로젝트의 현실적 방향은 다음과 같음:

1. **"모든 악기 전반"은 단일 모델로 안 됨.** 피아노는 ByteDance, 멀티 악기는 "Demucs 분리 + basic-pitch", 보컬/코드는 Omnizart처럼 **악기/용도별로 모델을 나누는 파이프라인**이 현실적.

2. **차별화는 정확도가 아니라 워크플로에서 나옴.** 채보 엔진 자체는 오픈소스(basic-pitch 등)로 상향평준화됨. 경쟁력은 결과물을 어떤 사용 맥락(학습·작곡·DAW·노래방)에 매끄럽게 연결하느냐에 있음.

3. **수익 모델은 세그먼트 선택의 문제.** 개인 대상이면 데스크톱 일회성(AnthemScore형) 또는 모바일 구독(Moises형), B2B면 API 과금(Music.AI/Klangio형). 빅테크 방식(무료 오픈소스+생태계)은 직접 수익이 목표가 아님.

4. **가장 큰 기술 리스크는 모델 정확도가 아니라 후처리.** 리듬 양자화와 악보 포맷팅이 사용자가 체감하는 품질을 좌우함. 여기에 엔지니어링 리소스를 집중할 것.

---

## 부록: 주요 출처

**학술/모델**
- Onsets and Frames: https://arxiv.org/pdf/1710.11153
- High-Resolution Piano (ByteDance): https://arxiv.org/pdf/2010.01815
- MT3: https://arxiv.org/abs/2111.03017 / https://github.com/magenta/mt3
- basic-pitch: https://github.com/spotify/basic-pitch
- hFT-Transformer: https://github.com/sony/hFT-Transformer
- 평가 메트릭(mir_eval): https://mir-eval.readthedocs.io/latest/api/transcription.html

**시장**
- Generative AI in Music: https://www.grandviewresearch.com/industry-analysis/generative-ai-in-music-market-report
- AI in Music: https://market.us/report/ai-in-music-market/
- 음악 스트리밍: https://www.grandviewresearch.com/industry-analysis/music-streaming-market
- 온라인 음악교육: https://www.mordorintelligence.com/industry-reports/online-music-education-market

**기업/제품**
- AnthemScore: https://www.lunaverus.com/transcribe/pricing
- Klangio: https://klang.io/api/
- Moises/Music.AI: https://moises.ai/ / https://www.musicbusinessworldwide.com/music-ai-raises-40m-in-series-a-round-as-its-moises-platform-hits-50m-users/

**구현 도구**
- music21: https://music21.org/
- Omnizart: https://github.com/Music-and-Culture-Technology-Lab/omnizart
- Demucs: https://github.com/facebookresearch/demucs

---

*주의: 시장 규모 수치는 출처마다 정의·범위가 달라 편차가 큼. 의사결정 시 절대값보다 CAGR 추세와 신뢰도 표기를 참고할 것. MT3 파라미터 수는 출처에 따라 6,000만~7,700만으로 보고됨.*

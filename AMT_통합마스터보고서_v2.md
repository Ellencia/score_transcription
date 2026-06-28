# 자동 음악 채보(AMT) → 악보/TAB 변환: 기술·시장·경쟁 통합 마스터 보고서 (v2)

> 최종 작성: 2026-06-21
> 통합 출처: ① Claude 1차 조사(AMT 전반) ② Claude+GPT 2차검증 보고서(솔로 개발자/TAB 관점) ③ 1차 소스 팩트체크 ④ 기타 TAB·OMR 심화 조사
> 대상: 오디오 → 악보/기타 탭 변환 도구를 만들려는 **솔로/소규모 개발자**
> 범위: 모든 악기·장르 전반 + 기타 TAB 특화 + OMR(악보 이미지 인식)

---

## 0. 핵심 요약 (TL;DR)

음악 채보(Automatic Music Transcription, AMT) = 오디오 음원을 분석해 악보(MIDI, MusicXML, 악보 이미지, 기타 탭)로 자동 변환하는 기술. 두 차례 독립 조사(Claude / GPT)가 **겹치는 사실에서 충돌이 거의 없었고**, 이는 교차 검증이 잘 됐다는 신호다. 핵심 결론:

1. **음정 검출(pitch detection)은 거의 해결됐고, 진짜 난제는 "읽을 수 있는 악보로 바꾸는 마지막 1마일(last mile)"이다.** 피아노 onset F1은 96~97%, 기타 note F1도 클린 환경에서 87~90%까지 왔다. 그러나 리듬 양자화(rhythm quantization), 박자/조표 추정, 성부 분리, 이명동음 표기, **기타의 프렛/현 할당**은 모든 도구(상용 포함)가 약한 지점이다. **여기가 솔로 개발자가 가치를 더할 수 있는 곳이다.**

2. **연구 패러다임은 "전용 모델 → 범용 seq2seq Transformer"로 수렴 중이다.** 오디오 채보(MT3 계열)도, 악보 이미지 인식(OMR, OLiMPiC/ICDAR 2024)도 동일하게 end-to-end Transformer로 이동하고 있다.

3. **인커번트(Ultimate Guitar, Songsterr)의 진짜 해자는 AI가 아니라 콘텐츠 라이브러리 + 커뮤니티 + 라이선싱이다.** 이들의 카탈로그는 대부분 **사람이 수작업으로 만든 크라우드소싱 탭** + 퍼블리셔 라이선스다. 솔로 개발자가 규모로 이길 수 없는 영역.

4. **AI 채보 스타트업(Klangio, Songscription, Moises)은 작고 최근이며 니치에서 공략 가능하다.** 빅테크(Spotify·Google·ByteDance)는 채보를 직접 수익화하지 않고 오픈소스로 풀어 생태계 영향력을 확보한다 → 그 무료 엔진이 상용 제품의 부품이 된다.

5. **현실적 경로: foundation model을 학습하지 마라. 사전학습 모델(Basic Pitch, ByteDance, YourMT3+, FretNet)을 wrapping하고, Demucs로 전처리하고, 노력을 MIDI→악보 변환 + TAB 프렛 할당 + 편집 UI에 쏟아라.** 추론 비용은 곡당 몇 센트, 진짜 해자는 **노테이션 품질 + 큐레이션된 니치 카탈로그**다.

---

# 1. 학술/기술 (Academic & Technical)

## 1.1 AMT 일반 — 기념비적 딥러닝 논문

발전 흐름: **이중 검출(Onsets and Frames) → 회귀 기반 고해상도(ByteDance) → seq2seq Transformer(MT3 계열) → 자기지도 foundation model**.

### Onsets and Frames (Hawthorne et al., Google Magenta, ISMIR 2018)
- 신경망을 두 갈래(dual-objective)로 — 하나는 **onset(음 시작)** 만, 다른 하나는 **음이 울리는 모든 프레임(frame)** 을 검출. onset 합의 없이는 새 음을 못 만들게 해 false positive를 줄임.
- MAPS note F1 ≈ 82.3%(원본)/86.4%(MAESTRO 학습), **onset-only F1 ≈ 94.8%(MAESTRO)**. 이후 모든 피아노 채보의 baseline.
- 출처: https://arxiv.org/pdf/1710.11153

### High-Resolution Piano Transcription (Kong et al., ByteDance, 2020/2021 TASLP)
- 프레임 분류 대신 **onset/offset 시점을 연속값으로 회귀(regression)**, velocity와 **서스테인 페달**까지 검출.
- MAESTRO **onset F1 96.72%** (Onsets&Frames 94.80% 능가), 페달 onset F1 91.86%(최초 벤치마크). 현재 피아노 표준, 오픈소스(`bytedance/piano_transcription`).
- 독립 확인: Riley et al. 2024가 유사 score-aligned 접근으로 96.49% 보고.
- 출처: https://arxiv.org/pdf/2010.01815

### Sequence-to-Sequence Piano Transcription with Transformers (Hawthorne et al., Google, ISMIR 2021)
- 전용 아키텍처를 버리고 **범용 encoder-decoder Transformer** 로 스펙트로그램을 MIDI-like 이벤트 토큰으로 "번역". 채보를 기계번역식 seq2seq 문제로 재정의.
- 출처: https://archives.ismir.net/ismir2021/paper/000030.pdf

### MT3: Multi-Task Multitrack Music Transcription (Gardner et al., Google, ICLR 2022)
- 위 seq2seq를 **다중 악기**로 확장. T5 백본(약 6,000만~7,700만 파라미터)으로 여러 데이터셋을 단일 토큰 어휘로 통합 학습.
- 데이터 적은 악기(기타 등) 성능 대폭 향상하면서 피아노 유지. 다중 악기 AMT 표준 baseline. 단 연구급이라 실제 팝 음원엔 취약(GuitarSet zero-shot note F1 32.0).
- 출처: https://arxiv.org/abs/2111.03017 , https://github.com/magenta/mt3

### YourMT3+ (Chang, Benetos, Kirchhoff, Dixon, QMUL, IEEE MLSP 2024)
- MT3 후속 최고급 오픈 다중악기 모델 — 계층적 attention + Mixture-of-Experts, **보컬 직접 채보**(별도 분리기 불필요). 10개 데이터셋 벤치마크. 저자가 "실제 팝 녹음에서의 한계"를 솔직히 명시.
- 출처: https://arxiv.org/abs/2407.04822

### Basic Pitch (Bittner et al., Spotify, ICASSP 2022)
- 매우 작은 CNN(약 17K 파라미터). **instrument-agnostic**, polyphonic, pitch bend 검출 포함, CPU에서 실시간보다 빠름.
- 개인 개발자의 최적 시작점. 단 "한 번에 한 악기"가 베스트.
- 출처: https://github.com/spotify/basic-pitch

### hFT-Transformer (Toyama et al., Sony AI, ISMIR 2023)
- 2단계 **계층적 주파수-시간 Transformer** — 피아노 채보 SOTA급(96~97%). 그 외 2023~24 방향: Mel-RoFormer(ByteDance, 보컬분리+멜로디), 합창 채보 등.
- 출처: https://archives.ismir.net/ismir2023/paper/000024.pdf

## 1.2 기타 TAB 전용 채보 (Audio → Tablature)

기타 탭은 **음 검출 + 프렛/현 할당 + 주법**이라는 추가 난제를 가진 별도 문제다.

| 모델 | 발표 | 접근 | note F1 (GuitarSet, @50ms) | 한계 |
|---|---|---|---|---|
| **TabCNN** | ISMIR 2019 | CQT→CNN, 6현 프렛 분류 | ~58.3% (구식) | 프레임 단위, onset 정밀도 낮음 |
| **FretNet** | ICASSP 2023 | **연속 피치(continuous pitch)** 추정 → 현/프렛 그룹핑 | ~66.4% (P 90.9/R 54.5) | 재현율 낮음. 단 **벤딩·비브라토 표현 가능**(거의 유일) |
| **Riley 도메인적응** | ICASSP 2024 | ByteDance 피아노 모델을 기타로 적응 | **87.3%(zero-shot)/89.7%(supervised)** | **프렛/현 미출력(음만), 확장주법 명시적 제외** |
| **GAPS (모델)** | ISMIR 2024 | 클래식 기타로 도메인적응 확장 | (벤치마크 모델 동반) | — |

- supervised 최고치 참고: Lu et al. 91.1%, SpecTNT 90.7%, MT3 90.0%.
- 출처: TabCNN https://github.com/andywiggins/tab-cnn / FretNet https://arxiv.org/abs/2212.03023 / Riley https://arxiv.org/abs/2402.15258 / GAPS https://arxiv.org/abs/2408.08653

**프렛/현 할당 문제 (TAB 고유):** 한 음높이를 여러 (현,프렛) 조합으로 연주 가능 → 오디오만으론 거의 구분 불가. 측정지표는 **TDR(Tablature Disambiguation Rate)** = 정확한 피치 중 현/프렛까지 맞춘 비율. **tablature F는 항상 multipitch F보다 낮다**(음 맞춰도 위치에서 점수 잃음). 알고리즘:
- **HMM/Viterbi + 운지 전환 비용**(Hori, Kameoka & Sagayama 2013; Hori & Sagayama, ISMIR 2016)
- **그래프 최단경로**(Burlet & Fujinaga, Robotaba, ISMIR 2013)
- **신경망 inhibition**(guitar-transcription-with-inhibition, arXiv 2204.08094 — 물리적으로 불가능한 현 중복 억제)

**확장 주법(벤딩/슬라이드/해머온/팜뮤트/하모닉스):** 대부분 모델이 무시. FretNet만 연속 피치로 부분 시도. GuitarPro 포맷은 이를 심볼릭하게 보유 → SynthTab이 "일부 주법"만 오디오로 재현. **주법 검출은 미해결 연구 영역.**

## 1.3 OMR (악보 이미지/PDF → 디지털 악보)

오디오가 아니라 **이미지를 입력**받는 별도 분야. 솔로 개발자가 "이미지/PDF도 받는다"는 유입 포인트로 추가 고려할 만함.

**왜 텍스트 OCR보다 훨씬 어려운가** (Calvo-Zaragoza et al., "Understanding OMR," ACM Computing Surveys 2020, arXiv:1908.03608):
1. 음악은 featural writing — primitive(notehead/stem/flag)의 **2D 배치(configuration)가 의미를 결정**.
2. 그래픽 수직 위치를 음악 규칙으로 **pitch로 번역**해야 함(의미 복원 의무).
3. 기호 크기가 dot부터 페이지 전체 brace까지 극단적.
4. **연쇄 오류(cascading errors)** — 조표 하나 오인식이 다수 음표를 오염.

Soundslice 창업자 Adrian Holovaty: *"OMR is an inherently hard problem, significantly more difficult than text OCR... A single misdetected key signature might result in multiple incorrect note pitches."* (https://www.holovaty.com/writing/machine-learning-thoughts/)

**학계 트렌드(2023~26):** 세그멘테이션 파이프라인(staff 검출→기호 검출→복원) → **end-to-end seq2seq Transformer**로 전환. 대표: **OLiMPiC/ICDAR 2024**(피아노포름, LMX(Linearized MusicXML) 포맷, TEDn 평가지표; github.com/ufal/olimpic-icdar24), GrandStaff(IJDAR 2023). **필기 악보(HMR)는 여전히 대부분 실패** — 인쇄 OMR과 난이도 격차 큼.

## 1.4 핵심 데이터셋 (AMT + 기타 + OMR)

**AMT(오디오):**
| 데이터셋 | 규모 | 내용 |
|---|---|---|
| MAESTRO v3 | ~198.7h, 1,276연주 | 클래식 피아노, 오디오-MIDI 3ms 정렬 |
| Slakh2100 | ~145h, 34악기 | 합성 다중악기 |
| MusicNet | 클래식 녹음 | 다중악기 실연주 라벨 |
| URMP | 44곡 | 앙상블, multi-stem |
| MAPS | 피아노 | (구) 벤치마크 |

**기타/TAB:**
| 데이터셋 | 규모 | 형식 |
|---|---|---|
| **GuitarSet** | 360발췌(~30초), 6연주자 | **헥사포닉 픽업**(현별 분리) + 현/프렛/주법 16종 주석. 탭 채보 표준 GT |
| **DadaGP** | 26,181곡, 739장르 | GuitarPro 토큰. **심볼릭만, 오디오 없음** |
| **SynthTab** | DadaGP 파생 | 심볼릭 탭을 상용 플러그인으로 **합성 오디오화** |
| **GAPS** | 14h, 200+연주자 | 클래식 기타 실연주+노트레벨 MIDI. 현재 최대 실기타 오디오셋 |
| **EGDB** | 240탭×4톤 | 일렉기타(앰프 모델 렌더) |

> ⚠️ 이전 보고서의 **"GOAT" 데이터셋은 존재 확인 불가**(arXiv/Zenodo/GitHub 미검증, GAPS와 혼동 가능성).
> **만성 병목**: 진짜 (실음원 + 정확한 현/프렛/주법) 페어 데이터가 희소. GuitarSet은 360발췌(클린)뿐, DadaGP는 오디오 없음 → 합성/도메인적응으로 우회.

**OMR(이미지):** CVC-MUSCIMA(필기 1000장), MUSCIMA++(필기 상세주석 140장), DeepScores(인쇄 대규모), PrIMuS/Camera-PrIMuS(단성부 인쇄), OLiMPiC(피아노포름 2024).

## 1.5 SOTA 메트릭 (용어 설명)

- **Precision** = 검출한 음 중 맞은 비율, **Recall** = 실제 음 중 잡은 비율, **F1** = 둘의 조화평균(1=100%에 가까울수록 좋음).
- **Note Onset F1**: 음 시작이 정답 **±50ms** 이내면 정답(offset/velocity 무시). 가장 널리 쓰임.
- **Frame-level F1**: 10ms 프레임마다 음 유무 채점.
- **TDR**(기타): 맞은 피치 중 현/프렛까지 맞춘 비율.
- **TEDn**(OMR): tree-edit-distance 기반 악보 구조 정확도.

핵심 수치: 피아노 onset F1 **96~97%**(거의 성숙), 기타 note F1 **87~90%**(클린 GuitarSet), 다중악기·실음원은 급락.

## 1.6 난제 분석 — 왜 피아노는 쉽고 나머지는 어려운가

| 대상 | 난이도 | 이유 |
|---|---|---|
| 피아노 | 쉬움 | 이산 음고(88건반), 3ms 정밀 라벨 풍부, 명확한 타건 onset |
| 다중악기 | 매우 어려움 | 중첩 harmonics(주파수 겹침), 악기 1→3개로 F1 급락 |
| 기타 | 어려움 | 연속 음고(bend/slide) + **현/프렛 매핑 모호** + 주법 |
| 보컬 | 어려움 | vibrato·glissando 연속 음고, 라벨 부족 |
| **악보화(공통)** | **최대 난제** | 리듬 양자화·박자·조표·성부·이명동음 — 모든 도구의 약점 |

## 1.7 연구 트렌드 (2024~2025)

seq2seq Transformer 확장 주류(YourMT3+), 자기지도 foundation model(MusicFM, Aria-MIDI 데이터셋), 보컬/멜로디 채보, 실시간/효율화(pruning·quantization), OMR의 end-to-end 전환. **오디오 채보와 OMR이 같은 Transformer 패러다임으로 수렴**.

---

# 2. 시장 현황/규모 (Market)

## 2.1 가장 중요한 주의사항

**"AI in music" 수치가 출처마다 ~10배 차이** — 측정 대상이 다르기 때문:
- Grand View Research "Generative AI in Music"(생성형 작곡 SW): 2024년 ~**5.7억 달러**
- Market.us "AI in Music"(AI 음악 산업 전체): 2024년 ~**52억 달러**

**AMT(채보)는 어느 리포트에서도 독립 세그먼트로 측정되지 않는다.** 아래는 전부 인접/대리(proxy) 시장.

## 2.2 시장 규모 (구분 필수)

| 시장 | 규모 | CAGR | 신뢰도 |
|---|---|---|---|
| Generative AI in Music (GVR) | 2024 $569.7M → 2030 $2.79B | 30.5% | 중상 |
| AI in Music (Market.us) | 2024 $5.20B → 2034 $60.44B | 27.8% | 중 |
| **Music Notation SW** (AMT 최근접) | $260M~$2.74B (출처별 5배 편차) | 7.5~10.5% | 저(산포 큼) |
| Digital Sheet Music | 2024 $0.86B → 2033 $2.15B | 10.7% | 중 |

> notation SW의 절대규모는 신뢰 낮으나 CAGR은 9~10%로 수렴. **방향성만 참고.**

## 2.3 인접 시장 (AMT가 기능으로 편입)

| 시장 | 규모(2025경) | CAGR |
|---|---|---|
| 음악 스트리밍 | $54.1B | 14.2% |
| 온라인 음악 교육 | $3.9B | 15.2% |
| 음악 제작 SW(DAW) | $4.4B | 9~9.4% |

## 2.4 응용 세그먼트
음악 교육/악기 학습(B2C 핵심 수요처), 콘텐츠 제작/스트리밍(stem 분리·노래방), 작곡/송라이팅, MIR(음악 정보 검색).

## 2.5 펀딩 (대부분 생성형 음악 — 채보 직접 아님)

| 기업 | 라운드 | 밸류/금액 | 비고 |
|---|---|---|---|
| Suno | Series D (2026.06) | $5.4B | 생성형 작곡 |
| Udio | Series A (2024) | ~$200M+ | 생성형 작곡 |
| **Moises/Music AI** | Series A $40M (2025.01) | 누적 $50.2M | **채보 인접 최대**, 사용자 50M→70M |
| Yousician | — | ~$50M raised | 음악 학습(채보 아님) |
| LANDR | Series B $26M | — | AI 마스터링 |

---

# 3. 우세 기업/제품 전략 (Competitive Landscape)

시장은 두 축으로 나뉜다: **(A) AMT 엔진/오디오 채보** vs **(B) TAB 카탈로그 인커번트 + OMR**.

## 3.1 AMT 엔진 회사

### AnthemScore (Lunaverus) — ⚠️ 구독 모델로 전환 중 (팩트체크 수정)
- 데스크톱 일회성: **Lite $29 / Professional $44 / Studio $110** (1차 소스 확인. 이전 보고서 "$29–$99"는 상한 오류).
- **신규 발견: AnthemScore Web 구독** — Free $0 / Plus $9.99 / Pro $29.99 **월**. "데스크톱 일회성의 정석"이라는 두 보고서의 전제가 약해지고 있다는 신호.
- CNN 기반. 멀티트랙은 약함(모든 음을 한 보표에 쏟음).
- 출처: https://www.lunaverus.com/purchase , https://www.lunaverus.com/transcribe/pricing

### Klangio (Karlsruhe) — 모바일+API 하이브리드
- Piano2Notes/Guitar2Tabs/Drum2Notes/Sing2Notes 앱군 + B2B "AI Music Analysis API". 구독+티켓 모델. 합성데이터 학습(저작권 회피). Transcription Studio(최대 8악기 VST3/AU). 주요 시장 미국·일본·**한국**.
- 부트스트랩, 흑자(자체 주장 2024 초). **2023년 9월 4일 Die Höhle der Löwen(독일 샤크탱크) 시즌14 2화 출연** 확인(창업자 Alexander Lüngen, Sebastian Murgul, €300k/10% 요청). 흑자 시점은 1차 소스 미입증.
- 출처: https://klang.io/api/ , klang.io 블로그

### Songscription — AI 채보 직접 경쟁자 (팩트체크 확인)
- **2024년 설립, Reach Capital 투자** (공식 사이트 확인). TechCrunch/Billboard/MusicRadar 보도. 오디오/YouTube→악보·MIDI·기타탭·MusicXML. 단일악기(피아노·기타·베이스·바이올린·관악·드럼·보컬), 무료 30초 무제한. 피아노 학습앱 playanything.com 병행.
- 리뷰: 유망하나 미성숙("single-instrument for now").
- 출처: https://songscription.ai/

### Moises / Music AI — 자금·규모 선두 (팩트체크 확인)
- **$40M Series A(2025.01, $30M primary + $10M secondary)**, Connect Ventures(CAA+NEA)+monashees. 누적 $50.2M($8.6M 시드 2022). **사용자 50M(Series A 시점) → 70M(연말 자체 발표)**. iPad 올해의 앱 2024. Ableton Live 12.3 stem 분리 제공.
- 전략: B2C 앱(Moises)을 데이터 채널로, 수익 엔진은 **"윤리적 AI" B2B API(Music.ai)**. **단 채보가 아니라 연습/스템 분리 중심** — 수요 입증하되 노테이션 니치는 비워둠.
- 출처: https://www.musicbusinessworldwide.com/music-ai-raises-40m-in-series-a-round-as-its-moises-platform-hits-50m-users/

### 빅테크 오픈소스 (직접 수익화 안 함)
- **Spotify basic-pitch**(Apache 2.0): 무료 엔진 → NeuralNote 등 서드파티의 표준 부품화.
- **Google MT3 / Magenta**: 순수 연구·오픈소스 리더십.
- **ByteDance piano_transcription**: 피아노 SOTA 오픈소스 + GiantMIDI-Piano 데이터 자산.

## 3.2 TAB 카탈로그 인커번트 (솔로 개발자가 규모로 못 이기는 영역)

### Ultimate Guitar (Muse Group)
- 1998 설립. 탭 개수 = **검수된 무료 사용자 탭 ~1.4M(App Store) / 전체 텍스트 탭+코드 2M+(홈페이지·Google Play)** — 둘 다 UG 자체 표기, 세는 기준 차이. 월 60M+ 방문, 앱 53M+ 다운로드. UG 단독 매출 ~$16.8M, 모회사 Muse Group ~$305M.
- **수직 통합**: MuseScore(기보) + Audacity(편집) + Hal Leonard(최대 악보 퍼블리셔) + StaffPad + Tonebridge 소유. 학습→기보→출판→라이선싱 전 funnel 장악.
- 핵심: 카탈로그는 **크라우드소싱 + 퍼블리셔 라이선스**, 자동 채보 아님.

### Songsterr
- 2008 설립, 400,000곡 / 1.3M 탭 트랙, ~26명. Plus $9.90/월. **크라우드소싱**(Guitar Pro 업로드)+로열티("수익의 거의 절반을 로열티로 지급"). 공식 FAQ: *"All tabs are contributed by users. We don't do the transcriptions ourselves."* 차별점: 곡당 하나의 정확한 싱크 탭 + 원곡 재생.

### Yousician
- 음악 학습(채보 아님). 20M+ MAU, ~€53.3M 매출(2024), $35M 조달. 실시간 오디오 인식은 피드백용.

## 3.3 OMR 상용 / 인커번트의 AI 진입

- **Soundslice 스캐너**(Adrian Holovaty): 동급 최강 평가. 비결 = 자체 데이터셋 + 모델의 "관점", **confidence 낮으면 사용자에게 질문하는 UX**. Plus $5/월. (ChatGPT가 없는 기능을 안내해서 실제로 그 기능을 만든 일화 — AI가 채보 제품 유입 채널이 됨)
- **MuseScore NoteVision**(Muse Group): **2025년 7월 출시 확인**. PDF/스캔→편집가능 악보(OMR). 무료(한도)/Pro 무제한. **인커번트가 OMR을 AI 진입점으로 사용**하는 직접 신호.
- **PlayScore 2**: 모바일+Windows, **무제한 스캔**이 차별점. MusicXML/MIDI export.
- **PhotoScore/NotateMe**(Neuratron): Sibelius 번들, "99.5% 정확" 주장(산출법 미공개). 기타 4·6선 탭 지원.
- **SmartScore**(Musitek): OMR 원조(1991 MIDISCAN). Guitar $99(TAB) 등 계층. **Newzik Maestria**: 합성데이터 학습 딥러닝 OMR.

## 3.4 4개 전략 세그먼트 + 통찰

| 세그먼트 | 과금 | 대표 | 승자 |
|---|---|---|---|
| 데스크톱 SW | 일회성(→구독 전환 중) | AnthemScore, AudioScore, Transcribe! | AnthemScore |
| 모바일 앱 | 구독 | Klangio, Moises, ScoreCloud, Songscription | Moises(규모) |
| API/B2B | 사용량/SDK | Music.AI, Klangio API | Music.AI(자본) |
| 오픈소스 | 무료 | basic-pitch, MT3, ByteDance, FretNet | Spotify basic-pitch |
| TAB 카탈로그 | 구독+라이선싱 | Ultimate Guitar, Songsterr | 솔로 개발자 진입 불가 |
| OMR | 보조 기능/구독 | Soundslice, MuseScore NoteVision | (단독 수익 어려움) |

**핵심 통찰:**
1. 빅테크는 채보를 직접 수익화하지 않고 오픈소스로 생태계 영향력을 확보 → 무료 엔진이 상용 부품이 됨.
2. 상용 수익 축이 B2C 앱 → B2B API로 이동(Moises의 "Music.AI" 리브랜딩).
3. 데스크톱 일회성 모델은 축소되지만 죽지 않음(AnthemScore도 구독 추가).
4. **차별화 축이 "정확도" → "워크플로 통합"으로 이동** — 채보 결과를 어떤 맥락(학습·작곡·DAW·노래방)에 끼우느냐가 경쟁점.
5. **OMR 단독 제품은 역사적으로 대부분 폐업**했으나, 노테이션/학습 플랫폼의 **AI 유입 채널**로는 강력.

---

# 4. 기술 구현 가이드 (Implementation)

## 4.1 파이프라인

**오디오 채보:**
```
오디오 입력 (wav/mp3)
   ↓ [선택] 음원 분리 — Demucs v4 / Spleeter (악기별 stem)
   ↓ 특징 추출 — librosa / torchaudio (CQT, log-mel)
   ↓ 모델 추론 — basic-pitch / ByteDance / YourMT3+ / FretNet
   ↓ MIDI 생성 (음 시작·길이·피치·velocity)
   ↓ 리듬 양자화 / 비트 트래킹 ★최대 병목★
   ↓ MusicXML/GuitarPro → 악보·탭 렌더링 (music21 + MuseScore / alphaTab)
```

**OMR(이미지 입력):** 이미지 → (dewarp) → staff 검출 → 기호 인식(세그멘테이션 or Transformer seq2seq) → MusicXML. 출력단(에디터·재생)은 오디오 채보와 공유.

## 4.2 바로 쓸 수 있는 오픈소스 모델

| 모델 | 설치 | 특징 | 한계 | 라이선스 |
|---|---|---|---|---|
| **basic-pitch** | `pip install basic-pitch` | 경량, polyphonic, 악기무관, CPU | 한 번에 한 악기 | Apache 2.0 |
| **ByteDance piano** | `pip install piano_transcription_inference` | 피아노 고정밀+페달 | 피아노 전용 | 오픈 |
| **MT3/YourMT3+** | T5X/JAX (Colab 권장) | 멀티트랙 SOTA | 설치 어려움, 팝 취약 | 오픈 |
| **FretNet** | `cwitkowitz/guitar-transcription-continuous` | 기타 연속피치(벤딩 표현) | note F1 ~66% | MIT |
| **Omnizart** | `pip install omnizart` | 보컬/드럼/코드/비트 종합 | TF1.x 의존성 | MIT |

## 4.3 기타 TAB 파이프라인 (★ 핵심)

> **오디오→렌더링된 탭까지 end-to-end 오픈소스는 없다.** 모든 성숙한 레포(FretNet/amt-tools, EGDB, GAPS)는 "오디오→음/현 데이터"에서 멈춤. 3단 조립이 유일한 현실 경로:

```
[transcription 모델: FretNet 또는 Riley 도메인적응]
        ↓ (음 + 가능하면 현/프렛)
[프렛 할당: HMM/Viterbi 또는 그래프 최단경로 + 운지 비용]
        ↓
[GuitarPro(.gp5) 또는 MusicXML 생성 — DadaGP 토큰↔GP 디코더 활용]
        ↓
[alphaTab 렌더 + 싱크 재생]
```

**웹 렌더링 비교:**
| 라이브러리 | 입력 | TAB 렌더 | 싱크 재생 | 라이선스 |
|---|---|---|---|---|
| **alphaTab** ⭐ | **Guitar Pro 3-8 + MusicXML** | O | **O(내장 신디+커서, 오디오/영상 싱크)** | MPL-2.0 |
| VexFlow | API 작성만 | O | X(렌더 전용) | MIT |
| OpenSheetMusicDisplay | MusicXML만 | O | 재생 스폰서 게이트 | BSD-3 |

→ **alphaTab이 Songsterr 스타일에 압도적 근접.** Guitar Pro **.gp5/.gpx**가 사실상 교환 표준.

## 4.4 OMR 도구 (이미지→악보 추가 시)

| 도구 | 설치 | 특징 | 라이선스 |
|---|---|---|---|
| **Audiveris** | Java 설치 | 가장 성숙, MusicXML, 대형 악보. "100% 불가, 교정 전제" | AGPL-3.0 |
| **oemer** | `pip install oemer` | UNet+SVM, Python 네이티브 | MIT(상업 자유) |
| **homr** ⭐ | `uvx homr` | oemer 개선, UNet+**Transformer**, 더 견고 | AGPL-3.0(임베드 검토) |

**OMR 실패 지점:** 필기 악보(거의 다 실패), 복잡/오케스트라, 저화질 사진, cascading error. "100% 정확도" 마케팅은 클린 PDF best-case — 반드시 자체 실샘플 테스트.

## 4.5 오디오 처리 보조 라이브러리

librosa(특징 추출 표준), torchaudio(PyTorch 전처리), CREPE/torchcrepe(모노 피치/보컬), **Demucs v4**(음원 분리 SOTA, ~9dB SDR, 4~6 stem), Spleeter(빠르지만 레거시).
- **핵심 패턴**: 단일악기에 강한 모델(basic-pitch) 앞단에 Demucs로 stem 분리 → stem별 채보.

## 4.6 출력 포맷

- **MIDI**: 연주 데이터(피치·velocity·길이). 이명동음 구분 없음 → 그대로는 악보 아님.
- **MusicXML**: 악보 표기 표준(올림/내림·박자·조표). 사람이 읽는 교환 포맷.
- **GuitarPro(.gp5/.gpx)**: TAB 교환 표준.
- **music21**(Python, MIT): MIDI↔MusicXML↔LilyPond 변환 허브. 단 실연주 MIDI는 양자화 전처리 필요.
- 렌더링: MuseScore(악보), alphaTab(탭+재생), LilyPond(고품질 조판).

## 4.7 모델 선택 가이드

| 상황 | 추천 |
|---|---|
| 빠른 프로토타입/잡다한 악기 | basic-pitch |
| 피아노 고정밀(페달) | ByteDance piano |
| 멀티악기 트랙별 | YourMT3+ (Colab) 또는 Demucs+basic-pitch |
| **기타 TAB** | FretNet 또는 Riley 도메인적응 + 프렛할당 + alphaTab |
| 보컬/드럼/코드 종합 | Omnizart |
| 이미지/PDF→악보 | oemer/homr (PoC), Audiveris (성숙) |
| 운영 부담 없이 결과만 | Klangio API / AnthemScore |

---

# 5. 솔로 개발자 경쟁 분석 (★ 핵심 실행 파트)

## 5.1 넘을 수 없는 장벽 (시도하지 말 것)
- **콘텐츠 라이브러리 & 라이선싱**: 100만+ 탭 크라우드소싱이나 Hal Leonard/Sony 퍼블리셔 딜은 불가. 카탈로그로 경쟁하지 마라.
- **Foundation model 학습**: 대규모 페어 데이터(비피아노는 희소)+막대한 컴퓨트 필요. 처음부터 학습하지 마라.
- **유통/SEO**: 인커번트가 "[곡명] tab" 검색·앱스토어 장악.

## 5.2 낮아진 장벽 (당신의 기회)
- **모델은 무료·사전학습**: basic-pitch, ByteDance, YourMT3+, FretNet 전부 오픈. 추론은 곡당 몇 센트(또는 CPU).
- **노테이션 last mile이 미완성**: MIDI→읽을 수 있는 악보(양자화·성부·**프렛 할당**·표기)는 상용 포함 모두 약함. AnthemScore는 멀티트랙을 한 보표에 쏟고, ScoreCloud는 이론 지식 요구, 사용자는 결국 MuseScore로 리듬 수정. **이 craft 문제가 솔로 개발자가 더 잘할 수 있는 지점.**

## 5.3 공략 가능한 니치
1. **인커번트가 소홀한 특정 악기** — 기타 TAB의 고품질 프렛 할당 + 표현 표기(벤딩·슬라이드·해머온).
2. **관용구가 있는 장르** — 재즈 comping, 핑거스타일, K-pop, 워십/CCM, 메탈 (장르 인식 양자화·보이싱).
3. **언어/지역** — 한국 채보 커뮤니티, 일본 시장(Klangio 상위 시장이 미·일·한 → 수요 있으나 경쟁도 있음).
4. **워크플로 통합** — 오디오-싱크 편집 UX로 거친 AI 출력을 누구보다 빠르게 깔끔한 탭으로.
5. **"채보 도우미(human-in-the-loop)", 마법 버튼 아님** — Klangio Edit Mode, Soundslice 에디터처럼 교정 루프 중심. (과대약속 금지 — Soundslice/ChatGPT 일화의 교훈.)

## 5.4 Build vs Leverage — 단계별 경로
- **Phase 1 (MVP, 수 주):** Demucs(분리) → basic-pitch/FretNet(채보) → music21(정리·양자화) → alphaTab/MuseScore(렌더). 니치 하나 출시: 예 "어떤 오디오든 깔끔한 기타 탭, 브라우저 편집".
- **Phase 2 (해자 구축):** 약한 고리 = **MIDI→악보 + 프렛 할당** 직접 투자. Liu et al. 2022(neural beat-tracking 양자화), Riley 2024(도메인적응) 차용. DTW/score-following 경험이 양자화에 직결.
- **Phase 3 (특화):** 오픈 모델을 니치 합성데이터(DadaGP/SynthTab 방식)로 **fine-tune(pretrain 아님)**. 표현 표기 추가, Guitar Pro export + 브라우저 play-along. 소비자 유통이 어려우면 B2B API 각도(Moises 플레이북).

## 5.5 비용
사전학습 추론 = 싼 영역(basic-pitch CPU, Demucs/ByteDance는 GPU지만 곡당 센트). **학습이 비싼 영역 — 피하라.** 지배적 비용은 노테이션 last mile + UX에 들이는 당신의 시간 = 경쟁우위가 쌓이는 곳.

---

# 6. 권고 (Recommendations)

**Stage 1 — 니치 검증(지금):** 니치 하나 선택(추천: **기타 TAB**, 기존 전문성 활용). Demucs→basic-pitch/FretNet→music21→alphaTab 얇은 웹앱. Klangio Guitar2Tabs·Songscription과 실곡 20개로 정직하게 벤치마크. **계속 기준: 내 출력이 그들보다 편집이 덜 필요하면 우위 있음.**

**Stage 2 — 해자(last mile):** (a) 리듬 양자화(neural beat-tracking 차용), (b) 연주가능성 제약 프렛/현 할당, (c) 오디오-싱크 편집 UI. **목표: GuitarSet급 소재에서 note onset F1 ~85%+ AND 박스에서 바로 읽히는 리듬.**

**Stage 3 — 특화·차별화:** 니치 합성데이터로 fine-tune, 표현 표기(벤딩/슬라이드), 킬러 워크플로 통합(Guitar Pro export + 브라우저 play-along). B2B API 고려.

**계획 변경 트리거:**
- MuseScore NoteVision/Klangio가 우수한 무료 기타-탭-from-audio를 내면 → 더 얇은 니치(장르/언어/워크플로)나 순수 툴/UX로 피벗.
- 대규모 페어 audio↔TAB 데이터를 구축/확보하면 → 특화 모델 학습이 그 자체로 해자.
- 니치 커뮤니티(예: 채보 포럼)가 지불 의향을 보이면 → 커뮤니티+큐레이션(인커번트 해자 중 솔로가 작게 복제 가능한 유일한 부분)에 집중.

---

# 7. 팩트체크 결과 (1차 소스 검증)

| 항목 | 결과 | 출처 |
|---|---|---|
| AnthemScore 가격 | 데스크톱 Lite $29/Pro $44/**Studio $110** + **웹 구독 신설($9.99/$29.99월)**. 이전 "$29–99" 상한 오류 | lunaverus.com |
| Songscription | ✅ 2024 설립, Reach Capital — 정확 | songscription.ai |
| Moises $40M Series A | ✅ 정확. 단 사용자 **50M(Series A) → 70M(연말)** | MBW 2025-01-22 |
| Klangio DHDL | ✅ 2023.9.4, 시즌14 2화, €300k/10%. 흑자 시점만 미입증 | klang.io, BNN, RTL+ |
| UG 탭 개수 | ✅ 1.4M(검수 무료 탭)/2M+(전체 텍스트+코드) — 정의 차이 | App Store, ultimate-guitar.com |
| MuseScore NoteVision | ✅ 2025년 7월 출시, OMR 컨버터 | mu.se 블로그 |

---

# 8. Caveats / 미검증 항목

- **시장 수치는 출처별 1자릿수 배수 차이** — 전부 방향성으로만. 온라인 음악교육 TAM(~$100B/2035)은 특히 투기적.
- **정확도는 벤치마크(클린) 수치** — 피아노 96.7%, 기타 87~90%는 MAESTRO/GuitarSet 기준. **실제 팝 믹스에서는 현저히 낮음**(YourMT3+ 저자도 인정).
- **메트릭 비교 주의** — frame-level vs note-level, multipitch F vs TDR은 직접 비교 불가.
- **저작권 리스크** — 카탈로그 구축형은 퍼블리셔 소송 이력(MXTabs 폐쇄). **사용자 제공 오디오를 채보하는 도구가 탭 라이브러리 호스팅보다 안전.**
- **미검증으로 남은 항목**: ① 이전 보고서의 **"GOAT" 데이터셋**(존재 확인 불가, GAPS 혼동 추정) ② Klangio 정확한 흑자 시점 ③ NoteVision 하루 업로드 증가율 수치(회사 자체 발표).

---

# 부록: 주요 출처

**학술/모델**
- Onsets and Frames: https://arxiv.org/pdf/1710.11153
- ByteDance High-Res Piano: https://arxiv.org/pdf/2010.01815
- MT3: https://arxiv.org/abs/2111.03017 · YourMT3+: https://arxiv.org/abs/2407.04822
- basic-pitch: https://github.com/spotify/basic-pitch
- TabCNN: https://github.com/andywiggins/tab-cnn · FretNet: https://arxiv.org/abs/2212.03023
- Riley 기타 도메인적응: https://arxiv.org/abs/2402.15258 · GAPS: https://arxiv.org/abs/2408.08653
- OMR 서베이: https://arxiv.org/abs/1908.03608 · OLiMPiC/ICDAR24: https://github.com/ufal/olimpic-icdar24

**데이터셋**
- GuitarSet: https://guitarset.weebly.com/ · DadaGP: https://github.com/dada-bots/dadaGP
- SynthTab: https://arxiv.org/abs/2309.09085 · EGDB: https://arxiv.org/abs/2202.09907

**기업/제품**
- AnthemScore: https://www.lunaverus.com/purchase
- Klangio: https://klang.io/api/ · Songscription: https://songscription.ai/
- Moises: https://www.musicbusinessworldwide.com/music-ai-raises-40m-in-series-a-round-as-its-moises-platform-hits-50m-users/
- Soundslice OMR: https://www.holovaty.com/writing/machine-learning-thoughts/

**구현 도구**
- music21: https://music21.org/ · alphaTab: https://alphatab.net/
- Demucs: https://github.com/facebookresearch/demucs
- Audiveris: https://github.com/Audiveris/audiveris · oemer: https://github.com/BreezeWhite/oemer · homr: https://github.com/liebharc/homr

---

*v2 통합 노트: 본 문서는 4개 소스(Claude 1차 조사 + Claude/GPT 2차검증 + 1차소스 팩트체크 + TAB/OMR 심화)를 단일 마스터로 머지함. 겹치는 사실에서 두 독립 조사가 충돌 없이 일치 → 교차검증 완료. 미검증 항목은 §8에 명시.*

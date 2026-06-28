# 자동 음악 채보(AMT) 연구 아카이브 (13편 정리 + 채보 도구 기획)

> **자동 음악 채보(Automatic Music Transcription, AMT)** — 오디오를 악보·MIDI·기타 탭으로 바꾸는 기술 — 의 핵심 논문 13편을 분석·해설하고, 그 결과를 오디오→기타 탭 채보 도구 제작 계획으로 응축한 단독 웹 아카이브입니다.
>
> *A self-contained web archive analyzing 13 AMT papers (2018–2024) and distilling them into an audio-to-TAB transcription tool roadmap. Korean.*

## 📚 무엇을 다루나 — 한눈에

자동 음악 채보는 "오디오를 듣고 컴퓨터가 악보로 받아 적는" 기술입니다. 이 아카이브는 13편을 **다섯 갈래**로 정리합니다.

1. **피아노** (거의 해결, onset F1 96~97%) — Onsets and Frames, ByteDance High-Res, hFT-Transformer
2. **다중악기 · seq2seq** (현재 프런티어) — Seq2Seq Transformers, MT3, YourMT3+
3. **기타 TAB** (미해결 난제: 프렛/현 할당·주법) — TabCNN, FretNet, Riley 도메인적응, GAPS
4. **OMR** (악보 이미지 → 디지털 악보) — OLiMPiC
5. **도구 · 보컬** — Basic Pitch, Mel-RoFormer

관통하는 한 줄: **"음정 검출은 거의 풀렸고, 진짜 난제는 읽을 수 있는 악보로 바꾸는 마지막 1마일(리듬 양자화·프렛 할당·악보 포맷팅)이다."**

그리고 이 정리는 결국 **오디오→기타 탭 채보 도구 MVP** 라는 실용 목표로 수렴합니다 ([14_제작_로드맵.md](14_제작_로드맵.md), [15_솔로개발자_로드맵.md](15_솔로개발자_로드맵.md)).

## 🖥️ 로컬에서 실행하기

웹앱은 문서를 `templates/`에서 동적으로 `fetch`하므로 `index.html`을 파일로 직접 열면 동작하지 않습니다. **로컬 서버**가 필요합니다.

```bash
# 저장소 폴더에서
python -m http.server 8000
# 그 다음 브라우저에서 http://localhost:8000 접속
```

또는 `npx http-server` 도 됩니다.

- **논문 13편**: 각 논문마다 *분석 보고서* + *비전공자 해설* 두 가지 글
- **종합·로드맵 문서 8종**: (종합 6) 관계도와 흐름 · 듣기용 오디오 대본 · 마스터 용어집 · 2024–2026 동향 · 데이터셋 인벤토리 · 적용 권고 / (로드맵 2) 제작 로드맵 · 솔로 개발자 로드맵
- **인터랙티브**: 논문 분류 마인드맵, 용어 위에 마우스를 올리면 뜨는 용어 카드, Mermaid 다이어그램

## 📂 저장소 구조

```text
index.html                  # 단독 웹앱 (진입점)
glossary.js                 # 용어집 hover 카드 데이터
js/mermaid.min.js           # 다이어그램 렌더러
css/styles.css              # 스타일
templates/                  # 모달에 표시되는 문서 (논문별 analysis/explanation + topic 8종)
papers/                     # 논문별 정리 폴더 (분석_보고서.md/.docx, 비전공자_해설.md/.docx)
00~15_*.md / *.docx         # 종합 문서 원본 (Markdown + Word)
오디오_대본.md               # 듣기용 나레이션 대본
AMT_통합마스터보고서_v2.md     # 시장·경쟁·구현까지 포함한 통합 마스터 보고서
```

## 📄 출처와 이용

본 아카이브의 **분석·해설·종합 문서**는 본 프로젝트의 창작물입니다. 분석 내용은 각 논문이 명시한 사실(arXiv 공개본·학회 PDF)에 근거했으나, 해석·요약 과정의 오류 가능성이 있으니 인용 시 원문을 확인하시기 바랍니다. 각 논문 카드의 [arXiv 원문 / GitHub] 링크가 1차 출처입니다.

시장 규모·기업 수치 등 일부 항목은 출처별 편차가 크며, 통합 마스터 보고서에 신뢰도와 미검증 항목을 표기했습니다.

# the-rich — CLAUDE.md

개인 투자 포트폴리오 트래커. Google Sheets 실시간 연동, 새로고침마다 최신 데이터.

## 커맨드

```bash
pnpm dev        # 개발 서버 http://localhost:3000
pnpm build      # 프로덕션 빌드
pnpm lint       # ESLint
```

## 스택

- **Next.js 16.2.4** (App Router) + React + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **pnpm** 패키지 매니저
- **Vercel** 배포 (main 브랜치 자동 배포)

## 환경 변수

```
GOOGLE_SERVICE_ACCOUNT_BASE64   # 서비스 계정 JSON을 base64 인코딩 (줄바꿈 깨짐 방지)
GOOGLE_SPREADSHEET_ID           # 스프레드시트 ID: 1r_HrWM_i7pwNV_F_q1pFL1MOkpwyYvCjTUZB91dUH9A
```

서비스 계정: `property@property-495108.iam.gserviceaccount.com`

## Google Sheets 구조

| 시트 | 범위 | 용도 |
|------|------|------|
| `자산현황` | `A4:F9` | 원자재 자산 (A=종목, B=보유액, E=목표액, F=이동금액) |
| `자산현황` | `E2` | **전체 포트폴리오 평가금** (국내주식 1종목당 목표 산정 기준) |
| `자산현황` | `H1:J1` | 티어 1/2/3 목표비중 (공유 저장, API로 쓰기) |
| `Database(미국)` | `A2:P` | 미국주식 (A=티커, B=종목명, J=현재가 USD, L=평가금 KRW, O=목표금액 KRW, P=이동금액 KRW) |
| `매매가관리` | `A2:H30` | 매수가/익절가/대응메모 (A=종목, B=2차매수가, C=메모, D=3차매수가, E=메모, F=익절가, G=메모, H=대응메모) |
| `Database(국내)` | `A2:N` | 국내주식 (A=종목코드, B=종목명, F=티어("1티어"형식), L=평가금, M=보유비율%, N=제외여부("Y"=제외)) |
| `Database(원자재)` | `A2:J` | 원자재 현재가 (A=티커, J=현재가) — 금=GOLD(KRW), 은=SLV(USD), 구리=FCX(USD), 천연가스=LNG(USD) |
| `Database(현금)` | `A2:J` | 환율 (USDKRW 행 J열 = 원달러 환율 KRW) |
| `Database(코인)` | `A2:M` | 코인 (A=티커, B=종목명, J=현재가 KRW, L=평가금 KRW, M=보유비율%) |
| `액션로그` | `A:E` | 도달 완료 이력 (A=날짜, B=종목명, C=필드명, D=이전가격, E=현재가KRW) |

**쓰기:** `매매가관리` 시트에 A열로 종목 찾아 해당 행 B~H열 업데이트 (H=actionMemo)  
**쓰기:** `자산현황!H1:J1` — 티어 목표비중 (updateTierTarget)  
**append:** `액션로그` — 체크 완료 시 행 추가 (logAlertAction). 시트가 없으면 실패하므로 수동 생성 필요

### 현재가 계산 방식

```
parseNum(v) = parseFloat(v.replace(/[₩$\s,]/g, ''))   ← ₩/$/ 공백/쉼표 모두 제거

금          → Database(원자재) GOLD행 J열   KRW 그대로
은/구리/천연가스 → SLV/FCX/LNG행 J열 × 환율  USD → KRW 환산
미국주식    → parseNum(J열) × 환율           USD → KRW 환산 (Database(미국) J열=USD 현재가)
코인        → Database(코인) J열             KRW 그대로
환율        → Database(현금) USDKRW행 J열 || 1350
```

**KRW 예외 종목** (`google-sheets.ts` `KRW_PRICED_IN_US_SHEET`): `Database(미국)` 시트에 등록돼 있지만 실제 원화 거래 종목은 환율 곱셈 없이 J열을 KRW 그대로 사용하고 `isUsdBased=false` 처리.
- 현재 예외: `KODEX 미국AI 전력핵심인프라` (추가 시 Set에 이름만 넣으면 됨)

## 아키텍처 & 핵심 파일

```
app/
  page.tsx                          # Server Component — fetchAssetData() 호출, revalidate=0
  layout.tsx
  globals.css
  api/update-price/route.ts         # POST — 매매가관리 시트 셀 업데이트
  api/update-tier-target/route.ts   # POST — 자산현황 H1:J1 티어 목표비중 업데이트
  api/log-action/route.ts           # POST — 도달 완료 이력을 액션로그 시트에 append

components/
  dashboard-client.tsx      # Client Component — 카테고리/검색 상태, ASSET_CONFIG, 티어 targets
  dashboard-header.tsx      # 카테고리 탭 + 검색창 (font-size 16px → iOS zoom 방지)
  asset-card.tsx            # 종목 카드 (진행바, 툴팁, 바텀시트 편집 모달)
  domestic-stock-card.tsx   # 국내주식 티어 카드 (1/2/3티어) + 종목 리스트 바텀시트

lib/
  google-sheets.ts          # Google Sheets API — fetchAssetData() + updatePriceCell() + updateTierTarget() + logAlertAction()
  price-alert.ts            # checkPriceAlert / hasAnyPriceAlert — 지정가 도달 판단 유틸
```

## 카테고리 & ASSET_CONFIG

카테고리 탭 순서: **전체 → 원자재 → 미국주식 → 국내주식 → 암호화폐**

`ASSET_CONFIG`는 `dashboard-client.tsx`에 정의. 미국주식은 시트 A열 티커 우선(`asset.ticker`), `...config` 이후에 symbol 덮어쓰는 순서 주의.

**암호화폐 목표금액 산정**: `자산현황!A4:F9` 에서 읽음
- 비트코인 → `domesticAssets.find(a => a.name === '비트코인')?.targetAmount`
- 이더리움/리플 → `알트코인` 목표액 ÷ 2 (각각 절반씩)
- `filteredUsAssets = usAssets.filter(a => a.targetAmount > 0)` — 목표 0인 미국주식 숨김
- `자산현황` 시트에 `달러` 행이 있어도 대시보드에서 필터링하여 표시 안 함 (`dashboard-client.tsx` commodityAssets 필터)

**전체 탭 렌더링**: 원자재 → 미국주식 → 국내주식(티어카드 3개) → 암호화폐 순서로 모두 표시. 검색 시 티어카드도 종목명 기준으로 필터링 포함.

**탭 UX**:
- 탭 클릭 시 `scrollIntoView({ behavior: 'smooth', inline: 'nearest' })` — 잘린 탭을 온전히 보이게 스크롤
- 탭 클릭(같은 탭 포함) 시 `window.scrollTo({ top: 0, behavior: 'smooth' })` — 콘텐츠 맨 위로 이동

**PC 레이아웃**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## AssetCard (asset-card.tsx)

- 종목별 진행바: `currentAmount / targetAmount * 100%`
- 헤더: 종목명 + 심볼 · 현재가(KRW) 표시 — `currentPriceKRW` prop
- 추가금액 옆 구매 가능 수량 자동계산: `+219만 추가 (≈2주)` — `Math.floor(transferAmount / currentPriceKRW)`
- **가격 박스(2차매수가/3차매수가/익절가) 3개 항상 표시** — 값 없으면 `--` placeholder
  - 값 있을 때: 탭 → 툴팁(메모 미리보기+연필 아이콘) → 연필 탭 → 바텀시트 편집
  - 값 없을 때: 탭 → 바로 바텀시트 편집 (툴팁 스킵). `매매가관리` 행 없어도 저장 시 자동 append
  - 표시 포맷: `fmtPrice()` — 만/억 변환 없이 입력값 그대로, 쉼표만 추가 (`toLocaleString` with `maximumFractionDigits: 10`)
- **지정가 도달 알림** (`lib/price-alert.ts`):
  - 2차/3차 매수가: 현재가 ≤ 설정가 (기본), "X이하" / "X이상 Y이하" 한국어 조건식 + `~X` / `X~Y` 범위 연산자 파싱
  - 익절가: 현재가 ≥ 설정가 (기본), "X이상" / `X~` 파싱
  - `~` 연산자: `~X`=이하, `X~`=이상, `X~Y`=범위
  - 도달 시: 카드 배경에 하단→상단 linear-gradient (종목 고유 색, 50% 불투명도) + 연한 테두리
  - 도달한 가격 박스에 종목색 링 테두리(boxShadow) + "↓ 도달" / "↑ 도달" 배지(종목색)
  - 도달 박스 우상단 ✓ 버튼 — 탭 시 가격 초기화(Sheets 저장) + `액션로그` 시트에 이력 append
  - `dashboard-client.tsx`에서 `filtered` 정렬 시 도달 카드 상단 배치
  - Card에 `h-full` → CSS Grid stretch로 같은 행 카드 높이 자동 통일
- **대응 메모 박스**: 항상 표시. 값 없으면 흐린 "대응 메모" placeholder. 우측 연필 아이콘. `line-clamp-3`
- **바텀시트 모달**: `position: fixed; bottom: 0` + `window.innerHeight + resize` 리스너로 키보드 바로 위에 위치
  - `body.position = 'fixed'`으로 배경 스크롤 잠금
  - `window.innerHeight` 기준 `top` 계산 → 키보드 열리면 innerHeight 감소 → 자동 재배치
- 입력창 `font-size: 16px` (iOS 자동 줌 방지)

## DomesticStockCard (domestic-stock-card.tsx)

국내주식 카테고리에서만 표시. 3개 카드 (1티어 / 2티어 / 3티어).

| 항목 | 내용 |
|------|------|
| 색상 | 1티어 `#F5A623`, 2티어 `#8B8FA8`, 3티어 `#CD7F32` |
| 기본 목표비중 | 1티어 40%, 2티어 35%, 3티어 30% (편집 가능, Sheets에 저장) |
| 진행바 | heldRatio(I열 합산) / targetRatio × 100% |
| 1종목당 목표 | `자산현황!E2` × targetRatio% ÷ 티어 종목 수 |
| 하단 3칸 그리드 | 1종목당 목표 / 목표 비중(✏ 편집) / 종목 리스트 |
| 종목 리스트 | 버튼 탭 → 바텀시트 (A열 종목명 목록, max-height 55vh, 스크롤) |
| 목표비중 저장 방식 | 로컬 state + `/api/update-tier-target` POST → Sheets `H1:J1` 쓰기 (전체 공유) |
| **종목수 집계** | `evalAmount > 0`인 보유 종목만 카운트. `excluded=true`(N열 Y) 종목은 count/heldRatio/종목리스트 모두 제외 |

## 아이콘 & 파비콘

| 파일 | 용도 |
|------|------|
| `public/apple-touch-icon.png` | iOS 홈화면 아이콘 (180×180px) |
| `public/favicon.png` | 브라우저 파비콘 |

`app/layout.tsx` metadata에서 `icons.apple` / `icons.icon` 으로 연결. 아이콘 교체 시 두 파일만 덮어쓰면 됨.

## 카드 UI 상수

- 카드 배경: `#1A1A1E`
- 진행바 트랙: `#2A2A2E`, 높이 `h-2`
- 매수가 박스 배경: `#252528`
- 익절가 박스 배경: `#1E2820` (녹색 tint)
- 은(SLV) 진행바: `#959595`

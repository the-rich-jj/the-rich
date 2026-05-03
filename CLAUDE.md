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
| `비중관리(미국)` | `B3:I20` | 미국주식 (B=종목, C=티커, D=보유액, G=목표액, H=이동금액, **I=현재가 KRW**) |
| `매매가관리` | `A2:G30` | 매수가/익절가 (A=종목, B=2차매수가, C=메모, D=3차매수가, E=메모, F=익절가, G=메모) |
| `주식(국내)` | `A2:I100` | 국내주식 (A=종목명, C=티어, H=평가금, I=보유비율%) |
| `금&은` | `D10:D35` | 원자재 현재가 (D10=금 KRW, D15=은 USD, D25=구리/FCX USD, D35=천연가스/LNG USD) |
| `현금` | `M1` | 원달러 환율 (KRW, `₩1,471.32` 형식) |

**쓰기:** `매매가관리` 시트에 A열로 종목 찾아 해당 행 B~G열 업데이트  
**쓰기:** `자산현황!H1:J1` — 티어 목표비중 (updateTierTarget)

### 현재가 계산 방식

```
parseNum(v) = parseFloat(v.replace(/[₩$\s,]/g, ''))   ← ₩/$/ 공백/쉼표 모두 제거

금          → parseNum(D10)                 KRW 그대로
은/구리/천연가스 → parseNum(Dxx) × 환율     USD → KRW 환산
미국주식    → parseNum(I열)                 KRW 그대로 (시트에서 이미 환산됨)
환율        → parseNum(현금!M1) || 1350
```

## 아키텍처 & 핵심 파일

```
app/
  page.tsx                          # Server Component — fetchAssetData() 호출, revalidate=0
  layout.tsx
  globals.css
  api/update-price/route.ts         # POST — 매매가관리 시트 셀 업데이트
  api/update-tier-target/route.ts   # POST — 자산현황 H1:J1 티어 목표비중 업데이트

components/
  dashboard-client.tsx      # Client Component — 카테고리/검색 상태, ASSET_CONFIG, 티어 targets
  dashboard-header.tsx      # 카테고리 탭 + 검색창 (font-size 16px → iOS zoom 방지)
  asset-card.tsx            # 종목 카드 (진행바, 툴팁, 바텀시트 편집 모달)
  domestic-stock-card.tsx   # 국내주식 티어 카드 (1/2/3티어) + 종목 리스트 바텀시트

lib/
  google-sheets.ts          # Google Sheets API — fetchAssetData() + updatePriceCell() + updateTierTarget()
```

## 카테고리 & ASSET_CONFIG

카테고리 탭 순서: **전체 → 원자재 → 미국주식 → 국내주식 → 암호화폐**

`ASSET_CONFIG`는 `dashboard-client.tsx`에 정의. 미국주식은 시트 C열 티커 우선(`asset.ticker`), `...config` 이후에 symbol 덮어쓰는 순서 주의.

**전체 탭 렌더링**: 원자재 → 미국주식 → 국내주식(티어카드 3개) → 암호화폐 순서로 모두 표시. 검색 시 티어카드도 종목명 기준으로 필터링 포함.

**탭 UX**:
- 탭 클릭 시 `scrollIntoView({ behavior: 'smooth', inline: 'nearest' })` — 잘린 탭을 온전히 보이게 스크롤
- 탭 클릭(같은 탭 포함) 시 `window.scrollTo({ top: 0, behavior: 'smooth' })` — 콘텐츠 맨 위로 이동

**PC 레이아웃**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## AssetCard (asset-card.tsx)

- 종목별 진행바: `currentAmount / targetAmount * 100%`
- 헤더: 종목명 + 심볼 · 현재가(KRW) 표시 — `currentPriceKRW` prop
- 추가금액 옆 구매 가능 수량 자동계산: `+219만 추가 (≈2주)` — `Math.floor(transferAmount / currentPriceKRW)`
- 가격 박스(2차매수가/3차매수가/익절가) 탭 → 툴팁(메모 미리보기) → 바텀시트 편집
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

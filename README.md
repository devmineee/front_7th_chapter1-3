# 과제 3 - 캘린더 일정 관리 애플리케이션

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [기능](#기능)
- [설치 및 실행](#설치-및-실행)
- [테스트](#테스트)
- [시각적 회귀 테스트 (Storybook & Chromatic)](#시각적-회귀-테스트-storybook--chromatic)
- [과제 체크리스트](#과제-체크리스트)

---

## 프로젝트 소개

React와 TypeScript를 사용한 캘린더 일정 관리 애플리케이션입니다.  
드래그 앤 드롭, 반복 일정, 알림 시스템, 검색 및 필터링 등의 기능을 제공합니다.

### 기술 스택

- **Frontend**: React 19, TypeScript, Material-UI
- **상태 관리**: Custom Hooks
- **테스트**: Vitest (Unit), Playwright (E2E), Storybook + Chromatic (Visual Regression)
- **빌드 도구**: Vite
- **기타**: DnD Kit (드래그 앤 드롭), Notistack (알림)

---

## 기능

### 필수 스펙

- ✅ **드래그 앤 드롭(D&D)**: 캘린더의 일정을 마우스로 끌어 다른 날짜나 시간으로 이동
- ✅ **날짜 클릭으로 일정 생성**: 캘린더의 비어있는 날짜 셀을 클릭하면 해당 날짜가 자동으로 폼에 입력

### 주요 기능

- 일정 CRUD (생성, 조회, 수정, 삭제)
- 반복 일정 (매일, 매주, 매월, 매년)
- 일정 겹침 경고
- 알림 시스템 (1분 전, 10분 전, 1시간 전, 2시간 전, 1일 전)
- 주간/월간 캘린더 뷰
- 일정 검색 및 필터링
- 공휴일 표시

---

## 설치 및 실행

### 사전 요구사항

- Node.js 20+
- pnpm 8+

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
# 프론트엔드 + API 서버 동시 실행
pnpm dev

# 프론트엔드만 실행
pnpm start

# API 서버만 실행
pnpm server
```

- 프론트엔드: http://localhost:5173
- API 서버: http://localhost:3000

### 프로덕션 빌드

```bash
pnpm build
```

---

## 테스트

### Unit 테스트 (Vitest)

```bash
# 테스트 실행
pnpm test

# 테스트 UI
pnpm test:ui

# 커버리지 확인
pnpm test:coverage
```

### E2E 테스트 (Playwright)

```bash
# E2E 테스트 실행
npx playwright test

# UI 모드로 실행
npx playwright test --ui

# 특정 테스트만 실행
npx playwright test e2e_tests/commonEvent.spec.ts
```

#### E2E 테스트 시나리오

1. ✅ 기본 일정 관리 워크플로우 (CRUD)
2. ✅ 반복 일정 관리 워크플로우
3. ✅ 일정 겹침 처리
4. ✅ 알림 시스템
5. ✅ 검색 및 필터링

---

## 시각적 회귀 테스트 (Storybook & Chromatic)

### Storybook 실행

```bash
pnpm storybook
```

브라우저에서 http://localhost:6006 접속

### Chromatic 설정 및 사용법

자세한 설정 방법은 [CHROMATIC_SETUP.md](./CHROMATIC_SETUP.md)를 참고하세요.

#### 빠른 시작

1. **Chromatic 프로젝트 생성**

   - https://www.chromatic.com/ 접속
   - GitHub 계정으로 로그인
   - 프로젝트 생성 후 토큰 복사

2. **GitHub Secrets 설정**

   - GitHub 저장소 > Settings > Secrets and variables > Actions
   - `CHROMATIC_PROJECT_TOKEN` 추가

3. **로컬에서 실행**

   ```bash
   # 환경 변수 설정 (Windows PowerShell)
   $env:CHROMATIC_PROJECT_TOKEN="your-token-here"

   # Chromatic 실행
   pnpm chromatic
   ```

#### 시각적 회귀 테스트 시나리오

1. ✅ **타입별 캘린더 뷰 렌더링** (`CalendarView.stories.tsx`)

   - Week View / Month View
   - 다수 일정 / 빈 캘린더

2. ✅ **일정 상태별 시각적 표현** (`EventStates.stories.tsx`)

   - 일반 일정 / 알림 발생 일정
   - 반복 일정 (매일, 매주, 매월, 매년)
   - 짧은/긴 제목 처리

3. ✅ **다이얼로그 및 모달** (`Dialogs.stories.tsx`)

   - 일정 겹침 경고 다이얼로그
   - 반복 일정 편집/삭제/드래그 다이얼로그

4. ✅ **폼 컨트롤 상태** (`FormControls.stories.tsx`)

   - 빈 폼 / 채워진 폼
   - 에러 상태 (시간 검증)
   - 반복 일정 옵션
   - 드롭다운 상태

5. ✅ **텍스트 길이 처리** (`TextLength.stories.tsx`)
   - 짧은/중간/긴/매우 긴 텍스트
   - 아이콘과 함께 있는 텍스트
   - 반응형 처리

### GitHub Actions 연동

- PR 생성 시 자동으로 Chromatic 빌드 실행
- `main` 브랜치 push 시 자동으로 베이스라인 업데이트
- Workflow 파일: `.github/workflows/chromatic.yml`

---

## 과제 체크리스트

### 필수 스펙

- ✅ 드래그 앤 드롭(D&D) 기능 개발
- ✅ 날짜 클릭으로 일정 생성 기능 개발

### 기본과제 (E2E 테스트)

1. ✅ 기본 일정 관리 워크플로우 전반 검증 (`commonEvent.spec.ts`)
2. ✅ 반복 일정 관리 워크플로우 전반 검증 (`recurringEvent.spec.ts`)
3. ✅ 일정 겹침 처리 방식 검증 (`overlap.spec.ts`)
4. ✅ 알림 시스템 관련 노출 조건 검증 (`notifications.spec.ts`)
5. ✅ 검색 및 필터링 전반 검증 (`search.spec.ts`)

### 심화과제 (시각적 회귀 테스트)

1. ✅ 타입에 따른 캘린더 뷰 렌더링
2. ✅ 일정 상태별 시각적 표현
3. ✅ 다이얼로그 및 모달
4. ✅ 폼 컨트롤 상태
5. ✅ 각 셀 텍스트 길이에 따른 처리

---

## 프로젝트 구조

```
├── .github/
│   └── workflows/
│       └── chromatic.yml          # Chromatic CI/CD
├── .storybook/                    # Storybook 설정
│   ├── main.ts
│   ├── preview.ts
│   └── preview-head.html
├── e2e_tests/                     # E2E 테스트
│   ├── commonEvent.spec.ts
│   ├── recurringEvent.spec.ts
│   ├── overlap.spec.ts
│   ├── notifications.spec.ts
│   └── search.spec.ts
├── src/
│   ├── components/                # React 컴포넌트
│   ├── hooks/                     # Custom Hooks
│   ├── stories/                   # Storybook 스토리
│   │   ├── CalendarView.stories.tsx
│   │   ├── EventStates.stories.tsx
│   │   ├── Dialogs.stories.tsx
│   │   ├── FormControls.stories.tsx
│   │   └── TextLength.stories.tsx
│   ├── utils/                     # 유틸리티 함수
│   ├── __tests__/                 # Unit 테스트
│   ├── App.tsx
│   └── main.tsx
├── CHROMATIC_SETUP.md             # Chromatic 상세 가이드
├── package.json
└── README.md
```

---

## 라이선스

MIT

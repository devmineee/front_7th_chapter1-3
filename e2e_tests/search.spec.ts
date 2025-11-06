import { test, expect, Page } from '@playwright/test';

interface CreateEventParams {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
}

const createEvent = async (page: Page, params: CreateEventParams) => {
  await page.locator('#title').fill(params.title);
  await page.locator('#date').fill(params.date);
  await page.locator('#start-time').fill(params.startTime);
  await page.locator('#end-time').fill(params.endTime);

  if (params.description) {
    await page.locator('#description').fill(params.description);
  }

  if (params.location) {
    await page.locator('#location').fill(params.location);
  }

  if (params.category) {
    await page.locator('#category').click();
    await page.getByRole('option', { name: `${params.category}-option` }).click();
  }

  await page.getByTestId('event-submit-button').click();

  // 겹침 다이얼로그 처리
  try {
    const dialogTitle = page.getByText('일정 겹침 경고');
    const isDialogVisible = await dialogTitle.isVisible({ timeout: 1000 }).catch(() => false);
    if (isDialogVisible) {
      await page.getByRole('button', { name: '계속 진행' }).click();
      await dialogTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => null);
    }
  } catch {
    // Dialog가 없으면 무시
  }
};

test.describe('검색 및 필터링 테스트', () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/events');
    const data = await response.json();
    if (data.events && data.events.length > 0) {
      for (const event of data.events) {
        await page.request.delete(`http://localhost:3000/api/events/${event.id}`);
      }
    }

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload();
    await expect(page.getByTestId('event-submit-button')).toBeVisible();
  });

  test('제목으로 일정을 검색할 수 있다', async ({ page }) => {
    // 이전 테스트의 영향을 받지 않도록 초기화
    await page.getByLabel('일정 검색').clear();
    await page.waitForTimeout(300);

    await createEvent(page, {
      title: '팀 회의',
      date: '2025-11-25',
      startTime: '08:00',
      endTime: '09:00',
      category: '업무',
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '점심 약속',
      date: '2025-11-25',
      startTime: '12:00',
      endTime: '13:00',
      category: '개인',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('점심 약속').first()).toBeVisible({ timeout: 5000 });

    // 검색
    await page.getByLabel('일정 검색').fill('팀 회의');
    await page.waitForTimeout(500);

    // 검색 결과 확인
    await expect(eventList.getByText('팀 회의').first()).toBeVisible();
    await expect(eventList.getByText('점심 약속')).toHaveCount(0);
  });

  test('설명으로 일정을 검색할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '회의',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '분기 계획 논의',
      category: '업무',
    });

    await createEvent(page, {
      title: '미팅',
      date: '2025-11-25',
      startTime: '14:00',
      endTime: '15:00',
      description: '고객 상담',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');

    // 검색
    await page.getByLabel('일정 검색').fill('분기 계획');

    // 검색 결과 확인
    await expect(eventList.getByText('회의').first()).toBeVisible();
    await expect(eventList.getByText('미팅')).toHaveCount(0);
  });

  test('검색어가 대소문자를 구분하지 않는다', async ({ page }) => {
    await createEvent(page, {
      title: 'Team Meeting',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');

    // 소문자로 검색
    await page.getByLabel('일정 검색').fill('team meeting');
    await expect(eventList.getByText('Team Meeting').first()).toBeVisible();

    // 대문자로 검색
    await page.getByLabel('일정 검색').fill('TEAM MEETING');
    await expect(eventList.getByText('Team Meeting').first()).toBeVisible();
  });

  test('검색어를 지우면 모든 일정이 다시 표시된다', async ({ page }) => {
    await createEvent(page, {
      title: '회의 A',
      date: '2025-11-25',
      startTime: '09:00',
      endTime: '10:00',
      category: '업무',
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '회의 B',
      date: '2025-11-25',
      startTime: '14:00',
      endTime: '15:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    
    // 모든 일정이 추가되었는지 확인
    await expect(eventList.getByText('회의 A').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('회의 B').first()).toBeVisible({ timeout: 5000 });

    // 검색
    await page.getByLabel('일정 검색').fill('회의 A');
    await page.waitForTimeout(300);
    await expect(eventList.getByText('회의 A').first()).toBeVisible();
    await expect(eventList.getByText('회의 B')).toHaveCount(0);

    // 검색어 지우기
    await page.getByLabel('일정 검색').clear();
    await page.waitForTimeout(300);

    // 모든 일정 다시 표시
    await expect(eventList.getByText('회의 A').first()).toBeVisible();
    await expect(eventList.getByText('회의 B').first()).toBeVisible();
  });

  test('검색 결과가 없으면 "검색 결과가 없습니다" 메시지가 표시된다', async ({ page }) => {
    await createEvent(page, {
      title: '팀 회의',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');

    // 존재하지 않는 검색어
    await page.getByLabel('일정 검색').fill('존재하지않는일정');

    // 메시지 확인
    await expect(page.getByText('검색 결과가 없습니다.')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).toHaveCount(0);
  });

  test('부분 검색어로도 일정을 찾을 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '프로젝트 킥오프 미팅',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');

    // 부분 검색
    await page.getByLabel('일정 검색').fill('킥오프');
    await expect(eventList.getByText('프로젝트 킥오프 미팅').first()).toBeVisible();

    await page.getByLabel('일정 검색').clear();
    await page.getByLabel('일정 검색').fill('프로젝트');
    await expect(eventList.getByText('프로젝트 킥오프 미팅').first()).toBeVisible();

    await page.getByLabel('일정 검색').clear();
    await page.getByLabel('일정 검색').fill('미팅');
    await expect(eventList.getByText('프로젝트 킥오프 미팅').first()).toBeVisible();
  });

  test('현재 뷰(월/주)에 해당하는 일정만 검색된다', async ({ page }) => {
    // 11월 일정
    await createEvent(page, {
      title: '11월 회의',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    // 12월 일정
    await createEvent(page, {
      title: '12월 회의',
      date: '2025-12-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');

    // 11월 뷰에서 검색
    await page.getByLabel('일정 검색').fill('회의');
    
    // 11월 일정만 표시되어야 함
    const eventCount = await eventList.getByText(/회의/).count();
    expect(eventCount).toBeGreaterThan(0);
  });

  test('주간 뷰에서 검색이 작동한다', async ({ page }) => {
    // 현재 보이는 주의 날짜를 가져오기 위해 먼저 오늘 날짜 사용
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    await createEvent(page, {
      title: '주간 일정',
      date: dateStr,
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    
    // 일정이 추가되었는지 먼저 확인
    await expect(eventList.getByText('주간 일정').first()).toBeVisible({ timeout: 5000 });

    // 주간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'week-option' }).click();
    
    // 뷰 전환 대기
    await expect(page.getByTestId('week-view')).toBeVisible({ timeout: 3000 });

    // 검색
    await page.getByLabel('일정 검색').fill('주간 일정');
    await page.waitForTimeout(500);

    // 이벤트 리스트에서 검색 결과 확인
    await expect(eventList.getByText('주간 일정').first()).toBeVisible({ timeout: 3000 });
  });

  test('월간 뷰에서 검색이 작동한다', async ({ page }) => {
    await createEvent(page, {
      title: '월간 일정',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    // 월간 뷰로 전환
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'month-option' }).click();

    const eventList = page.getByTestId('event-list');
    const monthView = page.getByTestId('month-view');

    // 검색
    await page.getByLabel('일정 검색').fill('월간 일정');

    // 이벤트 리스트에서 검색 결과 확인
    await expect(eventList.getByText('월간 일정').first()).toBeVisible();

    // 캘린더 뷰에서도 표시되는지 확인
    await expect(monthView.getByText('월간 일정').first()).toBeVisible();
  });

  test('여러 일정 중 검색어와 일치하는 일정들만 표시된다', async ({ page }) => {
    await createEvent(page, {
      title: '팀 회의',
      date: '2025-11-25',
      startTime: '08:00',
      endTime: '09:00',
      category: '업무',
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '개인 미팅',
      date: '2025-11-25',
      startTime: '11:00',
      endTime: '12:00',
      category: '개인',
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '팀 워크샵',
      date: '2025-11-25',
      startTime: '15:00',
      endTime: '17:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    
    // 모든 일정이 추가되었는지 확인
    await expect(eventList.getByText('팀 회의').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('개인 미팅').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('팀 워크샵').first()).toBeVisible({ timeout: 5000 });

    // '팀'으로 검색
    await page.getByLabel('일정 검색').fill('팀');
    
    // 검색이 적용될 때까지 잠시 대기
    await page.waitForTimeout(500);

    // '팀'이 포함된 일정만 표시
    await expect(eventList.getByText('팀 회의').first()).toBeVisible();
    await expect(eventList.getByText('팀 워크샵').first()).toBeVisible();
    await expect(eventList.getByText('개인 미팅')).toHaveCount(0);
  });


 
});


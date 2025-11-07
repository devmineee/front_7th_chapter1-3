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

const createEvent = async (page: Page, params: CreateEventParams, acceptOverlap = false) => {
  await page.locator('#title').fill(params.title);
  await page.locator('#date').fill(params.date);
  await page.locator('#start-time').fill(params.startTime);
  await page.locator('#end-time').fill(params.endTime);

  if (params.description) {
    await page.getByLabel('설명').fill(params.description);
  }

  if (params.location) {
    await page.getByLabel('위치').fill(params.location);
  }

  if (params.category) {
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: `${params.category}-option` }).click();
  }

  await page.getByTestId('event-submit-button').click();

  // 겹침 다이얼로그 처리
  try {
    const dialogTitle = page.getByText('일정 겹침 경고');
    const isDialogVisible = await dialogTitle.isVisible({ timeout: 1000 }).catch(() => false);
    if (isDialogVisible) {
      if (acceptOverlap) {
        await page.getByRole('button', { name: '계속 진행' }).click();
        await dialogTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => null);
      } else {
        await page.getByRole('button', { name: '취소' }).click();
        await dialogTitle.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => null);
      }
    }
  } catch {
    // Dialog가 없으면 무시
  }
};

test.describe('일정 겹침 검증 테스트', () => {
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

  test('같은 시간에 일정을 추가하면 겹침 경고가 표시된다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '회의 A',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의 A').first()).toBeVisible();

    // 두 번째 일정 추가 (같은 시간)
    await page.getByLabel('제목').fill('회의 B');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
    await expect(page.getByText('다음 일정과 겹칩니다:')).toBeVisible();
    await expect(page.getByText(/회의 A.*10:00-11:00/)).toBeVisible();
  });

  test('시간이 부분적으로 겹치는 일정을 추가하면 경고가 표시된다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '점심 약속',
      date: '2025-11-25',
      startTime: '12:00',
      endTime: '13:00',
      category: '개인',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('점심 약속').first()).toBeVisible();

    // 두 번째 일정 추가 (부분적으로 겹침)
    await page.getByLabel('제목').fill('카페 미팅');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('12:30');
    await page.getByLabel('종료 시간').fill('13:30');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('겹침 경고에서 "취소"를 선택하면 일정이 추가되지 않는다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '팀 미팅',
      date: '2025-11-25',
      startTime: '14:00',
      endTime: '15:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 미팅').first()).toBeVisible();

    // 두 번째 일정 추가 시도 (겹침, 취소 선택)
    await createEvent(
      page,
      {
        title: '프레젠테이션',
        date: '2025-11-25',
        startTime: '14:30',
        endTime: '15:30',
        category: '업무',
      },
      false // acceptOverlap = false
    );

    // 두 번째 일정이 추가되지 않았는지 확인
    await expect(eventList.getByText('프레젠테이션')).toHaveCount(0);
    // 첫 번째 일정은 여전히 존재
    await expect(eventList.getByText('팀 미팅').first()).toBeVisible();
  });

  test('겹침 경고에서 "계속 진행"을 선택하면 일정이 추가된다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '세미나',
      date: '2025-11-25',
      startTime: '16:00',
      endTime: '17:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('세미나').first()).toBeVisible();

    // 두 번째 일정 추가 (겹침, 계속 진행)
    await createEvent(
      page,
      {
        title: '워크샵',
        date: '2025-11-25',
        startTime: '16:30',
        endTime: '17:30',
        category: '업무',
      },
      true // acceptOverlap = true
    );

    // 두 일정 모두 존재하는지 확인
    await expect(eventList.getByText('세미나').first()).toBeVisible();
    await expect(eventList.getByText('워크샵').first()).toBeVisible();
  });

  test('하나의 일정이 다른 일정을 완전히 포함하는 경우 경고가 표시된다', async ({ page }) => {
    // 첫 번째 일정 추가 (짧은 일정)
    await createEvent(page, {
      title: '코드 리뷰',
      date: '2025-11-25',
      startTime: '10:30',
      endTime: '11:30',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('코드 리뷰').first()).toBeVisible();

    // 두 번째 일정 추가 (긴 일정, 첫 번째를 포함)
    await page.getByLabel('제목').fill('전체 회의');
    await page.getByLabel('날짜').fill('2025-11-25');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('12:00');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 다이얼로그 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible();
  });

  test('연속된 일정(끝나는 시간 = 시작 시간)은 겹치지 않는다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '오전 수업',
      date: '2025-11-25',
      startTime: '09:00',
      endTime: '10:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('오전 수업').first()).toBeVisible();

    // 두 번째 일정 추가 (연속)
    await createEvent(page, {
      title: '오후 수업',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    // 겹침 경고 없이 추가되어야 함
    await expect(eventList.getByText('오후 수업').first()).toBeVisible();
    await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();
  });

  test('다른 날짜의 같은 시간 일정은 겹치지 않는다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '월요일 미팅',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('월요일 미팅').first()).toBeVisible();

    // 두 번째 일정 추가 (다른 날짜, 같은 시간)
    await createEvent(page, {
      title: '화요일 미팅',
      date: '2025-11-26',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
    });

    // 겹침 경고 없이 추가되어야 함
    await expect(eventList.getByText('화요일 미팅').first()).toBeVisible();
    await expect(page.getByText('일정 겹침 경고')).not.toBeVisible();
  });

  test('여러 일정과 겹치는 경우 모든 겹치는 일정을 표시한다', async ({ page }) => {
    // 첫 번째 일정 추가
    await createEvent(page, {
      title: '일정 1',
      date: '2025-11-25',
      startTime: '13:00',
      endTime: '14:00',
      category: '업무',
    });

    await page.waitForTimeout(500);

    // 두 번째 일정 추가
    await createEvent(
      page,
      {
        title: '일정 2',
        date: '2025-11-25',
        startTime: '13:30',
        endTime: '14:30',
        category: '업무',
      },
      true
    );

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('일정 1').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('일정 2').first()).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(500);

    // 세 번째 일정 추가 (둘 다와 겹침)
    await page.locator('#title').fill('일정 3');
    await page.locator('#date').fill('2025-11-25');
    await page.locator('#start-time').fill('13:15');
    await page.locator('#end-time').fill('14:15');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고에 두 일정 모두 표시되는지 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
    const dialogContent = page.locator('[role="dialog"]');
    await expect(dialogContent.getByText(/일정 1.*13:00-14:00/)).toBeVisible();
    await expect(dialogContent.getByText(/일정 2.*13:30-14:30/)).toBeVisible();
  });

  test('일정 수정 시 다른 일정과 겹치면 경고가 표시된다', async ({ page }) => {
    // 두 일정 추가
    await createEvent(page, {
      title: '아침 일정',
      date: '2025-11-25',
      startTime: '07:00',
      endTime: '08:00',
      category: '업무',
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '점심 일정',
      date: '2025-11-25',
      startTime: '12:00',
      endTime: '13:00',
      category: '개인',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('아침 일정').first()).toBeVisible({ timeout: 5000 });
    await expect(eventList.getByText('점심 일정').first()).toBeVisible({ timeout: 5000 });

    await page.waitForTimeout(500);

    // 점심 일정 수정 (아침 일정과 겹치도록)
    const eventCards = eventList.locator('div').filter({ hasText: '점심 일정' });
    await eventCards.first().getByLabel('Edit event').click({ force: true });

    await expect(page.locator('#title')).toHaveValue('점심 일정', { timeout: 3000 });
    await page.locator('#start-time').fill('07:30');
    await page.locator('#end-time').fill('08:30');
    await page.getByTestId('event-submit-button').click();

    // 겹침 경고 확인
    await expect(page.getByText('일정 겹침 경고')).toBeVisible({ timeout: 5000 });
  });
});

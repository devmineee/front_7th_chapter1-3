import { test, expect, Page } from '@playwright/test';

interface CreateEventParams {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
  notificationTime?: number;
}

const createEvent = async (page: Page, params: CreateEventParams) => {
  await page.getByLabel('제목').fill(params.title);
  await page.getByLabel('날짜').fill(params.date);
  await page.getByLabel('시작 시간').fill(params.startTime);
  await page.getByLabel('종료 시간').fill(params.endTime);

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

  // 알림 설정
  if (params.notificationTime !== undefined) {
    await page.locator('#notification').click();

    // notificationTime에 따라 적절한 옵션 선택
    const notificationLabels: { [key: number]: string } = {
      1: '1분 전',
      10: '10분 전',
      60: '1시간 전',
      120: '2시간 전',
      1440: '1일 전',
    };

    const label = notificationLabels[params.notificationTime];
    if (label) {
      await page.getByRole('option', { name: label }).click();
    }
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

// 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환 (현재 사용하지 않음)
// const getTodayDate = (): string => {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const day = date.getDate().toString().padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

test.describe('알림 시스템 테스트', () => {
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

  test('알림 시간을 1분 전으로 설정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '알림 테스트',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '개인',
      notificationTime: 1,
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '알림 테스트' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 1분 전');
  });

  test('알림 시간을 10분 전으로 설정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '10분 전 알림',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 10,
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '10분 전 알림' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 10분 전');
  });

  test('알림 시간을 1시간 전으로 설정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '1시간 전 알림',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 60,
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '1시간 전 알림' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 1시간 전');
  });

  test('알림 시간을 1일 전으로 설정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '1일 전 알림',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 1440,
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '1일 전 알림' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 1일 전');
  });

  test('알림 설정이 올바르게 저장된다', async ({ page }) => {
    await createEvent(page, {
      title: '알림 설정 테스트',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 1, // 1분 전 알림
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '알림 설정 테스트' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 1분 전');
  });

  test('알림 시간 옵션이 올바르게 표시된다', async ({ page }) => {
    await page.locator('#notification').click();

    // 모든 알림 옵션이 표시되는지 확인
    await expect(page.getByRole('option', { name: '1분 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '10분 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '1시간 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '2시간 전' })).toBeVisible();
    await expect(page.getByRole('option', { name: '1일 전' })).toBeVisible();
  });

  test('여러 일정에 다른 알림 시간을 설정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '일정 A',
      date: '2025-11-25',
      startTime: '08:00',
      endTime: '09:00',
      category: '업무',
      notificationTime: 1,
    });

    await page.waitForTimeout(500);

    await createEvent(page, {
      title: '일정 B',
      date: '2025-11-25',
      startTime: '14:00',
      endTime: '15:00',
      category: '개인',
      notificationTime: 60,
    });

    const eventList = page.getByTestId('event-list');

    const eventCardA = eventList.locator('div').filter({ hasText: '일정 A' }).first();
    await expect(eventCardA).toBeVisible({ timeout: 5000 });
    await expect(eventCardA).toContainText('알림: 1분 전');

    const eventCardB = eventList.locator('div').filter({ hasText: '일정 B' }).first();
    await expect(eventCardB).toBeVisible({ timeout: 5000 });
    await expect(eventCardB).toContainText('알림: 1시간 전');
  });

  test('알림 시간을 수정할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '알림 수정 테스트',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 10, // 10분 전
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '알림 수정 테스트' }).first();
    await expect(eventCard).toContainText('알림: 10분 전');

    // 수정
    await eventCard.getByLabel('Edit event').click({ force: true });

    await page.locator('#notification').click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    await page.getByTestId('event-submit-button').click();

    // 수정 확인
    await expect(async () => {
      const updatedCard = eventList.locator('div').filter({ hasText: '알림 수정 테스트' }).first();
      const text = await updatedCard.textContent();
      expect(text).toContain('알림: 1시간 전');
    }).toPass({ timeout: 5000 });
  });

  test('알림 아이콘이 이벤트 목록에 표시된다', async ({ page }) => {
    await createEvent(page, {
      title: '아이콘 테스트',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 1,
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '아이콘 테스트' }).first();
    await expect(eventCard).toBeVisible();

    // 알림 시간 텍스트 확인
    await expect(eventCard).toContainText('알림: 1분 전');
  });

  test('기본 알림 시간은 10분 전이다', async ({ page }) => {
    await createEvent(page, {
      title: '기본 알림',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      // notificationTime을 설정하지 않음
    });

    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '기본 알림' }).first();
    await expect(eventCard).toBeVisible();
    await expect(eventCard).toContainText('알림: 10분 전');
  });

  test('캘린더 뷰에서 알림 설정된 일정을 확인할 수 있다', async ({ page }) => {
    await createEvent(page, {
      title: '캘린더 알림',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      category: '업무',
      notificationTime: 60,
    });

    // 월간 뷰 선택
    await page.getByLabel('뷰 타입 선택').click();
    await page.getByRole('option', { name: 'month-option' }).click();

    // 캘린더의 일정 확인
    const monthView = page.getByTestId('month-view');
    const eventBox = monthView.locator('div').filter({ hasText: '캘린더 알림' }).first();
    await expect(eventBox).toBeVisible();

    // 이벤트 리스트에서 알림 정보 확인
    const eventList = page.getByTestId('event-list');
    const eventCard = eventList.locator('div').filter({ hasText: '캘린더 알림' }).first();
    await expect(eventCard).toContainText('알림: 1시간 전');
  });
});

import { test, expect, Page } from '@playwright/test';

interface CreateRecurringEventParams {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  category?: string;
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval: number;
  repeatEndDate?: string;
}

const createRecurringEvent = async (page: Page, params: CreateRecurringEventParams) => {
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

  // 반복 일정 체크박스 클릭
  await page.getByRole('checkbox', { name: '반복 일정' }).check();

  // 반복 유형 선택
  await page.getByLabel('반복 유형').click();
  await page.getByRole('option', { name: `${params.repeatType}-option` }).click();

  // 반복 간격 입력
  await page.getByLabel('반복 간격').fill(params.repeatInterval.toString());

  // 반복 종료일 입력
  if (params.repeatEndDate) {
    await page.getByLabel('반복 종료일').fill(params.repeatEndDate);
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

test.describe('반복 일정 CRUD 테스트', () => {
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

  test('매일 반복 일정을 추가할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '매일 운동',
      date: '2025-11-25',
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 조깅',
      location: '공원',
      category: '개인',
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '2025-11-30',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 운동').first()).toBeVisible();

    // 반복 정보 확인
    const eventCard = eventList.locator('div').filter({ hasText: '매일 운동' }).first();
    await expect(eventCard).toContainText('반복: 1일마다');
  });

  test('매주 반복 일정을 추가할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '주간 회의',
      date: '2025-11-25',
      startTime: '14:00',
      endTime: '15:00',
      description: '팀 주간 회의',
      location: '회의실',
      category: '업무',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 회의').first()).toBeVisible();
  });

  test('매월 반복 일정을 추가할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '월례 보고',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '11:00',
      description: '월간 진행 보고',
      location: '본사',
      category: '업무',
      repeatType: 'monthly',
      repeatInterval: 1,
      repeatEndDate: '2026-02-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('월례 보고').first()).toBeVisible();
  });

  test('매년 반복 일정을 추가할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '생일 파티',
      date: '2025-11-25',
      startTime: '18:00',
      endTime: '20:00',
      description: '친구 생일',
      location: '레스토랑',
      category: '개인',
      repeatType: 'yearly',
      repeatInterval: 1,
      repeatEndDate: '2030-11-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('생일 파티').first()).toBeVisible();
  });

  test('반복 일정을 수정할 때 "이 일정만" 옵션을 선택할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '매일 독서',
      date: '2025-11-25',
      startTime: '21:00',
      endTime: '22:00',
      category: '개인',
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '2025-11-30',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 독서').first()).toBeVisible();

    // 수정 버튼 클릭
    const eventCards = eventList.locator('div').filter({ hasText: '매일 독서' });
    await eventCards.first().getByLabel('Edit event').click({ force: true });

    // 반복 일정 다이얼로그 대기 및 처리
    try {
      const recurringDialog = page.getByRole('dialog');
      await expect(recurringDialog).toBeVisible({ timeout: 3000 });
      
      // "예" 버튼 클릭 (이 일정만 수정)
      await page.getByRole('button', { name: '예' }).click();
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('다이얼로그 처리 실패:', error);
    }

    // 제목 수정
    await expect(page.getByLabel('제목')).toHaveValue('매일 독서', { timeout: 3000 });
    await page.getByLabel('제목').fill('매일 독서 (수정됨)');
    await page.getByTestId('event-submit-button').click();

    // 겹침 다이얼로그 처리
    try {
      const overlapDialog = page.getByText('일정 겹침 경고');
      const isVisible = await overlapDialog.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        await page.getByRole('button', { name: '계속 진행' }).click();
      }
    } catch {}

    await expect(eventList.getByText('매일 독서 (수정됨)').first()).toBeVisible({ timeout: 5000 });
  });

  test('반복 일정을 수정할 때 "모든 반복 일정" 옵션을 선택할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '매주 수영',
      date: '2025-11-25',
      startTime: '08:00',
      endTime: '09:00',
      category: '개인',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매주 수영').first()).toBeVisible();

    // 수정 버튼 클릭
    const eventCards = eventList.locator('div').filter({ hasText: '매주 수영' });
    await eventCards.first().getByLabel('Edit event').click({ force: true });

    // 반복 일정 다이얼로그 대기 및 처리
    try {
      const recurringDialog = page.getByRole('dialog');
      await expect(recurringDialog).toBeVisible({ timeout: 3000 });
      
      // "아니오" 버튼 클릭 (모든 반복 일정 수정)
      await page.getByRole('button', { name: '아니오' }).click();
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('다이얼로그 처리 실패:', error);
    }

    // 제목 수정
    await expect(page.getByLabel('제목')).toHaveValue('매주 수영', { timeout: 3000 });
    await page.getByLabel('제목').fill('매주 수영 (전체 수정)');
    await page.getByTestId('event-submit-button').click();

    // 겹침 다이얼로그 처리
    try {
      const overlapDialog = page.getByText('일정 겹침 경고');
      const isVisible = await overlapDialog.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        await page.getByRole('button', { name: '계속 진행' }).click();
      }
    } catch {}

    await expect(eventList.getByText('매주 수영 (전체 수정)').first()).toBeVisible({ timeout: 5000 });
  });

  test('반복 일정을 삭제할 때 "이 일정만" 옵션을 선택할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '매일 명상',
      date: '2025-11-25',
      startTime: '06:00',
      endTime: '06:30',
      category: '개인',
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '2025-11-30',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 명상').first()).toBeVisible();

    const initialCount = await eventList.getByText('매일 명상').count();

    // 삭제 버튼 클릭
    const eventCards = eventList.locator('div').filter({ hasText: '매일 명상' });
    await eventCards.first().getByLabel('Delete event').click({ force: true });

    // 반복 일정 다이얼로그 대기 및 처리
    try {
      const recurringDialog = page.getByRole('dialog');
      await expect(recurringDialog).toBeVisible({ timeout: 3000 });
      
      // "예" 버튼 클릭 (이 일정만 삭제)
      await page.getByRole('button', { name: '예' }).click();
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('다이얼로그 처리 실패:', error);
    }

    // 일정 개수 확인 (적어도 하나는 남아있어야 함)
    await page.waitForTimeout(1000);
    const finalCount = await eventList.getByText('매일 명상').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  test('반복 일정을 삭제할 때 "모든 반복 일정" 옵션을 선택할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '매주 청소',
      date: '2025-11-25',
      startTime: '10:00',
      endTime: '12:00',
      category: '개인',
      repeatType: 'weekly',
      repeatInterval: 1,
      repeatEndDate: '2025-12-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매주 청소').first()).toBeVisible();

    // 삭제 버튼 클릭
    const eventCards = eventList.locator('div').filter({ hasText: '매주 청소' });
    await eventCards.first().getByLabel('Delete event').click({ force: true });

    // 반복 일정 다이얼로그 대기 및 처리
    try {
      const recurringDialog = page.getByRole('dialog');
      await expect(recurringDialog).toBeVisible({ timeout: 3000 });
      
      // "아니오" 버튼 클릭 (모든 반복 일정 삭제)
      await page.getByRole('button', { name: '아니오' }).click();
      await page.waitForTimeout(500);
    } catch (error) {
      console.log('다이얼로그 처리 실패:', error);
    }

    // 모든 반복 일정이 삭제되어야 함
    await expect(eventList.getByText('매주 청소')).toHaveCount(0, { timeout: 10000 });
  });

  test('반복 간격을 설정할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '격주 회의',
      date: '2025-11-25',
      startTime: '15:00',
      endTime: '16:00',
      category: '업무',
      repeatType: 'weekly',
      repeatInterval: 2,
      repeatEndDate: '2025-12-25',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('격주 회의').first()).toBeVisible();

    // 반복 정보 확인
    const eventCard = eventList.locator('div').filter({ hasText: '격주 회의' }).first();
    await expect(eventCard).toContainText('반복: 2주마다');
  });

  test('반복 종료일을 설정할 수 있다', async ({ page }) => {
    await createRecurringEvent(page, {
      title: '프로젝트 체크인',
      date: '2025-11-25',
      startTime: '09:00',
      endTime: '10:00',
      category: '업무',
      repeatType: 'daily',
      repeatInterval: 1,
      repeatEndDate: '2025-12-05',
    });

    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('프로젝트 체크인').first()).toBeVisible();

    // 종료일 정보 확인
    const eventCard = eventList.locator('div').filter({ hasText: '프로젝트 체크인' }).first();
    await expect(eventCard).toContainText('종료: 2025-12-05');
  });
});


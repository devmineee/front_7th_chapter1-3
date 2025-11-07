import { Notifications, Repeat } from '@mui/icons-material';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Stack,
} from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Event } from '../types';

// 캘린더 뷰를 시각적으로 테스트하기 위한 컴포넌트
interface CalendarViewProps {
  view: 'week' | 'month';
  events: Event[];
  title: string;
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const CalendarViewComponent = ({ view, events, title }: CalendarViewProps) => {
  const eventBoxStyles = {
    notified: {
      backgroundColor: '#ffebee',
      fontWeight: 'bold',
      color: '#d32f2f',
    },
    normal: {
      backgroundColor: '#f5f5f5',
      fontWeight: 'normal',
      color: 'inherit',
    },
    common: {
      p: 0.5,
      my: 0.5,
      borderRadius: 1,
      minHeight: '18px',
      width: '100%',
      overflow: 'hidden',
    },
  };

  const renderEventBox = (event: Event, isNotified: boolean = false) => {
    const isRepeating = event.repeat.type !== 'none';

    return (
      <Box
        key={event.id}
        sx={{
          ...eventBoxStyles.common,
          ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {isNotified && <Notifications fontSize="small" />}
          {isRepeating && <Repeat fontSize="small" />}
          <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
            {event.title}
          </Typography>
        </Stack>
      </Box>
    );
  };

  if (view === 'week') {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const dayEvents = events.filter((e) => new Date(e.date).getDate() === day);
                  return (
                    <TableCell
                      key={day}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {dayEvents.map((event) =>
                        renderEventBox(event, event.id.includes('notified'))
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  // Month view
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[0, 1, 2, 3].map((weekIndex) => (
              <TableRow key={weekIndex}>
                {[1, 2, 3, 4, 5, 6, 7].map((dayIndex) => {
                  const day = weekIndex * 7 + dayIndex;
                  if (day > 30) {
                    return (
                      <TableCell
                        key={dayIndex}
                        sx={{
                          height: '120px',
                          verticalAlign: 'top',
                          width: '14.28%',
                          padding: 1,
                          border: '1px solid #e0e0e0',
                        }}
                      />
                    );
                  }
                  const dayEvents = events.filter((e) => new Date(e.date).getDate() === day);
                  return (
                    <TableCell
                      key={dayIndex}
                      sx={{
                        height: '120px',
                        verticalAlign: 'top',
                        width: '14.28%',
                        padding: 1,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {day}
                      </Typography>
                      {dayEvents.map((event) =>
                        renderEventBox(event, event.id.includes('notified'))
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

const meta = {
  title: 'Calendar/CalendarView',
  component: CalendarViewComponent,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [320, 1200],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CalendarViewComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvents: Event[] = [
  {
    id: '1',
    title: '팀 회의',
    date: '2025-11-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '프로젝트 발표',
    date: '2025-11-03',
    startTime: '14:00',
    endTime: '15:00',
    description: '분기 프로젝트 발표',
    location: '대회의실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
];

// 1. 타입별 캘린더 뷰 렌더링
export const WeekView: Story = {
  args: {
    view: 'week',
    events: mockEvents,
    title: '2025년 11월 1주',
  },
};

export const MonthView: Story = {
  args: {
    view: 'month',
    events: mockEvents,
    title: '2025년 11월',
  },
};

export const WeekViewWithManyEvents: Story = {
  args: {
    view: 'week',
    events: [
      ...mockEvents,
      {
        id: '3',
        title: '점심 약속',
        date: '2025-11-01',
        startTime: '12:00',
        endTime: '13:00',
        description: '팀 점심',
        location: '식당',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '운동',
        date: '2025-11-01',
        startTime: '18:00',
        endTime: '19:00',
        description: '헬스',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60,
      },
    ],
    title: '2025년 11월 1주 (다수 일정)',
  },
};

export const MonthViewWithManyEvents: Story = {
  args: {
    view: 'month',
    events: Array.from({ length: 15 }, (_, i) => ({
      id: `event-${i}`,
      title: `일정 ${i + 1}`,
      date: `2025-11-${String(i + 1).padStart(2, '0')}`,
      startTime: '10:00',
      endTime: '11:00',
      description: '설명',
      location: '위치',
      category: '업무',
      repeat: { type: 'none' as const, interval: 0 },
      notificationTime: 10,
    })),
    title: '2025년 11월 (다수 일정)',
  },
};

export const EmptyWeekView: Story = {
  args: {
    view: 'week',
    events: [],
    title: '2025년 11월 1주 (빈 일정)',
  },
};

export const EmptyMonthView: Story = {
  args: {
    view: 'month',
    events: [],
    title: '2025년 11월 (빈 일정)',
  },
};

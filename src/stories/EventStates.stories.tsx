import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography, Tooltip } from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';
import { Event } from '../types';

// 일정 상태별 시각적 표현을 테스트하기 위한 컴포넌트
interface EventBoxProps {
  event: Event;
  isNotified?: boolean;
}

const EventBox = ({ event, isNotified = false }: EventBoxProps) => {
  const isRepeating = event.repeat.type !== 'none';

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

  const getRepeatTypeLabel = (type: string): string => {
    switch (type) {
      case 'daily':
        return '일';
      case 'weekly':
        return '주';
      case 'monthly':
        return '월';
      case 'yearly':
        return '년';
      default:
        return '';
    }
  };

  return (
    <Box
      sx={{
        ...eventBoxStyles.common,
        ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
        width: '300px',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {isNotified && <Notifications fontSize="small" />}
        {isRepeating && (
          <Tooltip
            title={`${event.repeat.interval}${getRepeatTypeLabel(event.repeat.type)}마다 반복${
              event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
            }`}
          >
            <Repeat fontSize="small" />
          </Tooltip>
        )}
        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
          {event.title}
        </Typography>
      </Stack>
    </Box>
  );
};

const meta = {
  title: 'Calendar/EventStates',
  component: EventBox,
  parameters: {
    layout: 'centered',
    chromatic: {
      delay: 300,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EventBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. 일정 상태별 시각적 표현
export const NormalEvent: Story = {
  args: {
    event: {
      id: '1',
      title: '일반 일정',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '일반 일정입니다',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const NotifiedEvent: Story = {
  args: {
    event: {
      id: '2',
      title: '알림 발생 일정',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '알림이 발생한 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotified: true,
  },
};

export const DailyRepeatingEvent: Story = {
  args: {
    event: {
      id: '3',
      title: '매일 반복 일정',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '매일 반복되는 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const WeeklyRepeatingEvent: Story = {
  args: {
    event: {
      id: '4',
      title: '주간 반복 일정',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '매주 반복되는 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const NotifiedRepeatingEvent: Story = {
  args: {
    event: {
      id: '5',
      title: '알림 + 반복 일정',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '알림이 발생한 반복 일정',
      location: '회의실',
      category: '업무',
      repeat: { type: 'weekly', interval: 2 },
      notificationTime: 10,
    },
    isNotified: true,
  },
};

export const ShortTitle: Story = {
  args: {
    event: {
      id: '6',
      title: '짧음',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '짧은 제목',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const LongTitle: Story = {
  args: {
    event: {
      id: '7',
      title: '매우 긴 제목을 가진 일정으로 텍스트가 잘리는지 확인하기 위한 테스트 케이스입니다',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '긴 제목',
      location: '회의실',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    isNotified: false,
  },
};

export const LongTitleWithIcons: Story = {
  args: {
    event: {
      id: '8',
      title: '매우 긴 제목과 아이콘이 함께 있는 일정으로 레이아웃이 깨지지 않는지 확인',
      date: '2025-11-07',
      startTime: '10:00',
      endTime: '11:00',
      description: '긴 제목 + 아이콘',
      location: '회의실',
      category: '업무',
      repeat: { type: 'daily', interval: 1 },
      notificationTime: 10,
    },
    isNotified: true,
  },
};

// 모든 상태를 한눈에 보기
export const AllStates = () => (
  <Stack spacing={2} sx={{ p: 2 }}>
    <Typography variant="h6">일정 상태별 시각적 표현</Typography>
    <EventBox
      event={{
        id: '1',
        title: '일반 일정',
        date: '2025-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      }}
    />
    <EventBox
      event={{
        id: '2',
        title: '알림 발생 일정',
        date: '2025-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      }}
      isNotified={true}
    />
    <EventBox
      event={{
        id: '3',
        title: '반복 일정',
        date: '2025-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1 },
        notificationTime: 10,
      }}
    />
    <EventBox
      event={{
        id: '4',
        title: '알림 + 반복 일정',
        date: '2025-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 2 },
        notificationTime: 10,
      }}
      isNotified={true}
    />
    <EventBox
      event={{
        id: '5',
        title: '매우 긴 제목을 가진 일정으로 텍스트가 잘리는지 확인',
        date: '2025-11-07',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      }}
    />
  </Stack>
);

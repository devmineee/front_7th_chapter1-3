import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Notifications, Repeat } from '@mui/icons-material';

// 5. 각 셀 텍스트 길이에 따른 처리
const TextLengthComponent = () => {
  const eventBoxStyles = {
    common: {
      p: 0.5,
      my: 0.5,
      borderRadius: 1,
      minHeight: '18px',
      width: '100%',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5',
    },
  };

  const events = [
    { id: '1', title: '짧음', hasNotification: false, isRepeating: false },
    { id: '2', title: '중간 길이의 일정 제목', hasNotification: false, isRepeating: false },
    {
      id: '3',
      title: '매우 긴 제목을 가진 일정으로 텍스트가 잘리는지 확인하기 위한 테스트',
      hasNotification: false,
      isRepeating: false,
    },
    { id: '4', title: '아이콘과 함께 있는 긴 제목', hasNotification: true, isRepeating: true },
    {
      id: '5',
      title: '초초초초초초초초초장문의 제목으로 셀 너비를 넘어가는 경우 어떻게 처리되는지 확인',
      hasNotification: true,
      isRepeating: true,
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        텍스트 길이별 처리
      </Typography>

      {/* 캘린더 셀 내부 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          캘린더 셀 내부 (120px 높이 제한)
        </Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '14.28%', textAlign: 'center' }}>일</TableCell>
                <TableCell sx={{ width: '14.28%', textAlign: 'center' }}>월</TableCell>
                <TableCell sx={{ width: '14.28%', textAlign: 'center' }}>화</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {/* 짧은 제목 */}
                <TableCell
                  sx={{
                    height: '120px',
                    verticalAlign: 'top',
                    padding: 1,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    1
                  </Typography>
                  <Box sx={eventBoxStyles.common}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                        짧음
                      </Typography>
                    </Stack>
                  </Box>
                </TableCell>

                {/* 중간 길이 */}
                <TableCell
                  sx={{
                    height: '120px',
                    verticalAlign: 'top',
                    padding: 1,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    2
                  </Typography>
                  <Box sx={eventBoxStyles.common}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                        중간 길이의 일정 제목
                      </Typography>
                    </Stack>
                  </Box>
                </TableCell>

                {/* 긴 제목 + 아이콘 */}
                <TableCell
                  sx={{
                    height: '120px',
                    verticalAlign: 'top',
                    padding: 1,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    3
                  </Typography>
                  <Box sx={eventBoxStyles.common}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Notifications fontSize="small" />
                      <Repeat fontSize="small" />
                      <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                        매우 긴 제목을 가진 일정으로 텍스트가 잘리는지 확인
                      </Typography>
                    </Stack>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 다수의 일정이 있는 경우 */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          다수의 일정 (오버플로우 처리)
        </Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '14.28%', textAlign: 'center' }}>월</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  sx={{
                    height: '120px',
                    verticalAlign: 'top',
                    padding: 1,
                    border: '1px solid #e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    7
                  </Typography>
                  {events.map((event) => (
                    <Box key={event.id} sx={eventBoxStyles.common}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {event.hasNotification && <Notifications fontSize="small" />}
                        {event.isRepeating && <Repeat fontSize="small" />}
                        <Typography variant="caption" noWrap sx={{ fontSize: '0.75rem' }}>
                          {event.title}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 이벤트 리스트 (제한 없음) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          이벤트 리스트 (전체 제목 표시)
        </Typography>
        <Stack spacing={1} sx={{ width: '300px' }}>
          {events.map((event) => (
            <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {event.hasNotification && <Notifications fontSize="small" />}
                {event.isRepeating && <Repeat fontSize="small" />}
                <Typography variant="body2">{event.title}</Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

const meta = {
  title: 'Calendar/TextLength',
  component: TextLengthComponent,
  parameters: {
    layout: 'fullscreen',
    chromatic: {
      viewports: [320, 768, 1200],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextLengthComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTextLengths: Story = {};

export const ShortText = () => (
  <Box sx={{ width: '200px', p: 2 }}>
    <Box sx={{ p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="caption" noWrap>
        짧음
      </Typography>
    </Box>
  </Box>
);

export const MediumText = () => (
  <Box sx={{ width: '200px', p: 2 }}>
    <Box sx={{ p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="caption" noWrap>
        중간 길이의 일정 제목
      </Typography>
    </Box>
  </Box>
);

export const LongText = () => (
  <Box sx={{ width: '200px', p: 2 }}>
    <Box sx={{ p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="caption" noWrap>
        매우 긴 제목을 가진 일정으로 텍스트가 잘리는지 확인하기 위한 테스트 케이스입니다
      </Typography>
    </Box>
  </Box>
);

export const VeryLongText = () => (
  <Box sx={{ width: '200px', p: 2 }}>
    <Box sx={{ p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="caption" noWrap>
        초초초초초초초초초장문의 제목으로 셀 너비를 훨씬 넘어가는 경우 어떻게 처리되는지 확인하기
        위한 매우 긴 텍스트입니다
      </Typography>
    </Box>
  </Box>
);

export const TextWithIcons = () => (
  <Box sx={{ width: '200px', p: 2 }}>
    <Box sx={{ p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Notifications fontSize="small" />
        <Repeat fontSize="small" />
        <Typography variant="caption" noWrap>
          아이콘과 함께 있는 긴 제목으로 레이아웃 확인
        </Typography>
      </Stack>
    </Box>
  </Box>
);

export const ResponsiveTextHandling = () => (
  <Stack spacing={2} sx={{ p: 2 }}>
    <Typography variant="h6">반응형 텍스트 처리</Typography>
    {[150, 200, 250, 300].map((width) => (
      <Box key={width}>
        <Typography variant="caption" color="text.secondary">
          너비: {width}px
        </Typography>
        <Box sx={{ width: `${width}px`, p: 0.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Notifications fontSize="small" />
            <Repeat fontSize="small" />
            <Typography variant="caption" noWrap>
              반응형으로 처리되는 긴 텍스트 예시입니다
            </Typography>
          </Stack>
        </Box>
      </Box>
    ))}
  </Stack>
);

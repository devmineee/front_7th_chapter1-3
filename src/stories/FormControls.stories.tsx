import {
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

// 4. 폼 컨트롤 상태
const FormControlsComponent = () => {
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('09:00');
  const startTimeError = '종료 시간은 시작 시간보다 이후여야 합니다.';

  return (
    <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
      <Typography variant="h6">일정 추가 폼</Typography>

      {/* 일반 텍스트 입력 */}
      <FormControl fullWidth>
        <FormLabel htmlFor="title">제목</FormLabel>
        <TextField id="title" size="small" placeholder="일정 제목을 입력하세요" />
      </FormControl>

      {/* 날짜 입력 */}
      <FormControl fullWidth>
        <FormLabel htmlFor="date">날짜</FormLabel>
        <TextField id="date" size="small" type="date" defaultValue="2025-11-07" />
      </FormControl>

      {/* 시간 입력 (에러 상태) */}
      <Stack direction="row" spacing={2}>
        <FormControl fullWidth>
          <FormLabel htmlFor="start-time">시작 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="start-time"
              size="small"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
        <FormControl fullWidth>
          <FormLabel htmlFor="end-time">종료 시간</FormLabel>
          <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
            <TextField
              id="end-time"
              size="small"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={!!startTimeError}
            />
          </Tooltip>
        </FormControl>
      </Stack>

      {/* Select (드롭다운) */}
      <FormControl fullWidth>
        <FormLabel id="category-label">카테고리</FormLabel>
        <Select id="category" size="small" defaultValue="업무" aria-labelledby="category-label">
          <MenuItem value="업무">업무</MenuItem>
          <MenuItem value="개인">개인</MenuItem>
          <MenuItem value="가족">가족</MenuItem>
          <MenuItem value="기타">기타</MenuItem>
        </Select>
      </FormControl>

      {/* 체크박스 */}
      <FormControl>
        <FormControlLabel control={<Checkbox defaultChecked />} label="반복 일정" />
      </FormControl>

      {/* 알림 설정 Select */}
      <FormControl fullWidth>
        <FormLabel htmlFor="notification">알림 설정</FormLabel>
        <Select id="notification" size="small" defaultValue={10}>
          <MenuItem value={1}>1분 전</MenuItem>
          <MenuItem value={10}>10분 전</MenuItem>
          <MenuItem value={60}>1시간 전</MenuItem>
          <MenuItem value={120}>2시간 전</MenuItem>
          <MenuItem value={1440}>1일 전</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};

const meta = {
  title: 'Calendar/FormControls',
  component: FormControlsComponent,
  parameters: {
    layout: 'centered',
    chromatic: {
      delay: 300,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormControlsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultState: Story = {};

export const EmptyForm = () => (
  <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
    <Typography variant="h6">일정 추가</Typography>
    <FormControl fullWidth>
      <FormLabel htmlFor="title">제목</FormLabel>
      <TextField id="title" size="small" value="" />
    </FormControl>
    <FormControl fullWidth>
      <FormLabel htmlFor="date">날짜</FormLabel>
      <TextField id="date" size="small" type="date" value="" />
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="start-time">시작 시간</FormLabel>
        <TextField id="start-time" size="small" type="time" value="" />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="end-time">종료 시간</FormLabel>
        <TextField id="end-time" size="small" type="time" value="" />
      </FormControl>
    </Stack>
  </Stack>
);

export const FilledForm = () => (
  <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
    <Typography variant="h6">일정 수정</Typography>
    <FormControl fullWidth>
      <FormLabel htmlFor="title">제목</FormLabel>
      <TextField id="title" size="small" value="팀 회의" />
    </FormControl>
    <FormControl fullWidth>
      <FormLabel htmlFor="date">날짜</FormLabel>
      <TextField id="date" size="small" type="date" value="2025-11-07" />
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="start-time">시작 시간</FormLabel>
        <TextField id="start-time" size="small" type="time" value="10:00" />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="end-time">종료 시간</FormLabel>
        <TextField id="end-time" size="small" type="time" value="11:00" />
      </FormControl>
    </Stack>
    <FormControl fullWidth>
      <FormLabel htmlFor="description">설명</FormLabel>
      <TextField id="description" size="small" value="주간 팀 미팅" />
    </FormControl>
    <FormControl fullWidth>
      <FormLabel htmlFor="location">위치</FormLabel>
      <TextField id="location" size="small" value="회의실 A" />
    </FormControl>
  </Stack>
);

export const ErrorState = () => (
  <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
    <Typography variant="h6">일정 추가 (시간 오류)</Typography>
    <FormControl fullWidth>
      <FormLabel htmlFor="title">제목</FormLabel>
      <TextField id="title" size="small" value="회의" />
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="start-time">시작 시간</FormLabel>
        <Tooltip title="종료 시간은 시작 시간보다 이후여야 합니다." open={true} placement="top">
          <TextField id="start-time" size="small" type="time" value="10:00" error />
        </Tooltip>
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="end-time">종료 시간</FormLabel>
        <Tooltip title="종료 시간은 시작 시간보다 이후여야 합니다." open={true} placement="top">
          <TextField id="end-time" size="small" type="time" value="09:00" error />
        </Tooltip>
      </FormControl>
    </Stack>
  </Stack>
);

export const WithRepeatingOptions = () => (
  <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
    <Typography variant="h6">반복 일정 추가</Typography>
    <FormControl fullWidth>
      <FormLabel htmlFor="title">제목</FormLabel>
      <TextField id="title" size="small" value="주간 회의" />
    </FormControl>
    <FormControl>
      <FormControlLabel control={<Checkbox checked />} label="반복 일정" />
    </FormControl>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select size="small" value="weekly">
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>
    <Stack direction="row" spacing={2}>
      <FormControl fullWidth>
        <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
        <TextField id="repeat-interval" size="small" type="number" value={1} />
      </FormControl>
      <FormControl fullWidth>
        <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
        <TextField id="repeat-end-date" size="small" type="date" value="2025-12-31" />
      </FormControl>
    </Stack>
  </Stack>
);

export const CategoryDropdownOpen = () => (
  <Stack spacing={2} sx={{ width: '400px', p: 2 }}>
    <Typography variant="h6">카테고리 선택</Typography>
    <FormControl fullWidth>
      <FormLabel id="category-label">카테고리</FormLabel>
      <Select id="category" size="small" defaultValue="업무" open={true}>
        <MenuItem value="업무">업무</MenuItem>
        <MenuItem value="개인">개인</MenuItem>
        <MenuItem value="가족">가족</MenuItem>
        <MenuItem value="기타">기타</MenuItem>
      </Select>
    </FormControl>
  </Stack>
);

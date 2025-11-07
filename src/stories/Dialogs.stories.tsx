import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import RecurringEventDialog from '../components/RecurringEventDialog';
import { Event } from '../types';

// 3. 다이얼로그 및 모달
const meta = {
  title: 'Calendar/Dialogs',
  parameters: {
    layout: 'centered',
    chromatic: {
      delay: 300,
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

const mockEvent: Event = {
  id: '1',
  title: '반복 일정',
  date: '2025-11-07',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 반복되는 회의',
  location: '회의실',
  category: '업무',
  repeat: { type: 'weekly', interval: 1 },
  notificationTime: 10,
};

// 일정 겹침 경고 다이얼로그
export const OverlapDialog: StoryObj = {
  render: () => (
    <Dialog open={true} onClose={() => {}}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        <Typography sx={{ ml: 1, mb: 1 }}>팀 회의 (2025-11-07 10:00-11:00)</Typography>
        <Typography sx={{ ml: 1, mb: 1 }}>프로젝트 리뷰 (2025-11-07 10:30-11:30)</Typography>
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {}}>취소</Button>
        <Button color="error" onClick={() => {}}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  ),
};

export const OverlapDialogWithSingleEvent: StoryObj = {
  render: () => (
    <Dialog open={true} onClose={() => {}}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        <Typography sx={{ ml: 1, mb: 1 }}>점심 약속 (2025-11-07 12:00-13:00)</Typography>
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {}}>취소</Button>
        <Button color="error" onClick={() => {}}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  ),
};

export const OverlapDialogWithLongTitles: StoryObj = {
  render: () => (
    <Dialog open={true} onClose={() => {}}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        <Typography sx={{ ml: 1, mb: 1 }}>
          매우 긴 제목을 가진 일정으로 다이얼로그 내에서 어떻게 표시되는지 확인 (2025-11-07
          10:00-11:00)
        </Typography>
        <Typography sx={{ ml: 1, mb: 1 }}>
          또 다른 긴 제목의 일정입니다 (2025-11-07 10:30-11:30)
        </Typography>
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {}}>취소</Button>
        <Button color="error" onClick={() => {}}>
          계속 진행
        </Button>
      </DialogActions>
    </Dialog>
  ),
};

// 반복 일정 편집 다이얼로그
export const RecurringEditDialog: StoryObj = {
  render: () => (
    <RecurringEventDialog
      open={true}
      onClose={() => {}}
      onConfirm={() => {}}
      event={mockEvent}
      mode="edit"
    />
  ),
};

export const RecurringDeleteDialog: StoryObj = {
  render: () => (
    <RecurringEventDialog
      open={true}
      onClose={() => {}}
      onConfirm={() => {}}
      event={mockEvent}
      mode="delete"
    />
  ),
};

export const RecurringDragDialog: StoryObj = {
  render: () => (
    <RecurringEventDialog
      open={true}
      onClose={() => {}}
      onConfirm={() => {}}
      event={mockEvent}
      mode="drag"
    />
  ),
};

// 모든 다이얼로그를 순서대로 보기
export const AllDialogs = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
      <Dialog open={true} onClose={() => {}}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
          <Typography sx={{ ml: 1, mb: 1 }}>팀 회의 (2025-11-07 10:00-11:00)</Typography>
          <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button>취소</Button>
          <Button color="error">계속 진행</Button>
        </DialogActions>
      </Dialog>
    </div>
  </div>
);

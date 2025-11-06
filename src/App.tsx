import {
  ChevronLeft,
  ChevronRight,
  Close,
  Delete,
  Edit,
  Notifications,
  Repeat,
} from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

import RecurringEventDialog from './components/RecurringEventDialog.tsx';
import { useCalendarView } from './hooks/useCalendarView.ts';
import { useEventForm } from './hooks/useEventForm.ts';
import { useEventOperations } from './hooks/useEventOperations.ts';
import { useNotifications } from './hooks/useNotifications.ts';
import { useRecurringEventOperations } from './hooks/useRecurringEventOperations.ts';
import { useSearch } from './hooks/useSearch.ts';
import { Event, EventForm, RepeatType } from './types.ts';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from './utils/dateUtils.ts';
import { findOverlappingEvents } from './utils/eventOverlap.ts';
import { getTimeErrorMessage } from './utils/timeValidation.ts';

const categories = ['업무', '개인', '가족', '기타'];

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

// 스타일 상수
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

const getRepeatTypeLabel = (type: RepeatType): string => {
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

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  sx?: any;
}

const Droppable: React.FC<DroppableProps> = ({ id, children, sx }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <TableCell
      ref={setNodeRef}
      sx={{
        ...sx,
        // 드롭 영역에 드래그 중인 아이템이 올라왔을 때
        backgroundColor: isOver ? '#e3f2fd' : sx?.backgroundColor || 'inherit',
        transition: 'background-color 0.2s ease',
        border: isOver ? '2px dashed #1976d2' : sx?.border || '1px solid #e0e0e0',
      }}
    >
      {children}
    </TableCell>
  );
};

interface DraggableProps {
  id: string;
  children: React.ReactNode;
  sx?: any;
}

const Draggable: React.FC<DraggableProps> = ({ id, children, sx }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        ...sx,
        // 드래그 중일 때
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        // 호버 효과
        '&:hover': {
          boxShadow: !isDragging ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        },
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </Box>
  );
};

function App() {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    startTimeError,
    endTimeError,
    editingEvent,
    setEditingEvent,
    handleStartTimeChange,
    handleEndTimeChange,
    resetForm,
    editEvent,
  } = useEventForm();

  const { events, saveEvent, deleteEvent, createRepeatEvent, fetchEvents } = useEventOperations(
    () => setEditingEvent(null)
  );

  const { handleRecurringEdit, handleRecurringDelete } = useRecurringEventOperations(
    events,
    async () => {
      // After recurring edit, refresh events from server
      await fetchEvents();
    }
  );

  const { notifications, notifiedEvents, setNotifications } = useNotifications(events);
  const { view, setView, currentDate, holidays, navigate } = useCalendarView();
  const { searchTerm, filteredEvents, setSearchTerm } = useSearch(events, currentDate, view);

  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);
  const [overlappingEvents, setOverlappingEvents] = useState<Event[]>([]);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [pendingRecurringEdit, setPendingRecurringEdit] = useState<Event | null>(null);
  const [pendingRecurringDelete, setPendingRecurringDelete] = useState<Event | null>(null);
  const [recurringEditMode, setRecurringEditMode] = useState<boolean | null>(null); // true = single, false = all
  const [recurringDialogMode, setRecurringDialogMode] = useState<'edit' | 'delete' | 'drag'>(
    'edit'
  );
  const [pendingDragData, setPendingDragData] = useState<{
    event: Event;
    targetDate: string;
  } | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  const handleRecurringConfirm = async (editSingleOnly: boolean) => {
    if (recurringDialogMode === 'edit' && pendingRecurringEdit) {
      setRecurringEditMode(editSingleOnly);
      editEvent(pendingRecurringEdit);
      setIsRecurringDialogOpen(false);
      setPendingRecurringEdit(null);
    } else if (recurringDialogMode === 'delete' && pendingRecurringDelete) {
      // 반복 일정 삭제 처리
      try {
        await handleRecurringDelete(pendingRecurringDelete, editSingleOnly);
        enqueueSnackbar('일정이 삭제되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingRecurringDelete(null);
    } else if (recurringDialogMode === 'drag' && pendingDragData) {
      // 반복 일정 드래그 처리
      try {
        await handleRecurringDrag(
          pendingDragData.event,
          pendingDragData.targetDate,
          editSingleOnly
        );
        enqueueSnackbar('일정이 이동되었습니다', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('일정 이동 실패', { variant: 'error' });
      }
      setIsRecurringDialogOpen(false);
      setPendingDragData(null);
    }
  };

  const isRecurringEvent = (event: Event): boolean => {
    return event.repeat.type !== 'none' && event.repeat.interval > 0;
  };

  const handleRecurringDrag = async (
    draggedEvent: Event,
    targetDate: string,
    editSingleOnly: boolean
  ) => {
    if (editSingleOnly) {
      // 단일 일정만 이동: 반복 속성 제거하고 새 날짜로 이동
      await saveEvent(
        {
          ...draggedEvent,
          date: targetDate,
          repeat: { type: 'none', interval: 0 },
        },
        { silent: true }
      );
    } else {
      // 모든 반복 일정 이동: 날짜 차이를 계산하여 모든 일정 이동
      const originalDate = new Date(draggedEvent.date);
      const newDate = new Date(targetDate);
      const dayDiff = Math.floor(
        (newDate.getTime() - originalDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 같은 반복 그룹의 모든 이벤트 찾기
      const recurringEvents = events.filter(
        (e) =>
          e.repeat.type === draggedEvent.repeat.type &&
          e.repeat.interval === draggedEvent.repeat.interval &&
          e.repeat.endDate === draggedEvent.repeat.endDate &&
          e.title === draggedEvent.title &&
          e.startTime === draggedEvent.startTime &&
          e.endTime === draggedEvent.endTime
      );

      // 모든 반복 일정을 같은 간격만큼 이동 (스낵바 표시 없이)
      for (const event of recurringEvents) {
        const eventDate = new Date(event.date);
        eventDate.setDate(eventDate.getDate() + dayDiff);
        const newDateStr = eventDate.toISOString().split('T')[0];

        await saveEvent(
          {
            ...event,
            date: newDateStr,
          },
          { silent: true }
        );
      }
    }

    await fetchEvents();
  };

  const handleEditEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring edit dialog
      setPendingRecurringEdit(event);
      setRecurringDialogMode('edit');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event editing
      editEvent(event);
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (isRecurringEvent(event)) {
      // Show recurring delete dialog
      setPendingRecurringDelete(event);
      setRecurringDialogMode('delete');
      setIsRecurringDialogOpen(true);
    } else {
      // Regular event deletion
      deleteEvent(event.id);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over) return;

    // active.id = 드래그된 이벤트 ID
    // over.id = 드롭된 날짜 ("YYYY-MM-DD" 형식)

    const draggedEvent = events.find((e) => e.id === active.id);
    if (!draggedEvent) return;

    // over.id는 이미 "YYYY-MM-DD" 형식
    const formattedDate = over.id;

    // 날짜가 변경된 경우에만 업데이트
    if (draggedEvent.date !== formattedDate) {
      // 반복 일정인지 확인
      if (isRecurringEvent(draggedEvent)) {
        // 반복 일정이면 모달 표시
        setPendingDragData({ event: draggedEvent, targetDate: formattedDate });
        setRecurringDialogMode('drag');
        setIsRecurringDialogOpen(true);
      } else {
        // 일반 일정이면 바로 이동
        try {
          await saveEvent({
            ...draggedEvent,
            date: formattedDate,
          });
        } catch (error) {
          console.error('드래그 앤 드롭 실패:', error);
        }
      }
    }
  };

  const addOrUpdateEvent = async () => {
    if (!title || !date || !startTime || !endTime) {
      enqueueSnackbar('필수 정보를 모두 입력해주세요.', { variant: 'error' });
      return;
    }

    if (startTimeError || endTimeError) {
      enqueueSnackbar('시간 설정을 확인해주세요.', { variant: 'error' });
      return;
    }

    const eventData: Event | EventForm = {
      id: editingEvent ? editingEvent.id : undefined,
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      category,
      repeat: editingEvent
        ? editingEvent.repeat // Keep original repeat settings for recurring event detection
        : {
            type: isRepeating ? repeatType : 'none',
            interval: repeatInterval,
            endDate: repeatEndDate || undefined,
          },
      notificationTime,
    };

    const overlapping = findOverlappingEvents(eventData, events);
    const hasOverlapEvent = overlapping.length > 0;

    // 수정
    if (editingEvent) {
      if (hasOverlapEvent) {
        setOverlappingEvents(overlapping);
        setIsOverlapDialogOpen(true);
        return;
      }

      if (
        editingEvent.repeat.type !== 'none' &&
        editingEvent.repeat.interval > 0 &&
        recurringEditMode !== null
      ) {
        await handleRecurringEdit(eventData as Event, recurringEditMode);
        setRecurringEditMode(null);
      } else {
        await saveEvent(eventData);
      }

      resetForm();
      return;
    }

    // 생성
    if (isRepeating) {
      // 반복 생성은 반복 일정을 고려하지 않는다.
      await createRepeatEvent(eventData);
      resetForm();
      return;
    }

    if (hasOverlapEvent) {
      setOverlappingEvents(overlapping);
      setIsOverlapDialogOpen(true);
      return;
    }

    await saveEvent(eventData);
    resetForm();
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <DndContext onDragEnd={handleDragEnd}>
        <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
          <Typography variant="h5">{formatWeek(currentDate)}</Typography>
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
                  {weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    return (
                      <Droppable
                        key={dateStr}
                        id={dateStr}
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
                          {date.getDate()}
                        </Typography>
                        {filteredEvents
                          .filter(
                            (event) => new Date(event.date).toDateString() === date.toDateString()
                          )
                          .map((event) => {
                            const isNotified = notifiedEvents.includes(event.id);
                            const isRepeating = event.repeat.type !== 'none';

                            return (
                              <Draggable
                                id={event.id}
                                key={event.id}
                                sx={{
                                  ...eventBoxStyles.common,
                                  ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {/* ! TEST CASE */}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                                        event.repeat.type
                                      )}마다 반복${
                                        event.repeat.endDate
                                          ? ` (종료: ${event.repeat.endDate})`
                                          : ''
                                      }`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Draggable>
                            );
                          })}
                      </Droppable>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DndContext>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <DndContext onDragEnd={handleDragEnd}>
        <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
          <Typography variant="h5">{formatMonth(currentDate)}</Typography>
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
                {weeks.map((week, weekIndex) => (
                  <TableRow key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      const dateString = day ? formatDate(currentDate, day) : '';
                      const holiday = holidays[dateString];

                      // 날짜가 있는 경우 Droppable로, 없는 경우 일반 TableCell로
                      if (!day) {
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
                              position: 'relative',
                            }}
                          />
                        );
                      }

                      const dateStr = formatDate(currentDate, day);

                      return (
                        <Droppable
                          key={dayIndex}
                          id={dateStr}
                          sx={{
                            height: '120px',
                            verticalAlign: 'top',
                            width: '14.28%',
                            padding: 1,
                            border: '1px solid #e0e0e0',
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <Typography variant="body2" fontWeight="bold">
                            {day}
                          </Typography>
                          {holiday && (
                            <Typography variant="body2" color="error">
                              {holiday}
                            </Typography>
                          )}
                          {getEventsForDay(filteredEvents, day).map((event) => {
                            const isNotified = notifiedEvents.includes(event.id);
                            const isRepeating = event.repeat.type !== 'none';

                            return (
                              <Draggable
                                id={event.id}
                                key={event.id}
                                sx={{
                                  ...eventBoxStyles.common,
                                  ...(isNotified ? eventBoxStyles.notified : eventBoxStyles.normal),
                                }}
                              >
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {isNotified && <Notifications fontSize="small" />}
                                  {/* ! TEST CASE */}
                                  {isRepeating && (
                                    <Tooltip
                                      title={`${event.repeat.interval}${getRepeatTypeLabel(
                                        event.repeat.type
                                      )}마다 반복${
                                        event.repeat.endDate
                                          ? ` (종료: ${event.repeat.endDate})`
                                          : ''
                                      }`}
                                    >
                                      <Repeat fontSize="small" />
                                    </Tooltip>
                                  )}
                                  <Typography
                                    variant="caption"
                                    noWrap
                                    sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}
                                  >
                                    {event.title}
                                  </Typography>
                                </Stack>
                              </Draggable>
                            );
                          })}
                        </Droppable>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </DndContext>
    );
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', margin: 'auto', p: 5 }}>
      <Stack direction="row" spacing={6} sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ width: '20%' }}>
          <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

          <FormControl fullWidth>
            <FormLabel htmlFor="title">제목</FormLabel>
            <TextField
              id="title"
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="date">날짜</FormLabel>
            <TextField
              id="date"
              size="small"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <FormLabel htmlFor="start-time">시작 시간</FormLabel>
              <Tooltip title={startTimeError || ''} open={!!startTimeError} placement="top">
                <TextField
                  id="start-time"
                  size="small"
                  type="time"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!startTimeError}
                />
              </Tooltip>
            </FormControl>
            <FormControl fullWidth>
              <FormLabel htmlFor="end-time">종료 시간</FormLabel>
              <Tooltip title={endTimeError || ''} open={!!endTimeError} placement="top">
                <TextField
                  id="end-time"
                  size="small"
                  type="time"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  onBlur={() => getTimeErrorMessage(startTime, endTime)}
                  error={!!endTimeError}
                />
              </Tooltip>
            </FormControl>
          </Stack>

          <FormControl fullWidth>
            <FormLabel htmlFor="description">설명</FormLabel>
            <TextField
              id="description"
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel htmlFor="location">위치</FormLabel>
            <TextField
              id="location"
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel id="category-label">카테고리</FormLabel>
            <Select
              id="category"
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-labelledby="category-label"
              aria-label="카테고리"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat} aria-label={`${cat}-option`}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {!editingEvent && (
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isRepeating}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsRepeating(checked);
                      if (checked) {
                        setRepeatType('daily');
                      } else {
                        setRepeatType('none');
                      }
                    }}
                  />
                }
                label="반복 일정"
              />
            </FormControl>
          )}

          {/* ! TEST CASE */}
          {isRepeating && !editingEvent && (
            <Stack spacing={2}>
              <FormControl fullWidth>
                <FormLabel>반복 유형</FormLabel>
                <Select
                  size="small"
                  value={repeatType}
                  aria-label="반복 유형"
                  onChange={(e) => setRepeatType(e.target.value as RepeatType)}
                >
                  <MenuItem value="daily" aria-label="daily-option">
                    매일
                  </MenuItem>
                  <MenuItem value="weekly" aria-label="weekly-option">
                    매주
                  </MenuItem>
                  <MenuItem value="monthly" aria-label="monthly-option">
                    매월
                  </MenuItem>
                  <MenuItem value="yearly" aria-label="yearly-option">
                    매년
                  </MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-interval">반복 간격</FormLabel>
                  <TextField
                    id="repeat-interval"
                    size="small"
                    type="number"
                    value={repeatInterval}
                    onChange={(e) => setRepeatInterval(Number(e.target.value))}
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel htmlFor="repeat-end-date">반복 종료일</FormLabel>
                  <TextField
                    id="repeat-end-date"
                    size="small"
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                  />
                </FormControl>
              </Stack>
            </Stack>
          )}

          <FormControl fullWidth>
            <FormLabel htmlFor="notification">알림 설정</FormLabel>
            <Select
              id="notification"
              size="small"
              value={notificationTime}
              onChange={(e) => setNotificationTime(Number(e.target.value))}
            >
              {notificationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            data-testid="event-submit-button"
            onClick={addOrUpdateEvent}
            variant="contained"
            color="primary"
          >
            {editingEvent ? '일정 수정' : '일정 추가'}
          </Button>
        </Stack>

        <Stack flex={1} spacing={5}>
          <Typography variant="h4">일정 보기</Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <IconButton aria-label="Previous" onClick={() => navigate('prev')}>
              <ChevronLeft />
            </IconButton>
            <Select
              size="small"
              aria-label="뷰 타입 선택"
              value={view}
              onChange={(e) => setView(e.target.value as 'week' | 'month')}
            >
              <MenuItem value="week" aria-label="week-option">
                Week
              </MenuItem>
              <MenuItem value="month" aria-label="month-option">
                Month
              </MenuItem>
            </Select>
            <IconButton aria-label="Next" onClick={() => navigate('next')}>
              <ChevronRight />
            </IconButton>
          </Stack>

          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </Stack>

        <Stack
          data-testid="event-list"
          spacing={2}
          sx={{ width: '30%', height: '100%', overflowY: 'auto' }}
        >
          <FormControl fullWidth>
            <FormLabel htmlFor="search">일정 검색</FormLabel>
            <TextField
              id="search"
              size="small"
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>

          {filteredEvents.length === 0 ? (
            <Typography>검색 결과가 없습니다.</Typography>
          ) : (
            filteredEvents.map((event) => (
              <Box key={event.id} sx={{ border: 1, borderRadius: 2, p: 3, width: '100%' }}>
                <Stack direction="row" justifyContent="space-between">
                  <Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {notifiedEvents.includes(event.id) && <Notifications color="error" />}
                      {event.repeat.type !== 'none' && (
                        <Tooltip
                          title={`${event.repeat.interval}${getRepeatTypeLabel(
                            event.repeat.type
                          )}마다 반복${
                            event.repeat.endDate ? ` (종료: ${event.repeat.endDate})` : ''
                          }`}
                        >
                          <Repeat fontSize="small" />
                        </Tooltip>
                      )}
                      <Typography
                        fontWeight={notifiedEvents.includes(event.id) ? 'bold' : 'normal'}
                        color={notifiedEvents.includes(event.id) ? 'error' : 'inherit'}
                      >
                        {event.title}
                      </Typography>
                    </Stack>
                    <Typography>{event.date}</Typography>
                    <Typography>
                      {event.startTime} - {event.endTime}
                    </Typography>
                    <Typography>{event.description}</Typography>
                    <Typography>{event.location}</Typography>
                    <Typography>카테고리: {event.category}</Typography>
                    {event.repeat.type !== 'none' && (
                      <Typography>
                        반복: {event.repeat.interval}
                        {event.repeat.type === 'daily' && '일'}
                        {event.repeat.type === 'weekly' && '주'}
                        {event.repeat.type === 'monthly' && '월'}
                        {event.repeat.type === 'yearly' && '년'}
                        마다
                        {event.repeat.endDate && ` (종료: ${event.repeat.endDate})`}
                      </Typography>
                    )}
                    <Typography>
                      알림:{' '}
                      {
                        notificationOptions.find(
                          (option) => option.value === event.notificationTime
                        )?.label
                      }
                    </Typography>
                  </Stack>
                  <Stack>
                    <IconButton aria-label="Edit event" onClick={() => handleEditEvent(event)}>
                      <Edit />
                    </IconButton>
                    <IconButton aria-label="Delete event" onClick={() => handleDeleteEvent(event)}>
                      <Delete />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Stack>

      <Dialog open={isOverlapDialogOpen} onClose={() => setIsOverlapDialogOpen(false)}>
        <DialogTitle>일정 겹침 경고</DialogTitle>
        <DialogContent>
          <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
          {overlappingEvents.map((event) => (
            <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
              {event.title} ({event.date} {event.startTime}-{event.endTime})
            </Typography>
          ))}
          <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOverlapDialogOpen(false)}>취소</Button>
          <Button
            color="error"
            onClick={() => {
              setIsOverlapDialogOpen(false);
              saveEvent({
                id: editingEvent ? editingEvent.id : undefined,
                title,
                date,
                startTime,
                endTime,
                description,
                location,
                category,
                repeat: {
                  type: isRepeating ? repeatType : 'none',
                  interval: repeatInterval,
                  endDate: repeatEndDate || undefined,
                },
                notificationTime,
              });
            }}
          >
            계속 진행
          </Button>
        </DialogActions>
      </Dialog>

      <RecurringEventDialog
        open={isRecurringDialogOpen}
        onClose={() => {
          setIsRecurringDialogOpen(false);
          setPendingRecurringEdit(null);
          setPendingRecurringDelete(null);
          setPendingDragData(null);
        }}
        onConfirm={handleRecurringConfirm}
        event={
          recurringDialogMode === 'edit'
            ? pendingRecurringEdit
            : recurringDialogMode === 'delete'
            ? pendingRecurringDelete
            : pendingDragData?.event || null
        }
        mode={recurringDialogMode}
      />

      {notifications.length > 0 && (
        <Stack position="fixed" top={16} right={16} spacing={2} alignItems="flex-end">
          {notifications.map((notification, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ width: 'auto' }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setNotifications((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Close />
                </IconButton>
              }
            >
              <AlertTitle>{notification.message}</AlertTitle>
            </Alert>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default App;

import 'react-big-calendar/lib/css/react-big-calendar.css';
import React, { useEffect, useMemo, useState } from "react";
import { BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { add, addDays, format, getDay, isSameDay, parse, startOfDay, startOfMonth, startOfWeek, sub } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "react-toastify";
import MeetingForm from "@/components/organisms/MeetingForm";
import meetingService from "@/services/api/meetingService";
import { getAll as getAllCompanies, update as updateCompany } from "@/services/api/companyService";
import { getAll as getAllDeals, update as updateDeal } from "@/services/api/dealService";
import taskService, { getAll as getAllTasks, update as updateTask } from "@/services/api/taskService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Tasks from "@/components/pages/Tasks";
import Modal from "@/components/molecules/Modal";
import { cn } from "@/utils/cn";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

const Calendar = () => {
const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // Mini calendar state
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  useEffect(() => {
    loadTasks();
  }, []);

const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both tasks and meetings
      const [tasksData, meetingsData] = await Promise.all([
        taskService.getAll(),
        meetingService.getAll()
      ]);
      
      setTasks(tasksData.filter(task => task.dueDate)); // Only tasks with due dates
      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError('Failed to load calendar events. Please try again.');
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
    loadData();
  }, []);

  // Format events for calendar
const events = useMemo(() => {
    // Combine tasks and meetings into calendar events
    const taskEvents = tasks.map(task => ({
      id: `task-${task.Id}`,
      title: task.title,
      start: new Date(`${task.dueDate}${task.dueTime ? `T${task.dueTime}` : 'T09:00'}`),
      end: new Date(`${task.dueDate}${task.dueTime ? `T${task.dueTime}` : 'T10:00'}`),
      resource: { ...task, type: 'Task', eventType: 'task' },
      allDay: !task.dueTime
    }));

    const meetingEvents = meetings.map(meeting => ({
      id: `meeting-${meeting.Id}`,
      title: meeting.title,
      start: new Date(`${meeting.startDate}T${meeting.startTime}`),
      end: new Date(`${meeting.endDate}T${meeting.endTime}`),
      resource: { ...meeting, eventType: 'meeting' },
      allDay: false
    }));

    return [...taskEvents, ...meetingEvents];
  }, [tasks, meetings]);

  const handleSelectSlot = ({ start }) => {
    setSelectedDate(start);
    setShowCreateForm(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedTask(event.resource);
    setShowTaskDetail(true);
  };

const handleEventDrop = async ({ event, start, end }) => {
    try {
      const { resource } = event;
      
      if (resource.eventType === 'task') {
        const updatedTask = {
          ...resource,
          dueDate: format(start, 'yyyy-MM-dd'),
          dueTime: event.allDay ? '' : format(start, 'HH:mm')
        };
        
        await taskService.update(resource.Id, updatedTask);
      } else if (resource.eventType === 'meeting') {
        const updatedMeeting = {
          ...resource,
          startDate: format(start, 'yyyy-MM-dd'),
          startTime: format(start, 'HH:mm'),
          endDate: format(end, 'yyyy-MM-dd'),
          endTime: format(end, 'HH:mm')
        };
        
        await meetingService.update(resource.Id, updatedMeeting);
      }
      
      await loadData();
      toast.success('Event rescheduled successfully');
    } catch (err) {
      console.error('Error rescheduling event:', err);
      toast.error('Failed to reschedule event');
    }
  };

  const handleMeetingCreated = async () => {
    // Reload calendar data when a new meeting is created
    await loadData();
  };

  const goToToday = () => {
    const today = new Date();
    setDate(today);
    setMiniCalendarDate(today);
  };

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#3b82f6'; // Default blue
    
    switch (task.type) {
      case 'Meeting':
        backgroundColor = '#10b981'; // Green
        break;
      case 'Call':
        backgroundColor = '#f59e0b'; // Orange
        break;
      case 'Email':
        backgroundColor = '#8b5cf6'; // Purple
        break;
      case 'To-Do':
        backgroundColor = '#3b82f6'; // Blue
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: task.completed ? 0.6 : 1,
        border: '0px',
        display: 'block',
        color: 'white',
        fontSize: '12px',
        padding: '2px 6px'
      }
    };
  };

  const formats = {
    timeGutterFormat: 'h:mm A',
eventTimeRangeFormat: ({ start, end }) => 
      `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
    dayHeaderFormat: 'eee M/d',
    dayRangeHeaderFormat: ({ start, end }) => 
      `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
    monthHeaderFormat: 'MMMM yyyy'
  };

  // Mini calendar helpers
  const getMiniCalendarEvents = (date) => {
const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(task => task.dueDate === dateStr);
  };

  const renderMiniCalendarDay = (date) => {
    const hasEvents = getMiniCalendarEvents(date).length > 0;
const isToday = isSameDay(date, new Date());
    const isSelected = isSameDay(date, miniCalendarDate);

    return (
      <div
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors relative',
          isToday && 'bg-primary-500 text-white font-semibold',
          isSelected && !isToday && 'bg-primary-100 text-primary-700',
          !isToday && !isSelected && 'hover:bg-secondary-100'
        )}
        onClick={() => {
          setMiniCalendarDate(date);
          setDate(date);
        }}
      >
        {date.getDate()}
        {hasEvents && (
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary-500 rounded-full"></div>
        )}
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTasks} />;

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex h-screen">
        {/* Mini Calendar Sidebar */}
        <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-secondary-900">Calendar</h1>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <ApperIcon name="Plus" size={16} />
                New Event
              </Button>
            </div>
            
            <Button
              onClick={goToToday}
              variant="outline"
              className="w-full mb-4"
            >
              <ApperIcon name="Calendar" size={16} />
              Today
            </Button>
          </div>

          {/* Mini Calendar */}
          <div className="p-4 flex-1">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <button
onClick={() => setMiniCalendarDate(sub(miniCalendarDate, { months: 1 }))}
                  className="p-1 hover:bg-secondary-100 rounded"
                >
                  <ApperIcon name="ChevronLeft" size={16} />
                </button>
<h3 className="font-semibold text-secondary-900">
                  {format(miniCalendarDate, 'MMMM yyyy')}
                </h3>
                <button
                  onClick={() => setMiniCalendarDate(add(miniCalendarDate, { months: 1 }))}
                  className="p-1 hover:bg-secondary-100 rounded"
                >
                  <ApperIcon name="ChevronRight" size={16} />
                </button>
              </div>
              
              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center font-medium text-secondary-500 p-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 42 }).map((_, index) => {
const monthStart = startOfMonth(miniCalendarDate);
                  const calendarStart = startOfWeek(monthStart);
                  const currentDate = addDays(calendarStart, index);
                  
                  return (
<div key={index} className="flex justify-center">
                      {renderMiniCalendarDay(currentDate)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-secondary-700 mb-3">Event Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <span className="text-sm text-secondary-600">Tasks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-sm text-secondary-600">Meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-sm text-secondary-600">Calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500"></div>
                  <span className="text-sm text-secondary-600">Emails</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Header */}
          <div className="p-6 bg-white border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-secondary-900">
{view === 'month' && format(date, 'MMMM yyyy')}
                  {view === 'week' && `Week of ${format(startOfWeek(date), 'MMM d, yyyy')}`}
                  {view === 'day' && format(date, 'EEEE, MMMM d, yyyy')}
                  {view === 'agenda' && 'Agenda'}
                </h2>
                
                <div className="flex items-center gap-2">
                  <button
onClick={() => setDate(sub(date, { [view === 'month' ? 'months' : view === 'week' ? 'weeks' : 'days']: 1 }))}
                    className="p-2 hover:bg-secondary-100 rounded-lg"
                  >
                    <ApperIcon name="ChevronLeft" size={20} />
                  </button>
                  <button
onClick={() => setDate(add(date, { [view === 'month' ? 'months' : view === 'week' ? 'weeks' : 'days']: 1 }))}
                    className="p-2 hover:bg-secondary-100 rounded-lg"
                  >
                    <ApperIcon name="ChevronRight" size={20} />
                  </button>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-secondary-100 rounded-lg p-1">
                {['month', 'week', 'day', 'agenda'].map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize',
                      view === viewType
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-secondary-600 hover:text-secondary-900'
                    )}
                  >
                    {viewType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="flex-1 p-6">
            <div className="bg-white rounded-lg border border-secondary-200 h-full">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventDrop}
                selectable
                resizable
                dragFromOutsideItem={null}
                eventPropGetter={eventStyleGetter}
                formats={formats}
                step={60}
                showMultiDayTimes
                components={{
                  toolbar: () => null, // We have our own toolbar
                }}
                style={{ height: '100%', minHeight: '500px' }}
                className="calendar-container"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal - Reuse existing task detail functionality */}
      {showTaskDetail && selectedTask && (
        <Modal
          isOpen={showTaskDetail}
          onClose={() => setShowTaskDetail(false)}
          title="Event Details"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                {selectedTask.title}
              </h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  selectedTask.type === 'Meeting' && 'bg-green-100 text-green-800',
                  selectedTask.type === 'Call' && 'bg-orange-100 text-orange-800',
                  selectedTask.type === 'Email' && 'bg-purple-100 text-purple-800',
                  selectedTask.type === 'To-Do' && 'bg-blue-100 text-blue-800'
                )}>
                  {selectedTask.type}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                  {selectedTask.priority}
                </span>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-1">Description</h4>
                <p className="text-sm text-secondary-600">{selectedTask.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary-500">Due Date:</span>
                <span className="text-secondary-900">
{format(new Date(selectedTask.dueDate), 'MMM d, yyyy')}
                  {selectedTask.dueTime && ` at ${selectedTask.dueTime}`}
                </span>
              </div>
              
              {selectedTask.assignedTo && (
                <div className="flex justify-between">
                  <span className="text-secondary-500">Assigned To:</span>
                  <span className="text-secondary-900">{selectedTask.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTaskDetail(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // Navigate to tasks page with this task selected
                  window.location.href = '/tasks';
                }}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Edit in Tasks
              </Button>
            </div>
          </div>
        </Modal>
      )}

{/* Create Meeting Modal */}
      <MeetingForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setSelectedDate(null);
        }}
        onSubmit={handleMeetingCreated}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default Calendar;
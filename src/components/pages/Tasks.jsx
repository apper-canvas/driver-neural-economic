import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Modal from '@/components/molecules/Modal';
import SearchBar from '@/components/molecules/SearchBar';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import taskService from '@/services/api/taskService';
import { contactService } from '@/services/api/contactService';
import { getAll as getAllCompanies } from '@/services/api/companyService';
import dealService from '@/services/api/dealService';
import { cn } from '@/utils/cn';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    priority: '',
    type: '',
    assignedTo: '',
    relatedTo: ''
  });
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    type: 'To-Do',
    priority: 'Medium',
    dueDate: '',
    dueTime: '',
    assignedTo: '',
    relatedTo: null,
    description: '',
    reminders: []
  });
  
  // Related entities
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter tasks when category or filters change
  useEffect(() => {
    filterTasks();
  }, [tasks, selectedCategory, filters, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
const [tasksData, contactsData, companiesData, dealsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
        getAllCompanies(),
        dealService.getAll()
      ]);
      
      setTasks(tasksData);
      setContacts(contactsData);
      setCompanies(companiesData);
      setDeals(dealsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];
    const now = new Date();
    const today = now.toDateString();

    // Filter by category
    switch (selectedCategory) {
      case 'today':
        filtered = filtered.filter(task => 
          !task.completed && 
          new Date(task.dueDate).toDateString() === today
        );
        break;
      case 'upcoming':
        filtered = filtered.filter(task => 
          !task.completed && 
          new Date(task.dueDate) > now
        );
        break;
      case 'overdue':
        filtered = filtered.filter(task => 
          !task.completed && 
          new Date(task.dueDate) < now
        );
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      default:
        filtered = filtered.filter(task => !task.completed);
    }

    // Apply additional filters
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    
    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }
    
    if (filters.assignedTo) {
      filtered = filtered.filter(task => 
        task.assignedTo?.toLowerCase().includes(filters.assignedTo.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      const newTask = await taskService.create(formData);
      setTasks(prev => [...prev, newTask]);
      setShowCreateForm(false);
      resetForm();
      toast.success('Task created successfully');
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const updatedTask = await taskService.complete(taskId);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? updatedTask : task
      ));
      toast.success('Task completed');
    } catch (err) {
      console.error('Error completing task:', err);
      toast.error('Failed to complete task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      if (selectedTask?.Id === taskId) {
        setShowTaskDetail(false);
        setSelectedTask(null);
      }
      toast.success('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Failed to delete task');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      const comment = await taskService.addComment(selectedTask.Id, {
        text: newComment,
        author: 'Current User'
      });
      
      setSelectedTask(prev => ({
        ...prev,
        comments: [...(prev.comments || []), comment]
      }));
      
      setTasks(prev => prev.map(task => 
        task.Id === selectedTask.Id 
          ? { ...task, comments: [...(task.comments || []), comment] }
          : task
      ));
      
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'To-Do',
      priority: 'Medium',
      dueDate: '',
      dueTime: '',
      assignedTo: '',
      relatedTo: null,
      description: '',
      reminders: []
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDueDateColor = (dueDate, completed) => {
    if (completed) return 'text-gray-500';
    
    const now = new Date();
    const due = new Date(dueDate);
    const today = now.toDateString();
    
    if (due < now) return 'text-red-600'; // Overdue
    if (due.toDateString() === today) return 'text-orange-600'; // Today
    return 'text-gray-700'; // Upcoming
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'Call': return 'Phone';
      case 'Email': return 'Mail';
      case 'Meeting': return 'Calendar';
      case 'To-Do': return 'CheckSquare';
      default: return 'CheckSquare';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(task => 
      !task.completed && new Date(task.dueDate) < now
    );
  };

  if (loading) return <Loading className="min-h-screen" />;
  if (error) return <Error message={error} onRetry={loadData} className="min-h-screen" />;

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-secondary-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-secondary-900">Tasks</h1>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <ApperIcon name="Plus" size={16} />
                New Task
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name="List" size={16} />
                  My Tasks
                </div>
                <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                  {tasks.filter(t => !t.completed).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('today')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === 'today'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name="Calendar" size={16} />
                  Today
                </div>
                <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                  {tasks.filter(t => !t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString()).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('upcoming')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === 'upcoming'
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name="Clock" size={16} />
                  Upcoming
                </div>
                <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                  {tasks.filter(t => !t.completed && new Date(t.dueDate) > new Date()).length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('overdue')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === 'overdue'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name="AlertCircle" size={16} />
                  Overdue
                </div>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  {getOverdueTasks().length}
                </span>
              </button>

              <button
                onClick={() => setSelectedCategory('completed')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedCategory === 'completed'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'text-secondary-700 hover:bg-secondary-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <ApperIcon name="CheckCircle" size={16} />
                  Completed
                </div>
                <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                  {tasks.filter(t => t.completed).length}
                </span>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-t border-secondary-200">
            <h3 className="text-sm font-medium text-secondary-900 mb-3">Filters</h3>
            <div className="space-y-3">
              <Select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                placeholder="Priority"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Select>

              <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Task Type"
              >
                <option value="">All Types</option>
                <option value="Call">Call</option>
                <option value="Email">Email</option>
                <option value="Meeting">Meeting</option>
                <option value="To-Do">To-Do</option>
              </Select>

              <Input
                placeholder="Assigned To"
                value={filters.assignedTo}
                onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
              />

              {(filters.priority || filters.type || filters.assignedTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ priority: '', type: '', assignedTo: '', relatedTo: '' })}
                  className="w-full text-secondary-500 hover:text-secondary-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 bg-white border-b border-secondary-200">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search tasks..."
              className="max-w-md"
            />
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <ApperIcon name="CheckSquare" size={48} className="mx-auto text-secondary-400 mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No tasks found</h3>
                <p className="text-secondary-500 mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <ApperIcon name="Plus" size={16} />
                  Create Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.Id}
                    className="bg-white rounded-lg border border-secondary-200 hover:border-secondary-300 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskDetail(true);
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTask(task.Id);
                          }}
                          className={cn(
                            'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                            task.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-secondary-300 hover:border-primary-500'
                          )}
                        >
                          {task.completed && <ApperIcon name="Check" size={12} />}
                        </button>

                        {/* Priority Bar */}
                        <div className={cn('w-1 h-16 rounded-full', getPriorityColor(task.priority))} />

                        {/* Task Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={cn(
                                'font-medium text-secondary-900',
                                task.completed && 'line-through text-secondary-500'
                              )}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-secondary-500">
                                <div className="flex items-center gap-1">
                                  <ApperIcon name={getTaskTypeIcon(task.type)} size={14} />
                                  {task.type}
                                </div>
                                <div className={getDueDateColor(task.dueDate, task.completed)}>
                                  {formatDate(task.dueDate)}
                                  {task.dueTime && ` at ${task.dueTime}`}
                                </div>
                                {task.assignedTo && (
                                  <div>Assigned to: {task.assignedTo}</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{task.priority}</Badge>
                              {task.relatedTo && (
                                <Badge variant="outline">
                                  {task.relatedTo.type}: {task.relatedTo.name}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {task.description && (
                            <p className="mt-2 text-sm text-secondary-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setShowTaskDetail(true);
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              View Details
                            </button>
                            <span className="text-secondary-300">•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!task.completed) {
                                  handleCompleteTask(task.Id);
                                }
                              }}
                              className="text-xs text-green-600 hover:text-green-700 font-medium"
                              disabled={task.completed}
                            >
                              {task.completed ? 'Completed' : 'Mark Complete'}
                            </button>
                            <span className="text-secondary-300">•</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.Id);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Panel */}
        {showTaskDetail && selectedTask && (
          <div className="w-96 bg-white border-l border-secondary-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-secondary-900">Task Details</h2>
                <button
                  onClick={() => setShowTaskDetail(false)}
                  className="text-secondary-500 hover:text-secondary-700"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Task Info */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <button
                    onClick={() => handleCompleteTask(selectedTask.Id)}
                    className={cn(
                      'mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                      selectedTask.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-secondary-300 hover:border-primary-500'
                    )}
                  >
                    {selectedTask.completed && <ApperIcon name="Check" size={14} />}
                  </button>
                  <div className="flex-1">
                    <h3 className={cn(
                      'text-lg font-medium text-secondary-900',
                      selectedTask.completed && 'line-through text-secondary-500'
                    )}>
                      {selectedTask.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{selectedTask.priority}</Badge>
                      <Badge variant="outline">{selectedTask.type}</Badge>
                    </div>
                  </div>
                </div>

                {selectedTask.description && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-secondary-700 mb-2">Description</h4>
                    <p className="text-sm text-secondary-600">{selectedTask.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-secondary-500">Due Date:</span>
                    <span className={getDueDateColor(selectedTask.dueDate, selectedTask.completed)}>
                      {formatDate(selectedTask.dueDate)}
                      {selectedTask.dueTime && ` at ${selectedTask.dueTime}`}
                    </span>
                  </div>
                  
                  {selectedTask.assignedTo && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Assigned To:</span>
                      <span className="text-secondary-900">{selectedTask.assignedTo}</span>
                    </div>
                  )}
                  
                  {selectedTask.relatedTo && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Related To:</span>
                      <span className="text-secondary-900">
                        {selectedTask.relatedTo.type}: {selectedTask.relatedTo.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-secondary-500">Created:</span>
                    <span className="text-secondary-900">
                      {formatDate(selectedTask.createdAt)}
                    </span>
                  </div>
                  
                  {selectedTask.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-secondary-500">Completed:</span>
                      <span className="text-green-600">
                        {formatDate(selectedTask.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Comments</h4>
                <div className="space-y-3 mb-4">
                  {(selectedTask.comments || []).map((comment) => (
                    <div key={comment.id} className="bg-secondary-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-medium text-secondary-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
                
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                  >
                    <ApperIcon name="Send" size={14} />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-secondary-200">
                <Button
                  onClick={() => handleCompleteTask(selectedTask.Id)}
                  disabled={selectedTask.completed}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ApperIcon name="Check" size={16} />
                  {selectedTask.completed ? 'Completed' : 'Complete'}
                </Button>
                <Button
                  onClick={() => handleDeleteTask(selectedTask.Id)}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <ApperIcon name="Trash2" size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          resetForm();
        }}
        title="Create New Task"
        size="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title *"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter task title"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Task Type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="To-Do">To-Do</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Meeting">Meeting</option>
            </Select>

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />

            <Input
              label="Due Time"
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
            />
          </div>

          <Input
            label="Assigned To"
            value={formData.assignedTo}
            onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="Enter assignee name"
          />

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Related To
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={formData.relatedTo?.type || ''}
                onChange={(e) => {
                  const type = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    relatedTo: type ? { type, id: '', name: '' } : null
                  }));
                }}
              >
                <option value="">Select Type</option>
                <option value="Contact">Contact</option>
                <option value="Company">Company</option>
                <option value="Deal">Deal</option>
              </Select>

              {formData.relatedTo?.type && (
                <Select
                  value={formData.relatedTo.id}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    let name = '';
                    let entities = [];
                    
                    switch (formData.relatedTo.type) {
                      case 'Contact':
                        entities = contacts;
                        break;
                      case 'Company':
                        entities = companies;
                        break;
                      case 'Deal':
                        entities = deals;
                        break;
                    }
                    
                    const entity = entities.find(e => e.Id === id);
                    if (entity) {
                      name = entity.name || entity.firstName + ' ' + entity.lastName || entity.title;
                    }
                    
                    setFormData(prev => ({
                      ...prev,
                      relatedTo: { ...prev.relatedTo, id, name }
                    }));
                  }}
                >
                  <option value="">Select {formData.relatedTo.type}</option>
                  {formData.relatedTo.type === 'Contact' && contacts.map(contact => (
                    <option key={contact.Id} value={contact.Id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                  {formData.relatedTo.type === 'Company' && companies.map(company => (
                    <option key={company.Id} value={company.Id}>
                      {company.name}
                    </option>
                  ))}
                  {formData.relatedTo.type === 'Deal' && deals.map(deal => (
                    <option key={deal.Id} value={deal.Id}>
                      {deal.title}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter task description"
            multiline
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
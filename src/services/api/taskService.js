import { toast } from 'react-toastify';

const STORAGE_KEY = 'crm-tasks';

// Mock data for initial load
const mockTasks = [
  {
    Id: 1,
    title: 'Follow up with Johnson Corp',
    type: 'Call',
    priority: 'High',
    dueDate: '2024-01-15',
    dueTime: '10:00',
    assignedTo: 'John Smith',
    relatedTo: { type: 'Company', id: 1, name: 'Johnson Corp' },
    description: 'Discuss the quarterly review and next steps for the partnership.',
    completed: false,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-10T09:00:00Z',
    comments: [
      {
        id: 1,
        text: 'Initial contact made, scheduling follow-up',
        createdAt: '2024-01-10T09:30:00Z',
        author: 'John Smith'
      }
    ],
    reminders: ['1 hour before', '1 day before']
  },
  {
    Id: 2,
    title: 'Send proposal to Sarah Wilson',
    type: 'Email',
    priority: 'Medium',
    dueDate: '2024-01-14',
    dueTime: '14:00',
    assignedTo: 'Jane Doe',
    relatedTo: { type: 'Contact', id: 1, name: 'Sarah Wilson' },
    description: 'Prepare and send the detailed proposal for the new project.',
    completed: false,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z',
    comments: [],
    reminders: ['2 hours before']
  },
  {
    Id: 3,
    title: 'Demo meeting preparation',
    type: 'Meeting',
    priority: 'High',
    dueDate: '2024-01-13',
    dueTime: '09:00',
    assignedTo: 'Mike Johnson',
    relatedTo: { type: 'Deal', id: 1, name: 'Q1 Enterprise Deal' },
    description: 'Prepare demo materials and test all systems before client presentation.',
    completed: true,
    completedAt: '2024-01-12T16:30:00Z',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-12T16:30:00Z',
    comments: [
      {
        id: 1,
        text: 'Demo environment set up successfully',
        createdAt: '2024-01-12T14:00:00Z',
        author: 'Mike Johnson'
      }
    ],
    reminders: ['30 minutes before']
  },
  {
    Id: 4,
    title: 'Update CRM records',
    type: 'To-Do',
    priority: 'Low',
    dueDate: '2024-01-20',
    dueTime: '16:00',
    assignedTo: 'Sarah Davis',
    relatedTo: null,
    description: 'Clean up and update all contact records in the system.',
    completed: false,
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-08T10:00:00Z',
    comments: [],
    reminders: []
  }
];

// Initialize storage
function initializeStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));
  }
}

// Get stored tasks
function getStoredTasks() {
  initializeStorage();
  const stored = localStorage.getItem(STORAGE_KEY);
  return JSON.parse(stored) || [];
}

// Save tasks
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all tasks
export async function getAll() {
  await delay(300);
  return [...getStoredTasks()];
}

// Get task by ID
export async function getById(id) {
  await delay(200);
  const tasks = getStoredTasks();
  const task = tasks.find(t => t.Id === parseInt(id));
  if (!task) {
    throw new Error('Task not found');
  }
  return { ...task };
}

// Create task
export async function create(taskData) {
  await delay(400);
  const tasks = getStoredTasks();
  const newId = Math.max(0, ...tasks.map(t => t.Id)) + 1;
  
  const newTask = {
    ...taskData,
    Id: newId,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [],
    reminders: taskData.reminders || []
  };
  
  tasks.push(newTask);
  saveTasks(tasks);
  return { ...newTask };
}

// Update task
export async function update(id, updates) {
  await delay(350);
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.Id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Task not found');
  }
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return { ...tasks[index] };
}

// Delete task
export async function deleteTask(id) {
  await delay(300);
  const tasks = getStoredTasks();
  const filteredTasks = tasks.filter(t => t.Id !== parseInt(id));
  
  if (tasks.length === filteredTasks.length) {
    throw new Error('Task not found');
  }
  
  saveTasks(filteredTasks);
  return true;
}

// Complete task
export async function completeTask(id) {
  await delay(250);
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.Id === parseInt(id));
  
  if (index === -1) {
    throw new Error('Task not found');
  }
  
  tasks[index] = {
    ...tasks[index],
    completed: true,
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return { ...tasks[index] };
}

// Add comment to task
export async function addComment(taskId, comment) {
  await delay(200);
  const tasks = getStoredTasks();
  const index = tasks.findIndex(t => t.Id === parseInt(taskId));
  
  if (index === -1) {
    throw new Error('Task not found');
  }
  
  const newComment = {
    id: Date.now(),
    text: comment.text,
    createdAt: new Date().toISOString(),
    author: comment.author || 'Current User'
  };
  
  tasks[index] = {
    ...tasks[index],
    comments: [...(tasks[index].comments || []), newComment],
    updatedAt: new Date().toISOString()
  };
  
  saveTasks(tasks);
  return newComment;
}

// Get tasks by status
export async function getTasksByStatus(status) {
  await delay(250);
  const tasks = getStoredTasks();
  const now = new Date();
  const today = now.toDateString();
  
  switch (status) {
    case 'today':
      return tasks.filter(task => 
        !task.completed && 
        new Date(task.dueDate).toDateString() === today
      );
    case 'upcoming':
      return tasks.filter(task => 
        !task.completed && 
        new Date(task.dueDate) > now
      );
    case 'overdue':
      return tasks.filter(task => 
        !task.completed && 
        new Date(task.dueDate) < now
      );
    case 'completed':
      return tasks.filter(task => task.completed);
    default:
      return tasks.filter(task => !task.completed);
  }
}

// Get tasks by filters
export async function getFilteredTasks(filters) {
  await delay(300);
  let tasks = getStoredTasks();
  
  if (filters.priority) {
    tasks = tasks.filter(task => task.priority === filters.priority);
  }
  
  if (filters.type) {
    tasks = tasks.filter(task => task.type === filters.type);
  }
  
  if (filters.assignedTo) {
    tasks = tasks.filter(task => 
      task.assignedTo?.toLowerCase().includes(filters.assignedTo.toLowerCase())
    );
  }
  
  if (filters.relatedTo) {
    tasks = tasks.filter(task => 
      task.relatedTo?.type === filters.relatedTo.type &&
      task.relatedTo?.id === filters.relatedTo.id
    );
  }
  
  return tasks;
}

const taskService = {
  getAll,
  getById,
  create,
  update,
  delete: deleteTask,
  complete: completeTask,
  addComment,
  getTasksByStatus,
  getFilteredTasks
};

export default taskService;
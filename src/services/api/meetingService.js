import { toast } from 'react-toastify';
import mockMeetings from '@/services/mockData/meetings.json';

// Initialize localStorage if not exists
function initializeStorage() {
  if (!localStorage.getItem('meetings')) {
    localStorage.setItem('meetings', JSON.stringify(mockMeetings));
  }
}

// Get meetings from localStorage
function getStoredMeetings() {
  initializeStorage();
  return JSON.parse(localStorage.getItem('meetings') || '[]');
}

// Save meetings to localStorage
function saveMeetings(meetings) {
  localStorage.setItem('meetings', JSON.stringify(meetings));
}

// Add delay to simulate API call
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const meetingService = {
  // Get all meetings
  async getAll() {
    await delay(200); // Simulate network delay
    return getStoredMeetings().map(meeting => ({ ...meeting }));
  },

  // Get meeting by ID
  async getById(id) {
    await delay(150);
    const meetings = getStoredMeetings();
    const meeting = meetings.find(m => m.Id === parseInt(id));
    if (!meeting) {
      throw new Error(`Meeting with ID ${id} not found`);
    }
    return { ...meeting };
  },

  // Create new meeting
  async create(meetingData) {
    await delay(300);
    const meetings = getStoredMeetings();
    
    // Generate new ID
    const maxId = meetings.reduce((max, meeting) => Math.max(max, meeting.Id), 0);
    const newId = maxId + 1;

    const newMeeting = {
      Id: newId,
      ...meetingData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    meetings.push(newMeeting);
    saveMeetings(meetings);
    
    return { ...newMeeting };
  },

  // Update existing meeting
  async update(id, updatedData) {
    await delay(250);
    const meetings = getStoredMeetings();
    const index = meetings.findIndex(m => m.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error(`Meeting with ID ${id} not found`);
    }

    const updatedMeeting = {
      ...meetings[index],
      ...updatedData,
      Id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    meetings[index] = updatedMeeting;
    saveMeetings(meetings);
    
    return { ...updatedMeeting };
  },

  // Delete meeting
  async delete(id) {
    await delay(200);
    const meetings = getStoredMeetings();
    const index = meetings.findIndex(m => m.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error(`Meeting with ID ${id} not found`);
    }

    const deletedMeeting = meetings[index];
    meetings.splice(index, 1);
    saveMeetings(meetings);
    
    return { ...deletedMeeting };
  },

  // Get meetings by date range
  async getByDateRange(startDate, endDate) {
    await delay(200);
    const meetings = getStoredMeetings();
    
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return meetingDate >= start && meetingDate <= end;
    }).map(meeting => ({ ...meeting }));
  },

  // Get meetings by status
  async getByStatus(status) {
    await delay(150);
    const meetings = getStoredMeetings();
    
    return meetings.filter(meeting => 
      meeting.status === status
    ).map(meeting => ({ ...meeting }));
  },

  // Update meeting status
  async updateStatus(id, status) {
    await delay(200);
    return this.update(id, { status });
  }
};

export default meetingService;
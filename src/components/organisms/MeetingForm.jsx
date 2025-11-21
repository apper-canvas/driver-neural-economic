import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Modal from '@/components/molecules/Modal';
import ApperIcon from '@/components/ApperIcon';
import { contactService } from '@/services/api/contactService';
import meetingService from '@/services/api/meetingService';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';

function MeetingForm({ isOpen, onClose, onSubmit, selectedDate = null }) {
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    attendees: [],
    location: '',
    videoLink: '',
    locationType: 'physical', // 'physical' or 'virtual'
    description: '',
    reminder: '15', // minutes before
    reminderEnabled: true
  });
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Initialize form with selected date
  useEffect(() => {
    if (selectedDate && isOpen) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const defaultStartTime = '09:00';
      const defaultEndTime = '10:00';
      
      setFormData(prev => ({
        ...prev,
        startDate: dateStr,
        endDate: dateStr,
        startTime: defaultStartTime,
        endTime: defaultEndTime
      }));
    }
  }, [selectedDate, isOpen]);

  // Load contacts for attendees selection
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        const contactsData = await contactService.getAll();
        setContacts(contactsData);
      } catch (err) {
        console.error('Error loading contacts:', err);
        toast.error('Failed to load contacts');
      } finally {
        setLoadingContacts(false);
      }
    };

    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-adjust end time when start time changes
    if (field === 'startTime' && value) {
      const [hours, minutes] = value.split(':').map(Number);
      const endHours = hours + 1;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, endTime }));
    }

    // Auto-set end date when start date changes
    if (field === 'startDate' && value && !formData.endDate) {
      setFormData(prev => ({ ...prev, endDate: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Validate end time is after start time for same day meetings
    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.locationType === 'physical' && !formData.location.trim()) {
      newErrors.location = 'Location is required for physical meetings';
    }

    if (formData.locationType === 'virtual' && !formData.videoLink.trim()) {
      newErrors.videoLink = 'Video link is required for virtual meetings';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const meetingData = {
        title: formData.title.trim(),
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        attendees: formData.attendees,
        location: formData.locationType === 'physical' ? formData.location.trim() : '',
        videoLink: formData.locationType === 'virtual' ? formData.videoLink.trim() : '',
        locationType: formData.locationType,
        description: formData.description.trim(),
        reminder: formData.reminderEnabled ? parseInt(formData.reminder) : null,
        type: 'Meeting',
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      };

      const newMeeting = await meetingService.create(meetingData);
      
      if (onSubmit) {
        onSubmit(newMeeting);
      }
      
      toast.success('Meeting created successfully!');
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error creating meeting:', err);
      toast.error('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      attendees: [],
      location: '',
      videoLink: '',
      locationType: 'physical',
      description: '',
      reminder: '15',
      reminderEnabled: true
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleAttendee = (contactId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(contactId)
        ? prev.attendees.filter(id => id !== contactId)
        : [...prev.attendees, contactId]
    }));
  };

  const getSelectedContactNames = () => {
    return contacts
      .filter(contact => formData.attendees.includes(contact.Id))
      .map(contact => `${contact.firstName} ${contact.lastName}`)
      .join(', ');
  };

  const reminderOptions = [
    { value: '0', label: 'No reminder' },
    { value: '5', label: '5 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Meeting"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meeting Title */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Meeting Title *
          </label>
          <Input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter meeting title"
            className={cn(
              errors.title && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Start Date *
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={cn(
                errors.startDate && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Start Time *
            </label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
              className={cn(
                errors.startTime && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              End Date *
            </label>
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={cn(
                errors.endDate && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              End Time *
            </label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange('endTime', e.target.value)}
              className={cn(
                errors.endTime && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Attendees
          </label>
          {loadingContacts ? (
            <div className="text-sm text-secondary-500">Loading contacts...</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-secondary-600">
                {formData.attendees.length > 0 
                  ? `Selected: ${getSelectedContactNames()}`
                  : 'No attendees selected'
                }
              </div>
              <div className="max-h-32 overflow-y-auto border border-secondary-200 rounded-md">
                {contacts.length === 0 ? (
                  <div className="p-3 text-sm text-secondary-500">No contacts available</div>
                ) : (
                  contacts.map((contact) => (
                    <label
                      key={contact.Id}
                      className="flex items-center p-2 hover:bg-secondary-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(contact.Id)}
                        onChange={() => toggleAttendee(contact.Id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      />
                      <span className="ml-2 text-sm text-secondary-700">
                        {contact.firstName} {contact.lastName}
                        {contact.email && (
                          <span className="text-secondary-500"> ({contact.email})</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Meeting Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value="physical"
                checked={formData.locationType === 'physical'}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
              />
              <span className="ml-2 text-sm text-secondary-700">In-person</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="locationType"
                value="virtual"
                checked={formData.locationType === 'virtual'}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300"
              />
              <span className="ml-2 text-sm text-secondary-700">Virtual</span>
            </label>
          </div>
        </div>

        {/* Location or Video Link */}
        {formData.locationType === 'physical' ? (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Location *
            </label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Enter meeting location"
              className={cn(
                errors.location && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Video Link *
            </label>
            <Input
              type="url"
              value={formData.videoLink}
              onChange={(e) => handleChange('videoLink', e.target.value)}
              placeholder="https://meet.google.com/... or https://zoom.us/..."
              className={cn(
                errors.videoLink && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {errors.videoLink && (
              <p className="mt-1 text-sm text-red-600">{errors.videoLink}</p>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Add meeting agenda, notes, or other details..."
            rows={4}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
          />
        </div>

        {/* Reminder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-secondary-700">
              Reminder
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.reminderEnabled}
                onChange={(e) => handleChange('reminderEnabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <span className="ml-2 text-sm text-secondary-600">Enable reminder</span>
            </label>
          </div>
          {formData.reminderEnabled && (
            <Select
              value={formData.reminder}
              onChange={(e) => handleChange('reminder', e.target.value)}
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ApperIcon name="Calendar" size={16} />
                Create Meeting
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default MeetingForm;
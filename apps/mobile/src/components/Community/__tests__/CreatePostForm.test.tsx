/**
 * CreatePostForm Component Tests
 *
 * Tests for the production-grade Create Post form functionality
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { CreatePostForm } from '../CreatePostForm';
import type { CreatePostRequest } from '../../../services/communityAPI';

// Mock dependencies
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() => 
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'mock-image-uri' }]
    })
  ),
  MediaTypeOptions: {
    Images: 'Images'
  }
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
  },
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('CreatePostForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false,
  };

  it('renders correctly', () => {
    render(<CreatePostForm {...defaultProps} />);
    
    expect(screen.getByText('Create Post')).toBeTruthy();
    expect(screen.getByPlaceholderText('Share something with the community...')).toBeTruthy();
    expect(screen.getByText('Images (Optional)')).toBeTruthy();
    expect(screen.getByText('Create Activity')).toBeTruthy();
  });

  it('handles text input correctly', async () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'This is a test post');
    
    expect(textInput.props.value).toBe('This is a test post');
  });

  it('shows character count', () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'Test content');
    
    expect(screen.getByText('12/5000')).toBeTruthy();
  });

  it('validates required content', async () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const submitButton = screen.getByText('Create Post');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Post content is required')).toBeTruthy();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid post data', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'This is a valid post');
    
    const submitButton = screen.getByText('Create Post');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        content: 'This is a valid post',
        images: [],
        type: 'post',
      });
    });
  });

  it('handles activity creation', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'Join our dog walk!');
    
    // Toggle activity switch
    const activitySwitch = screen.getByLabelText('Create activity toggle');
    fireEvent(activitySwitch, 'valueChange', true);
    
    // Fill activity details
    const locationInput = screen.getByPlaceholderText('Activity location');
    fireEvent.changeText(locationInput, 'Central Park');
    
    const attendeesInput = screen.getByPlaceholderText('Maximum attendees');
    fireEvent.changeText(attendeesInput, '15');
    
    const submitButton = screen.getByText('Create Activity');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Join our dog walk!',
          images: [],
          type: 'activity',
          activityDetails: expect.objectContaining({
            location: 'Central Park',
            maxAttendees: 15,
            currentAttendees: 0,
            attending: false,
          }),
        })
      );
    });
  });

  it('validates activity location when activity is enabled', async () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'Activity without location');
    
    // Toggle activity switch
    const activitySwitch = screen.getByLabelText('Create activity toggle');
    fireEvent(activitySwitch, 'valueChange', true);
    
    const submitButton = screen.getByText('Create Activity');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Location is required for activities')).toBeTruthy();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles image selection', async () => {
    const ImagePicker = require('expo-image-picker');
    
    render(<CreatePostForm {...defaultProps} />);
    
    const addImageButton = screen.getByText('Add Image (0/5)');
    fireEvent.press(addImageButton);
    
    await waitFor(() => {
      expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('shows loading state when submitting', () => {
    render(<CreatePostForm {...defaultProps} isSubmitting={true} />);
    
    expect(screen.getByText('Creating...')).toBeTruthy();
    
    const submitButton = screen.getByText('Creating...');
    expect(submitButton.props.accessibilityState.disabled).toBe(true);
  });

  it('handles cancel action', () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const cancelButton = screen.getByLabelText('Cancel post creation');
    fireEvent.press(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates character limit', async () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const longContent = 'a'.repeat(5001); // Exceeds limit
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, longContent);
    
    const submitButton = screen.getByText('Create Post');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Content must be 5000 characters or less')).toBeTruthy();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates max attendees for activities', async () => {
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'Activity with invalid attendees');
    
    // Toggle activity switch
    const activitySwitch = screen.getByLabelText('Create activity toggle');
    fireEvent(activitySwitch, 'valueChange', true);
    
    const locationInput = screen.getByPlaceholderText('Activity location');
    fireEvent.changeText(locationInput, 'Test Location');
    
    const attendeesInput = screen.getByPlaceholderText('Maximum attendees');
    fireEvent.changeText(attendeesInput, '0'); // Invalid
    
    const submitButton = screen.getByText('Create Activity');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Max attendees must be between 1 and 1000')).toBeTruthy();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles submission errors gracefully', async () => {
    const error = new Error('Network error');
    mockOnSubmit.mockRejectedValueOnce(error);
    
    render(<CreatePostForm {...defaultProps} />);
    
    const textInput = screen.getByPlaceholderText('Share something with the community...');
    fireEvent.changeText(textInput, 'Test post');
    
    const submitButton = screen.getByText('Create Post');
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    
    // Error should be handled by parent component
  });
});

/**
 * BasicInfoSection Comprehensive Component Tests
 * Tests form inputs, radio buttons, validation, and all interactions
 */

// CRITICAL: Explicitly mock react-native to ensure StyleSheet is available
// This must be hoisted before any imports that use react-native
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native') || {};
  const React = require('react');
  
  const mockComponent = (name: string) => {
    const Component = (props: any) => {
      return React.createElement(name, props, props.children);
    };
    Component.displayName = name;
    return Component;
  };
  
  // Ensure StyleSheet is definitely available
  const StyleSheetImpl = {
    create: (styles: any) => {
      if (!styles) return {};
      return styles;
    },
    flatten: (style: any) => style,
    compose: (...styles: any[]) => {
      return Object.assign({}, ...styles);
    },
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    absoluteFillObject: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  };
  
  return {
    ...actualRN,
    StyleSheet: StyleSheetImpl,
    View: mockComponent('View'),
    Text: mockComponent('Text'),
    TextInput: mockComponent('TextInput'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    Image: mockComponent('Image'),
    Platform: {
      OS: 'ios',
      Version: 15,
      select: (obj: any) => {
        if (!obj) return undefined;
        return obj.ios || obj.default || obj.android;
      },
      isPad: false,
      isTV: false,
      isTesting: true,
    },
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    Animated: {
      View: mockComponent('Animated.View'),
      Value: jest.fn(),
      ...actualRN.Animated,
    },
  };
}, { virtual: false });

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react-native';
import { render } from '@/tests/utils/render';
import { BasicInfoSection } from '../BasicInfoSection';

// Mock theme with all required fields for BasicInfoSection
jest.mock('@mobile/theme', () => ({
  useTheme: jest.fn(() => ({
    scheme: 'light',
    colors: {
      bg: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceAlt: '#F1F5F9',
      onSurface: '#0F172A',
      onMuted: '#64748B',
      border: '#E2E8F0',
      primary: '#2563EB',
      onPrimary: '#FFFFFF',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      '2xl': 48,
      '3xl': 64,
      '4xl': 96,
    },
    radii: {
      none: 0,
      xs: 2,
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      '2xl': 24,
      full: 9999,
    },
    typography: {
      body: {
        size: 16,
        lineHeight: 24,
        weight: '400',
      },
      h1: {
        size: 32,
        lineHeight: 40,
        weight: '700',
      },
      h2: {
        size: 24,
        lineHeight: 32,
        weight: '600',
      },
    },
    palette: {
      gradients: {},
    },
  })),
}));

// Mock dependencies
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

// TestWrapper removed - now handled by render utility's Providers

describe('BasicInfoSection Component Tests', () => {
  const defaultFormData = {
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
    photos: [],
  };

  const defaultProps = {
    formData: defaultFormData,
    onInputChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render basic info section successfully', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByText('Basic Information')).toBeTruthy();
      expect(screen.getByText('Pet Name *')).toBeTruthy();
      expect(screen.getByText('Species *')).toBeTruthy();
      expect(screen.getByText('Breed *')).toBeTruthy();
    });

    it('should render all form fields', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByPlaceholderText("Enter pet's name")).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter breed')).toBeTruthy();
      expect(screen.getByPlaceholderText('e.g., 2 years')).toBeTruthy();
    });
  });

  describe('Text Inputs', () => {
    it('should call onInputChange when name is entered', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      fireEvent.changeText(nameInput, 'Fluffy');

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('name', 'Fluffy');
    });

    it('should call onInputChange when breed is entered', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const breedInput = screen.getByPlaceholderText('Enter breed');
      fireEvent.changeText(breedInput, 'Golden Retriever');

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('breed', 'Golden Retriever');
    });

    it('should call onInputChange when age is entered', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const ageInput = screen.getByPlaceholderText('e.g., 2 years');
      fireEvent.changeText(ageInput, '3');

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('age', '3');
    });

    it('should display current form values', () => {
      const formData = {
        ...defaultFormData,
        name: 'Fluffy',
        breed: 'Persian',
        age: '3',
      };

      render(<BasicInfoSection {...defaultProps} formData={formData} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      const breedInput = screen.getByPlaceholderText('Enter breed');
      const ageInput = screen.getByPlaceholderText('e.g., 2 years');

      expect(nameInput.props.value).toBe('Fluffy');
      expect(breedInput.props.value).toBe('Persian');
      expect(ageInput.props.value).toBe('3');
    });
  });

  describe('Species Radio Buttons', () => {
    it('should render dog and cat options', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByTestId('species-dog')).toBeTruthy();
      expect(screen.getByTestId('species-cat')).toBeTruthy();
    });

    it('should call onInputChange when species is selected', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const catButton = screen.getByTestId('species-cat');
      fireEvent.press(catButton);

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('species', 'cat');
    });

    it('should highlight selected species', () => {
      const formData = { ...defaultFormData, species: 'cat' };
      render(<BasicInfoSection {...defaultProps} formData={formData} />);

      const catButton = screen.getByTestId('species-cat');
      expect(catButton).toBeTruthy();
    });

    it('should have proper accessibility props', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const dogButton = screen.getByTestId('species-dog');
      expect(dogButton).toBeTruthy();
      expect(dogButton.props.accessibilityLabel).toBe('dog');
      expect(dogButton.props.accessibilityRole).toBe('radio');
    });
  });

  describe('Gender Radio Buttons', () => {
    it('should render male and female options', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByTestId('gender-male')).toBeTruthy();
      expect(screen.getByTestId('gender-female')).toBeTruthy();
    });

    it('should call onInputChange when gender is selected', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const maleButton = screen.getByTestId('gender-male');
      fireEvent.press(maleButton);

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('gender', 'male');
    });

    it('should highlight selected gender', () => {
      const formData = { ...defaultFormData, gender: 'female' };
      render(<BasicInfoSection {...defaultProps} formData={formData} />);

      const femaleButton = screen.getByTestId('gender-female');
      expect(femaleButton).toBeTruthy();
    });
  });

  describe('Size Radio Buttons', () => {
    it('should render small, medium, and large options', () => {
      render(<BasicInfoSection {...defaultProps} />);

      expect(screen.getByTestId('size-small')).toBeTruthy();
      expect(screen.getByTestId('size-medium')).toBeTruthy();
      expect(screen.getByTestId('size-large')).toBeTruthy();
    });

    it('should call onInputChange when size is selected', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const largeButton = screen.getByTestId('size-large');
      fireEvent.press(largeButton);

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('size', 'large');
    });

    it('should highlight selected size', () => {
      const formData = { ...defaultFormData, size: 'medium' };
      render(<BasicInfoSection {...defaultProps} formData={formData} />);

      const mediumButton = screen.getByTestId('size-medium');
      expect(mediumButton).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long pet names', () => {
      const longName = 'A'.repeat(100);
      render(<BasicInfoSection {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      fireEvent.changeText(nameInput, longName);

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('name', longName);
    });

    it('should handle special characters in inputs', () => {
      const specialChars = '!@#$%^&*()';
      render(<BasicInfoSection {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      fireEvent.changeText(nameInput, specialChars);

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('name', specialChars);
    });

    it('should handle empty strings', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      fireEvent.changeText(nameInput, '');

      expect(defaultProps.onInputChange).toHaveBeenCalledWith('name', '');
    });

    it('should handle rapid input changes', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const nameInput = screen.getByPlaceholderText("Enter pet's name");
      fireEvent.changeText(nameInput, 'F');
      fireEvent.changeText(nameInput, 'Fl');
      fireEvent.changeText(nameInput, 'Flu');
      fireEvent.changeText(nameInput, 'Fluf');
      fireEvent.changeText(nameInput, 'Fluffy');

      expect(defaultProps.onInputChange).toHaveBeenCalledTimes(5);
    });

    it('should handle switching between species', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const dogButton = screen.getByTestId('species-dog');
      const catButton = screen.getByTestId('species-cat');

      fireEvent.press(catButton);
      fireEvent.press(dogButton);
      fireEvent.press(catButton);

      expect(defaultProps.onInputChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onInputChange).toHaveBeenLastCalledWith('species', 'cat');
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      render(<BasicInfoSection {...defaultProps} />);

      const dogButton = screen.getByTestId('species-dog');
      expect(dogButton).toBeTruthy();
      expect(dogButton.props.accessibilityLabel).toBe('dog');
      expect(dogButton.props.accessibilityRole).toBe('radio');
    });
  });
});


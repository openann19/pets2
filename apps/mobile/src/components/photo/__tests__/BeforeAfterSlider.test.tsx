import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: any) => <test-element name={name} />,
}));
jest.mock('../common/SmartImage', () => ({
  SmartImage: ({ source }: any) => <test-element source={source.uri} />,
}));
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    Gesture: {
      Pan: jest.fn(() => ({
        onBegin: jest.fn().mockReturnThis(),
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
      })),
    },
    GestureDetector: ({ children, gesture }: any) => {
      // Simulate gesture by exposing test handlers
      const mockGesture = gesture();
      return React.cloneElement(children, {
        testID: 'gesture-detector',
        mockGesture,
      });
    },
  };
});

describe('BeforeAfterSlider', () => {
  const mockOriginalUri = 'file://original.jpg';
  const mockEditedUri但是我

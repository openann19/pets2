/**
 * Navigation-related mocks
 * Loaded for tests involving navigation and routing
 */

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  const actual = (jest as any).requireActual('@react-navigation/native');
  const NavigationContainerComponent = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(React.Fragment, null, children);
  };
  NavigationContainerComponent.displayName = 'NavigationContainer';
  
  return {
    ...actual,
    NavigationContainer: NavigationContainerComponent,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(() => jest.fn()),
    }),
    useRoute: () => ({
      params: {},
      key: 'test-route',
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn((callback: any) => callback()),
    useIsFocused: jest.fn(() => true),
    useTheme: () => ({
      colors: {
        primary: '#007AFF',
        background: '#FFFFFF',
        card: '#FFFFFF',
        text: '#000000',
        border: '#E5E5E5',
        notification: '#FF3B30',
      },
      dark: false,
    }),
  };
});

// Mock @react-native-masked-view/masked-view
jest.mock('@react-native-masked-view/masked-view', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
  MaskedViewIOS: ({ children }: any) => children,
}));


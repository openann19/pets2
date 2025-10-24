import '@testing-library/jest-dom';

// Mock window.matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo for tests
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock react-aria components for testing
jest.mock('@react-aria/button', () => ({
  useButton: () => ({
    buttonProps: {},
    isPressed: false
  })
}));

jest.mock('@react-aria/focus', () => ({
  useFocusRing: () => ({
    focusProps: {},
    isFocused: false
  })
}));

jest.mock('@react-aria/interactions', () => ({
  useHover: () => ({
    hoverProps: {},
    isHovered: false
  })
}));

jest.mock('@react-aria/utils', () => ({
  mergeProps: (...props: Record<string, unknown>[]) => Object.assign({}, ...props)
}));

jest.mock('@react-aria/textfield', () => ({
  useTextField: () => ({
    inputProps: {},
    labelProps: {},
    descriptionProps: {},
    errorMessageProps: {}
  })
}));

jest.mock('@react-aria/overlays', () => ({
  useOverlay: () => ({
    overlayProps: {}
  }),
  usePreventScroll: () => ({}),
  useModal: () => ({})
}));

jest.mock('@react-aria/dialog', () => ({
  useDialog: () => ({
    dialogProps: {},
    titleProps: {}
  })
}));

import type { Preview } from '@storybook/react';
import { withThemeProvider } from './withThemeProvider';
import './preview.css';

const preview: Preview = {
  decorators: [withThemeProvider],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
    a11y: { element: '#storybook-root' },
    layout: 'centered',
  },
};

export default preview;


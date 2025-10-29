import { render } from '@testing-library/react-native';

describe('Simple React Native Test', () => {
  it('renders a simple View component', () => {
    const { View } = require('react-native');
    const SimpleComponent = () => <View />;

    const { container } = render(<SimpleComponent />);
    expect(container).toBeTruthy();
  });
});

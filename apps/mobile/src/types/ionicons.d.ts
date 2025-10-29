declare module '@expo/vector-icons/build/createIconSet' {
  import type { StyleProp, TextProps, TextStyle } from 'react-native';

  export interface IconProps extends Omit<TextProps, 'style'> {
    name: any;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    accessibilityLabel?: string;
  }

  export default function createIconSet(
    glyphMap: any,
    fontFamily: string,
    fontFile: string,
    options?: any,
  ): React.ComponentType<IconProps>;
}

import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';

export type StackDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps extends ViewProps {
  direction?: StackDirection;
  gap?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  align?: StackAlign;
  justify?: StackJustify;
  wrap?: boolean;
  children?: React.ReactNode;
}

export function Stack({
  direction = 'column',
  gap = 0,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  style,
  children,
  ...rest
}: StackProps) {
  const theme = useTheme();

  const getGapValue = () => {
    if (typeof gap === 'number') return gap;
    return theme.spacing[gap];
  };

  const getAlignItems = () => {
    switch (align) {
      case 'start':
        return direction?.includes('row') ? 'flex-start' : 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return direction?.includes('row') ? 'flex-end' : 'flex-end';
      case 'stretch':
        return direction?.includes('row') ? 'stretch' : 'stretch';
      default:
        return 'stretch';
    }
  };

  const getJustifyContent = () => {
    switch (justify) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      case 'around':
        return 'space-around';
      case 'evenly':
        return 'space-evenly';
      default:
        return 'flex-start';
    }
  };

  const flexDirection = direction || 'column';
  const gapValue = getGapValue();

  return (
    <View
      style={[
        {
          flexDirection,
          gap: gapValue,
          alignItems: getAlignItems(),
          justifyContent: getJustifyContent(),
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

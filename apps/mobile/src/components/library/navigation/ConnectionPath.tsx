import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConnectionPathProps {
  memories: Array<unknown>;
  currentIndex: number;
  onDotPress: (index: number) => void;
}

export const ConnectionPath: React.FC<ConnectionPathProps> = ({
  memories,
  currentIndex,
  onDotPress,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useTheme is properly typed to return AppTheme, throws if Provider missing
  const theme: AppTheme = useTheme();
  
  const styles = React.useMemo(() => StyleSheet.create({
    connectionPath: {
      flex: 1,
      position: 'relative',
    },
    pathSegment: {
      position: 'absolute',
      height: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    pathDot: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.colors.bg,
    },
  }), [theme.colors.bg]);
  
  const pathPoints = memories.map((_, index) => {
    const x = (index / (memories.length - 1)) * (screenWidth - 80) + 40;
    const y = screenHeight * 0.85;
    return { x, y };
  });

  return (
    <View style={styles.connectionPath}>
      {pathPoints.map((point, index) => {
        if (index === pathPoints.length - 1) return null;

        const nextPoint = pathPoints[index + 1];
        if (!nextPoint) return null;

        const distance = Math.sqrt(
          Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2),
        );
        const angle = (Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * 180) / Math.PI;

        return (
          <View
            key={index}
            style={StyleSheet.flatten([
              styles.pathSegment,
              {
                left: point.x,
                top: point.y,
                width: distance,
                transform: [{ rotate: `${angle}deg` }],
                opacity: index <= currentIndex ? 1 : 0.3,
              },
            ])}
          />
        );
      })}

      {pathPoints.map((point, index) => (
        <TouchableOpacity
          key={`dot-${index}`}
          style={StyleSheet.flatten([
            styles.pathDot,
            {
              left: point.x - 6,
              top: point.y - 6,
              backgroundColor: index === currentIndex ? theme.colors.primary : theme.colors.bg,
              transform: [{ scale: index === currentIndex ? 1.2 : 1 }],
            },
          ])}
          onPress={() => {
            onDotPress(index);
          }}
        />
      ))}
    </View>
  );
};

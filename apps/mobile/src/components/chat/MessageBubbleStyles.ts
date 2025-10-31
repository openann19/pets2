/**
 * MessageBubbleStyles
 * Shared styles for MessageBubble component
 */

import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/theme';

export const createMessageBubbleStyles = (theme: AppTheme) =>
  StyleSheet.create({
    messageContainer: {
      marginVertical: theme.spacing.xs,
      maxWidth: '80%',
      position: 'relative',
    },
    ownContainer: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    otherContainer: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
  });


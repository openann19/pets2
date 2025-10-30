import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';

interface PetFormSubmitProps {
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const PetFormSubmit: React.FC<PetFormSubmitProps> = ({ isSubmitting, onSubmit }) => {
  const theme = useTheme();

  const makeStyles = (theme: any) =>
    StyleSheet.create({
      submitContainer: {
        alignItems: 'center',
        marginBottom: 40,
      },
      submitButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: theme.palette.neutral[950],
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      },
      submitButtonDisabled: {
        backgroundColor: theme.colors.onMuted,
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
      },
      submitContent: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      submitButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.onPrimary,
        marginLeft: 8,
      },
    });

  const styles = makeStyles(theme);

  return (
    <View style={styles.submitContainer}>
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ])}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.submitContent}>
            <Ionicons
              name="sync"
              size={20}
              color={theme.colors.onPrimary}
              style={{ transform: [{ rotate: '45deg' }] }}
            />
            <Text style={styles.submitButtonText}>Creating Profile...</Text>
          </View>
        ) : (
          <View style={styles.submitContent}>
            <Ionicons
              name="add-circle"
              size={20}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.submitButtonText}>Create Pet Profile</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

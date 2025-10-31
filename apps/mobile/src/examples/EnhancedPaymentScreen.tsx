/**
 * Enhanced Accessibility & Payment Localization Example
 *
 * This file demonstrates how to use the enhanced accessibility labels
 * and payment error localization in a real screen component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/theme';
import { useAccessibility } from '@/hooks/useAccessibility';
import { paymentErrorService } from '@/services/PaymentErrorLocalizationService';

interface PaymentFormProps {
  onSubmit: (cardDetails: CardDetails) => void;
  isLoading?: boolean;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export const EnhancedPaymentScreen: React.FC<PaymentFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const theme = useTheme();
  const accessibility = useAccessibility();

  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CardDetails, string>>>({});

  // Get localized form labels
  const formLabels = accessibility.getFormLabels();
  const paymentLabels = paymentErrorService.getPaymentFormLabels();
  const screenLabels = accessibility.getScreenLabels().premium;

  // Get accessibility labels for payment screen
  const paymentAccessibilityLabels = accessibility.getScreenLabels().premium;

  const handleInputChange = (field: keyof CardDetails, value: string) => {
    setCardDetails((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CardDetails, string>> = {};

    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!cardDetails.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date (MM/YY)';
    }

    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      // Show validation error using accessibility service
      const feedbackLabels = accessibility.getFeedbackLabels();
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    // Simulate payment processing with potential errors
    const simulatePaymentError = () => {
      const errorTypes = ['payment_declined', 'insufficient_funds', 'card_expired', 'invalid_cvv'];
      const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

      // 80% success rate
      if (Math.random() > 0.8) {
        paymentErrorService.showErrorAlert(randomError, handleSubmit);
      } else {
        // Show success
        paymentErrorService.showSuccessAlert('success_message');
        onSubmit(cardDetails);
      }
    };

    simulatePaymentError();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    form: {
      gap: theme.spacing.md,
    },
    inputGroup: {
      gap: theme.spacing.xs,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.onSurface,
      backgroundColor: theme.colors.surface,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.danger,
      marginTop: theme.spacing.xs,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      minHeight: 48, // WCAG minimum touch target
    },
    submitButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    submitButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    loadingText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView
      style={styles.container}
      accessible={true}
      accessibilityLabel="Payment form screen"
      accessibilityHint="Enter your payment details to complete the purchase"
    >
      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
        accessibilityLabel="Payment Information"
      >
        Payment Information
      </Text>

      <View style={styles.form}>
        {/* Card Number */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{paymentLabels.cardNumber.label}</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            value={cardDetails.cardNumber}
            onChangeText={(value) => handleInputChange('cardNumber', value)}
            placeholder={paymentLabels.cardNumber.hint}
            keyboardType="numeric"
            maxLength={19} // 16 digits + 3 spaces
            accessible={true}
            accessibilityLabel={formLabels.card.label}
            accessibilityHint={formLabels.card.hint}
            accessibilityRole="textbox"
            textContentType="creditCardNumber"
          />
          {errors.cardNumber && (
            <Text
              style={styles.errorText}
              accessible={true}
            >
              {errors.cardNumber}
            </Text>
          )}
        </View>

        {/* Expiry Date and CVV */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>{paymentLabels.expiryDate.label}</Text>
            <TextInput
              style={[styles.input, errors.expiryDate && styles.inputError]}
              value={cardDetails.expiryDate}
              onChangeText={(value) => handleInputChange('expiryDate', value)}
              placeholder={paymentLabels.expiryDate.hint}
              keyboardType="numeric"
              maxLength={5}
              accessible={true}
              accessibilityLabel={formLabels.expiry.label}
              accessibilityHint={formLabels.expiry.hint}
              accessibilityRole="textbox"
              textContentType="creditCardExpiration"
            />
            {errors.expiryDate && (
              <Text
                style={styles.errorText}
                accessible={true}
              >
                {errors.expiryDate}
              </Text>
            )}
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>{paymentLabels.cvv.label}</Text>
            <TextInput
              style={[styles.input, errors.cvv && styles.inputError]}
              value={cardDetails.cvv}
              onChangeText={(value) => handleInputChange('cvv', value)}
              placeholder={paymentLabels.cvv.hint}
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry={true}
              accessible={true}
              accessibilityLabel={formLabels.cvv.label}
              accessibilityHint={formLabels.cvv.hint}
              accessibilityRole="textbox"
              textContentType="creditCardSecurityCode"
            />
            {errors.cvv && (
              <Text
                style={styles.errorText}
                accessible={true}
              >
                {errors.cvv}
              </Text>
            )}
          </View>
        </View>

        {/* Cardholder Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{paymentLabels.cardholderName.label}</Text>
          <TextInput
            style={[styles.input, errors.cardholderName && styles.inputError]}
            value={cardDetails.cardholderName}
            onChangeText={(value) => handleInputChange('cardholderName', value)}
            placeholder={paymentLabels.cardholderName.hint}
            autoCapitalize="words"
            accessible={true}
            accessibilityLabel={formLabels.cardholderName.label}
            accessibilityHint={formLabels.cardholderName.hint}
            accessibilityRole="textbox"
            textContentType="creditCardName"
          />
          {errors.cardholderName && (
            <Text
              style={styles.errorText}
              accessible={true}
            >
              {errors.cardholderName}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel={paymentAccessibilityLabels.subscribeButton?.label}
          accessibilityHint={paymentAccessibilityLabels.subscribeButton?.hint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isLoading }}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.colors.primaryText}
              />
              <Text style={styles.loadingText}>{paymentLabels.processing}</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>{paymentLabels.payButton}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EnhancedPaymentScreen;

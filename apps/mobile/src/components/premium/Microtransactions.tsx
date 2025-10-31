/**
 * Microtransactions Component
 * Displays IAP products (Super Likes, Boosts, etc.) with purchase buttons
 */
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useIAPBalance } from '../../hooks/domains/premium/useIAPBalance';
import { IAPProductsService, type IAPProduct } from '../../../services/IAPProductsService';
import { SuccessMorphButton } from '../micro/SuccessMorph';

interface MicrotransactionsProps {
  onPurchaseSuccess?: () => void;
}

export function Microtransactions({ onPurchaseSuccess }: MicrotransactionsProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');
  const { balance, isLoading: balanceLoading, purchaseProduct, error: balanceError } = useIAPBalance();
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const products = useMemo(() => IAPProductsService.getAvailableProducts(), []);

  // Group products by type for better organization
  const productsByType = useMemo(() => {
    const grouped: Record<string, IAPProduct[]> = {};
    products.forEach((product) => {
      if (!grouped[product.type]) {
        grouped[product.type] = [];
      }
      grouped[product.type].push(product);
    });
    return grouped;
  }, [products]);

  const getProductIcon = (type: IAPProduct['type']): string => {
    switch (type) {
      case 'superlike':
        return 'star';
      case 'boost':
        return 'rocket';
      case 'filter':
        return 'filter';
      case 'photo':
        return 'image';
      case 'video':
        return 'videocam';
      case 'gift':
        return 'gift';
      default:
        return 'pricetag';
    }
  };

  const getBalanceForType = (type: IAPProduct['type']): number => {
    switch (type) {
      case 'superlike':
        return balance.superLikes;
      case 'boost':
        return balance.boosts;
      case 'gift':
        return balance.gifts;
      default:
        return 0;
    }
  };

  const handlePurchase = async (product: IAPProduct): Promise<void> => {
    try {
      setPurchasingProductId(product.id);
      setSuccessMessage(null);

      const result = await purchaseProduct(product.id);

      if (result.success) {
        setSuccessMessage(result.message || `${product.name} purchased successfully!`);
        
        // Show success alert
        Alert.alert(
          t('purchase_success', 'Purchase Successful'),
          result.message || `${product.name} purchased successfully!`,
          [{ text: t('ok', 'OK'), onPress: () => setSuccessMessage(null) }],
        );

        // Call success callback
        onPurchaseSuccess?.();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        Alert.alert(
          t('purchase_failed', 'Purchase Failed'),
          result.message || 'Failed to complete purchase. Please try again.',
          [{ text: t('ok', 'OK') }],
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      Alert.alert(
        t('purchase_failed', 'Purchase Failed'),
        errorMessage,
        [{ text: t('ok', 'OK') }],
      );
    } finally {
      setPurchasingProductId(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.md,
    },
    sectionDescription: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onPrimary,
      opacity: 0.9,
      marginBottom: theme.spacing.lg,
    },
    balanceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    balanceItem: {
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    balanceLabel: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
    },
    balanceValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    productGroup: {
      marginBottom: theme.spacing.xl,
    },
    groupTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.md,
      textTransform: 'capitalize',
    },
    productsGrid: {
      gap: theme.spacing.md,
    },
    productCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    productHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    productIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs / 2,
    },
    productDescription: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
    },
    productDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    productQuantity: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    productPrice: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.primary,
    },
    purchaseButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginTop: theme.spacing.sm,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    purchaseButtonDisabled: {
      backgroundColor: theme.colors.border,
      opacity: 0.5,
    },
    purchaseButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onPrimary,
    },
    errorText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.danger,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    successText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.success,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    loadingContainer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyStateText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
  });

  if (balanceLoading && products.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="pricetag-outline" size={48} color={theme.colors.onMuted} />
        <Text style={styles.emptyStateText}>
          {t('no_products_available', 'No products available at this time')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('microtransactions', 'Microtransactions')}</Text>
      <Text style={styles.sectionDescription}>
        {t('microtransactions_description', 'Purchase individual features without a subscription')}
      </Text>

      {/* Balance Display */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>{t('super_likes', 'Super Likes')}</Text>
          <Text style={styles.balanceValue}>{balance.superLikes}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>{t('boosts', 'Boosts')}</Text>
          <Text style={styles.balanceValue}>{balance.boosts}</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>{t('gifts', 'Gifts')}</Text>
          <Text style={styles.balanceValue}>{balance.gifts}</Text>
        </View>
      </View>

      {balanceError && <Text style={styles.errorText}>{balanceError}</Text>}
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

      {/* Products by Type */}
      {Object.entries(productsByType).map(([type, typeProducts]) => (
        <View key={type} style={styles.productGroup}>
          <Text style={styles.groupTitle}>
            {type === 'superlike' ? t('super_likes', 'Super Likes') :
             type === 'boost' ? t('boosts', 'Boosts') :
             type === 'gift' ? t('gifts', 'Gifts') :
             type === 'filter' ? t('filters', 'Filters') :
             type === 'photo' ? t('photos', 'Photos') :
             type === 'video' ? t('videos', 'Videos') :
             type}
          </Text>
          <View style={styles.productsGrid}>
            {typeProducts.map((product) => {
              const isPurchasing = purchasingProductId === product.id;
              const currentBalance = getBalanceForType(product.type);
              const iconName = getProductIcon(product.type);

              return (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <View style={styles.productIcon}>
                      <Ionicons name={iconName as any} size={20} color={theme.colors.primary} />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productDescription}>{product.description}</Text>
                    </View>
                  </View>

                  <View style={styles.productDetails}>
                    {product.quantity && (
                      <Text style={styles.productQuantity}>
                        {t('quantity', 'Quantity')}: {product.quantity}
                      </Text>
                    )}
                    {product.duration && (
                      <Text style={styles.productQuantity}>
                        {t('duration', 'Duration')}: {product.duration} {t('minutes', 'min')}
                      </Text>
                    )}
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  </View>

                  {currentBalance > 0 && (
                    <Text style={styles.productQuantity}>
                      {t('current_balance', 'Current balance')}: {currentBalance}
                    </Text>
                  )}

                  <SuccessMorphButton
                    onPress={() => handlePurchase(product)}
                    disabled={isPurchasing || balanceLoading}
                    style={[
                      styles.purchaseButton,
                      (isPurchasing || balanceLoading) && styles.purchaseButtonDisabled,
                    ]}
                    textStyle={styles.purchaseButtonText}
                  >
                    {isPurchasing ? (
                      <ActivityIndicator color={theme.colors.onPrimary} size="small" />
                    ) : (
                      <Text style={styles.purchaseButtonText}>
                        {t('purchase', 'Purchase')}
                      </Text>
                    )}
                  </SuccessMorphButton>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}


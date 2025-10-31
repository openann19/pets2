/**
 * IAP Shop Screen
 * Browse and purchase in-app purchase products
 * Products: Super Likes, Boosts, Filters, Photos, Videos, Gifts
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { iapProductsService } from '../services/IAPProductsService';
import type { IAPProduct, IAPBalance } from '../services/IAPProductsService';
import type { RootStackScreenProps } from '../navigation/types';

type IAPShopScreenProps = RootStackScreenProps<'IAPShop'>;

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing['4xl'],
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing['4xl'],
      left: theme.spacing.lg,
      zIndex: 10,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    content: {
      padding: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    balanceSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.elevation2,
    },
    balanceTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    balanceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    balanceItem: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      alignItems: 'center',
    },
    balanceLabel: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
    },
    balanceValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.primary,
    },
    categorySection: {
      gap: theme.spacing.md,
    },
    categoryTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    productCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    productIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    productDescription: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs,
    },
    productPrice: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.primary,
    },
    productBadge: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.radii.sm,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    purchaseButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minWidth: 80,
      alignItems: 'center',
    },
    purchaseButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onPrimary,
    },
    purchaseButtonDisabled: {
      opacity: 0.5,
    },
    loading: {
      padding: theme.spacing['4xl'],
      alignItems: 'center',
    },
  });
}

const PRODUCT_ICONS: Record<IAPProduct['type'], string> = {
  superlike: 'star',
  boost: 'rocket',
  filter: 'options',
  photo: 'camera',
  video: 'videocam',
  gift: 'gift',
};

export default function IAPShopScreen({ navigation }: IAPShopScreenProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { t } = useTranslation('common');

  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [balance, setBalance] = useState<IAPBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Load products and balance
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, balanceData] = await Promise.all([
        Promise.resolve(iapProductsService.getAvailableProducts()),
        iapProductsService.getBalance(),
      ]);
      setProducts(productsData);
      setBalance(balanceData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert(t('settings.error'), `${t('iap.alerts.loadError')}: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Purchase product
  const handlePurchase = useCallback(
    async (product: IAPProduct) => {
      setPurchasing(product.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        const result = await iapProductsService.purchaseProduct(product.id);
        if (result.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            t('iap.alerts.purchaseSuccess'),
            t('iap.alerts.purchaseSuccessMessage', { product: product.name }),
          );
          // Reload balance
          const newBalance = await iapProductsService.getBalance();
          setBalance(newBalance);
        } else {
          throw new Error(result.message || t('iap.alerts.purchaseFailed'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(t('iap.alerts.purchaseFailed'), errorMessage);
      } finally {
        setPurchasing(null);
      }
    },
    [t],
  );

  // Group products by type
  const productsByType = useMemo(() => {
    const grouped: Record<IAPProduct['type'], IAPProduct[]> = {
      superlike: [],
      boost: [],
      filter: [],
      photo: [],
      video: [],
      gift: [],
    };

    products.forEach((product) => {
      grouped[product.type].push(product);
    });

    return grouped;
  }, [products]);

  const gradientColors = theme.palette.gradients.primary;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            testID="iap-shop-back-button"
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onPrimary}
            />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.onPrimary }]}>
            {t('iap.shop', 'Shop')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onPrimary, opacity: 0.9 }]}>
            {t('iap.subtitle', 'Enhance your experience')}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
          </View>
        ) : (
          <>
            {/* Balance Section */}
            {balance && (
              <View style={styles.balanceSection}>
                <Text style={styles.balanceTitle}>
                  {t('iap.yourBalance', 'Your Balance')}
                </Text>
                <View style={styles.balanceGrid}>
                  {balance.superLikes > 0 && (
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>
                        {t('iap.superLikes', 'Super Likes')}
                      </Text>
                      <Text style={styles.balanceValue}>{balance.superLikes}</Text>
                    </View>
                  )}
                  {balance.boosts > 0 && (
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>{t('iap.boosts', 'Boosts')}</Text>
                      <Text style={styles.balanceValue}>{balance.boosts}</Text>
                    </View>
                  )}
                  {balance.gifts > 0 && (
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceLabel}>{t('iap.gifts', 'Gifts')}</Text>
                      <Text style={styles.balanceValue}>{balance.gifts}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Products by Category */}
            {(['superlike', 'boost', 'filter', 'photo', 'video', 'gift'] as const).map(
              (type) => {
                const categoryProducts = productsByType[type];
                if (categoryProducts.length === 0) return null;

                return (
                  <View
                    key={type}
                    style={styles.categorySection}
                  >
                    <Text style={styles.categoryTitle}>
                      {t(`iap.category.${type}`, type.charAt(0).toUpperCase() + type.slice(1))}
                    </Text>
                    {categoryProducts.map((product) => {
                      const isPurchasing = purchasing === product.id;
                      const isBestValue = product.id.includes('pack') || product.id.includes('10');

                      return (
                        <View
                          key={product.id}
                          style={styles.productCard}
                        >
                          {isBestValue && (
                            <View style={styles.productBadge}>
                              <Text style={styles.badgeText}>
                                {t('iap.bestValue', 'BEST VALUE')}
                              </Text>
                            </View>
                          )}
                          <View style={styles.productIcon}>
                            <Ionicons
                              name={PRODUCT_ICONS[product.type] as any}
                              size={28}
                              color={theme.colors.primary}
                            />
                          </View>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productDescription}>{product.description}</Text>
                            <Text style={styles.productPrice}>
                              ${product.price.toFixed(2)}
                              {product.quantity && ` (${product.quantity}x)`}
                              {product.duration && ` (${product.duration}min)`}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.purchaseButton,
                              (isPurchasing || purchasing !== null) && styles.purchaseButtonDisabled,
                            ]}
                            onPress={() => handlePurchase(product)}
                            disabled={isPurchasing || purchasing !== null}
                            accessibilityLabel={`Purchase ${product.name}`}
                            accessibilityRole="button"
                          >
                            {isPurchasing ? (
                              <ActivityIndicator
                                color={theme.colors.onPrimary}
                                size="small"
                              />
                            ) : (
                              <Text style={styles.purchaseButtonText}>
                                {t('iap.buy', 'Buy')}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                );
              },
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}


import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-native';
import { Text } from '../ui/v2/Text';
import { Button } from '../ui/v2/Button';

interface LocationShareButtonProps {
  visible: boolean;
  onClose: () => void;
  onShare: (location: { latitude: number; longitude: number; address?: string }) => void;
  matchId: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export const LocationShareButton: React.FC<LocationShareButtonProps> = ({
  visible,
  onClose,
  onShare,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    } else {
      setLocation(null);
      setError(null);
    }
  }, [visible]);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } else {
      try {
        const permission = PermissionsAndroid.PERMISSIONS['ACCESS_FINE_LOCATION'];
        if (!permission) return false;
        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to share it with your match.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        const result = PermissionsAndroid.RESULTS['GRANTED'];
        return granted === result;
      } catch (err) {
        return false;
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setError(t('location_permission_denied') || 'Location permission denied');
        return;
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Try to get address
      let address: string | undefined;
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        });

        if (geocode.length > 0) {
          const addr = geocode[0];
          if (addr) {
            address = [addr.street, addr.city, addr.region, addr.country]
              .filter(Boolean)
              .join(', ');
          }
        }
      } catch (addrError) {
        // Address lookup failed, continue without address
        console.log('Address lookup failed:', addrError);
      }

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      if (address) {
        locationData.address = address;
      }
      setLocation(locationData);
    } catch (err) {
      console.error('Location error:', err);
      setError(t('location_error') || 'Unable to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (location) {
      onShare(location);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text
              variant="h4"
              tone="text"
              style={{ color: theme.colors.onSurface }}
            >
              {t('share_location') || 'Share Location'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={[styles.content, { padding: theme.spacing.xl }]}>
            {loading && (
              <View style={styles.loadingContainer}>
                <Ionicons name="location-outline" size={48} color={theme.colors.primary} />
                <Text
                  variant="body"
                  tone="text"
                  style={{ marginTop: theme.spacing.lg }}
                >
                  {t('getting_location') || 'Getting your location...'}
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="location-outline" size={48} color={theme.colors.danger} />
                <Text
                  variant="body"
                  tone="danger"
                  style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.xl }}
                >
                  {error}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.retryButton,
                    { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderRadius: theme.radii.md }
                  ]}
                  onPress={getCurrentLocation}
                >
                  <Text
                    variant="button"
                    tone="primary"
                    style={{ color: theme.colors.onPrimary }}
                  >
                    {t('try_again') || 'Try Again'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {location && !loading && !error && (
              <View style={styles.locationContainer}>
                <View style={[styles.mapPreview, { backgroundColor: theme.colors.surface, width: 200, height: 150, borderRadius: theme.radii.lg }]}>
                  <Ionicons name="map-outline" size={64} color={theme.colors.primary} />
                  <View style={styles.locationPin}>
                    <Ionicons name="location" size={24} color={theme.colors.primary} />
                  </View>
                </View>

                <View style={styles.locationDetails}>
                  <Text
                    variant="h5"
                    tone="text"
                    style={{ marginBottom: theme.spacing.sm }}
                  >
                    {t('current_location') || 'Current Location'}
                  </Text>

                  {location.address && (
                    <Text
                      variant="body"
                      tone="textMuted"
                      style={{ marginBottom: theme.spacing.xs }}
                    >
                      {location.address}
                    </Text>
                  )}

                  <Text
                    variant="caption"
                    tone="textMuted"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                </View>

                <View style={[styles.warningContainer, { backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: theme.spacing.sm, borderRadius: theme.radii.sm, marginTop: theme.spacing.lg }]}>
                  <Ionicons name="information-circle-outline" size={20} color={theme.colors.warning} />
                  <Text
                    variant="body"
                    tone="textMuted"
                    style={{ marginLeft: theme.spacing.sm, lineHeight: theme.spacing.lg }}
                  >
                    {t('location_privacy_warning') ||
                     'This location will be shared with your match for meetup planning.'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          {location && (
            <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={onClose}
              >
                <Text
                  variant="button"
                  tone="text"
                >
                  {t('cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>

              <Button
                title={t('share_location') || 'Share Location'}
                onPress={handleShare}
                variant="primary"
                size="md"
                leftIcon={<Ionicons name="send" size={20} color={theme.colors.onPrimary} />}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  retryButton: {
    marginTop: 16,
  },
  locationContainer: {
    alignItems: 'center',
  },
  mapPreview: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  locationPin: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  locationDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  shareText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

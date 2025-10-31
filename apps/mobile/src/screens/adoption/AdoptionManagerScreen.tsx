/**
 * Adoption Manager Screen
 * Refactored: Uses extracted components
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import {
  EliteButton,
  EliteCard,
  EliteContainer,
  EliteEmptyState,
  EliteHeader,
  EliteLoading,
  EliteScrollContainer,
} from '../../components';
import { useAdoptionManagerScreen } from '../../hooks/screens/useAdoptionManagerScreen';
import type { RootStackScreenProps } from '../../navigation/types';
import {
  EliteApplicationCard,
  ElitePetListingCard,
  StatusModal,
} from './manager/components';

type AdoptionManagerScreenProps = RootStackScreenProps<'AdoptionManager'>;

const AdoptionManagerScreen = ({ navigation }: AdoptionManagerScreenProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  const {
    activeTab,
    refreshing,
    showStatusModal,
    selectedPet,
    isLoading,
    petListings,
    applications,
    setActiveTab,
    setShowStatusModal,
    setSelectedPet,
    onRefresh,
    handleTabPress,
    handleStatusChange,
    handleApplicationAction,
    getStatusColor,
    getStatusIcon,
    tabAnimatedStyle1,
    tabAnimatedStyle2,
    tabScale1,
    tabScale2,
  } = useAdoptionManagerScreen();

  if (isLoading) {
    return (
      <EliteContainer>
        <EliteLoading size="large" />
      </EliteContainer>
    );
  }

  return (
    <EliteContainer gradient="gradientPrimary">
      {/* Elite Header */}
      <EliteHeader
        title="Adoption Manager"
        rightComponent={
          <EliteButton
            title="Add Pet"
            icon="add"
            size="sm"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('CreateListing');
            }}
          />
        }
      />

      {/* Elite Tab System */}
      <View style={styles.tabContainer}>
        <Animated.View style={tabAnimatedStyle1}>
          <TouchableOpacity
            style={[
              styles.eliteTab,
              activeTab === 'listings' && styles.eliteActiveTab,
            ]}
            onPress={() => handleTabPress('listings', tabScale1)}
            testID="tab-listings"
            accessibilityLabel="My Listings tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'listings' }}
          >
            <Ionicons
              name="list"
              size={20}
              color={activeTab === 'listings' ? colors.onSurface : colors.onMuted}
            />
            <Text
              style={[
                styles.eliteTabText,
                activeTab === 'listings' && styles.eliteActiveTabText,
              ]}
            >
              My Listings ({petListings.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={tabAnimatedStyle2}>
          <TouchableOpacity
            style={[
              styles.eliteTab,
              activeTab === 'applications' && styles.eliteActiveTab,
            ]}
            onPress={() => handleTabPress('applications', tabScale2)}
            testID="tab-applications"
            accessibilityLabel="Applications tab"
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === 'applications' }}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={activeTab === 'applications' ? colors.onSurface : colors.onMuted}
            />
            <Text
              style={[
                styles.eliteTabText,
                activeTab === 'applications' && styles.eliteActiveTabText,
              ]}
            >
              Applications ({applications.length})
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Elite Content */}
      <EliteScrollContainer
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {petListings.length === 0 && activeTab === 'listings' ? (
          <EliteEmptyState
            icon="paw"
            title="No pets listed yet"
            message="Start by adding your first pet for adoption. It's easy and helps pets find loving homes!"
          />
        ) : applications.length === 0 && activeTab === 'applications' ? (
          <EliteEmptyState
            icon="document-text"
            title="No applications yet"
            message="Once people start applying for your pets, you'll see all applications here."
          />
        ) : activeTab === 'listings' ? (
          <View style={styles.listingsContainer}>
            {petListings.map((pet) => (
              <ElitePetListingCard
                key={pet.id}
                pet={pet}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                onViewDetails={(petId) => navigation.navigate('PetDetails', { petId })}
                onReviewApps={(petId) =>
                  navigation.navigate('ApplicationReview', {
                    applicationId: petId,
                  })
                }
                onChangeStatus={(pet) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedPet(pet);
                  setShowStatusModal(true);
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.applicationsContainer}>
            {applications.map((app) => (
              <EliteApplicationCard
                key={app.id}
                application={app}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                onApprove={(id) => handleApplicationAction(id, 'approve')}
                onReject={(id) => handleApplicationAction(id, 'reject')}
              />
            ))}
          </View>
        )}
      </EliteScrollContainer>

      {/* Elite Status Modal */}
      <StatusModal
        visible={showStatusModal}
        selectedPet={selectedPet}
        getStatusIcon={getStatusIcon}
        onStatusChange={(pet, status) => {
          handleStatusChange(pet, status);
          setShowStatusModal(false);
        }}
        onClose={() => setShowStatusModal(false)}
      />
    </EliteContainer>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    eliteTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    eliteActiveTab: {
      backgroundColor: theme.colors.surface + '40',
    },
    eliteTabText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onMuted,
    },
    eliteActiveTabText: {
      color: theme.colors.onSurface,
    },
    listingsContainer: {
      padding: 16,
    },
    applicationsContainer: {
      padding: 16,
    },
  });
}

export default AdoptionManagerScreen;

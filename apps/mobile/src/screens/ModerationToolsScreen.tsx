import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ModerationToolsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface ModerationTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
  badge?: string;
}

function ModerationToolsScreen({ navigation }: ModerationToolsScreenProps): JSX.Element {
  const [pendingReports, setPendingReports] = useState(12);
  const [refreshing, setRefreshing] = useState(false);

  const moderationTools: ModerationTool[] = [
    {
      id: 'reports',
      title: 'User Reports',
      description: 'Review and moderate reported content',
      icon: 'flag-outline',
      color: '#EF4444',
      badge: pendingReports.toString(),
      action: () => { Alert.alert('User Reports', 'Reports moderation coming soon!'); },
    },
    {
      id: 'content',
      title: 'Content Moderation',
      description: 'Review photos and profiles for violations',
      icon: 'images-outline',
      color: '#F59E0B',
      action: () => { Alert.alert('Content Moderation', 'Content moderation coming soon!'); },
    },
    {
      id: 'messages',
      title: 'Message Monitoring',
      description: 'Monitor chat messages for inappropriate content',
      icon: 'chatbubble-ellipses-outline',
      color: '#8B5CF6',
      action: () => { navigation.goBack(); }, // Navigate back to admin chats
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts and permissions',
      icon: 'people-outline',
      color: '#10B981',
      action: () => { Alert.alert('User Management', 'User management coming soon!'); },
    },
    {
      id: 'analytics',
      title: 'Moderation Analytics',
      description: 'View moderation statistics and reports',
      icon: 'bar-chart-outline',
      color: '#06B6D4',
      action: () => { Alert.alert('Analytics', 'Moderation analytics coming soon!'); },
    },
    {
      id: 'settings',
      title: 'Moderation Settings',
      description: 'Configure moderation rules and thresholds',
      icon: 'settings-outline',
      color: '#EC4899',
      action: () => { Alert.alert('Settings', 'Moderation settings coming soon!'); },
    },
  ];

  const handleToolPress = useCallback((tool: ModerationTool) => {
    Haptics.selectionAsync().catch(() => { });
    tool.action();
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPendingReports(Math.floor(Math.random() * 20) + 5);
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#1e3c72']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moderation Tools</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats Bar */}
        <BlurView intensity={15} style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingReports}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Active Moderators</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98.5%</Text>
            <Text style={styles.statLabel}>Resolution Rate</Text>
          </View>
        </BlurView>

        {/* Content */}
        <FlatList
          data={moderationTools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="white"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => { handleToolPress(item); }}
            >
              <BlurView intensity={20} style={styles.toolBlur}>
                <View style={styles.toolContent}>
                  <View style={[styles.toolIcon, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="white" />
                  </View>
                  <View style={styles.toolText}>
                    <View style={styles.toolHeader}>
                      <Text style={styles.toolTitle}>{item.title}</Text>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.toolDescription}>{item.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
                </View>
              </BlurView>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <BlurView intensity={10} style={styles.infoCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#10B981" />
              <Text style={styles.infoText}>
                Use these tools to maintain a safe and positive community for all pet lovers.
              </Text>
            </BlurView>
          }
        />

        {/* Quick Actions */}
        <BlurView intensity={15} style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => { Alert.alert('Emergency', 'Emergency moderation mode coming soon!'); }}
          >
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text style={styles.quickActionText}>Emergency Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => { Alert.alert('Guidelines', 'Community guidelines coming soon!'); }}
          >
            <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
            <Text style={styles.quickActionText}>Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => { Alert.alert('Training', 'Moderator training coming soon!'); }}
          >
            <Ionicons name="school-outline" size={20} color="#10B981" />
            <Text style={styles.quickActionText}>Training</Text>
          </TouchableOpacity>
        </BlurView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  statsBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  toolCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  toolBlur: {
    padding: 16,
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolText: {
    flex: 1,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toolDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  quickActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingBottom: 32,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ModerationToolsScreen;

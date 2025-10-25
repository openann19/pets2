/**
 * Community Screen
 * Main screen for community feed with pack groups and AI suggestions
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "react-native-heroicons/outline";
import { CommunityFeed } from "../components/community/CommunityFeed";
import { communityAPI } from "../services/communityAPI";
import { useAuthStore } from "../../stores/authStore";
import { logger } from "@pawfectmatch/core";

interface PackGroup {
  _id: string;
  name: string;
  description: string;
  memberCount: number;
  isMember: boolean;
  avatar?: string;
}

interface AISuggestion {
  id: string;
  type: "post" | "activity" | "tip";
  title: string;
  description: string;
  actionText: string;
  icon: string;
}

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"feed" | "packs" | "suggestions">(
    "feed",
  );
  const [packGroups, setPackGroups] = useState<PackGroup[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([]);
  const [showCreatePackModal, setShowCreatePackModal] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [newPackDescription, setNewPackDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadPackGroups();
    void loadAISuggestions();
  }, []);

  const loadPackGroups = async () => {
    try {
      const response = await communityAPI.getPackGroups();
      setPackGroups(response.packs);
    } catch (error) {
      logger.error("Failed to load pack groups", { error });
    }
  };

  const loadAISuggestions = () => {
    // Mock AI suggestions for now
    const suggestions: AISuggestion[] = [
      {
        id: "1",
        type: "post",
        title: "Share Your Pet's Day",
        description:
          "Tell the community about your pet's favorite activities today",
        actionText: "Create Post",
        icon: "📝",
      },
      {
        id: "2",
        type: "activity",
        title: "Organize a Meetup",
        description: "Plan a fun activity for pets in your area",
        actionText: "Create Activity",
        icon: "🎉",
      },
      {
        id: "3",
        type: "tip",
        title: "Pet Care Tip",
        description: "Share helpful advice about pet health and wellness",
        actionText: "Share Tip",
        icon: "💡",
      },
    ];
    setAISuggestions(suggestions);
  };

  const handleJoinPack = async (packId: string) => {
    try {
      await communityAPI.joinPack(packId);
      void loadPackGroups(); // Reload to update membership status
      Alert.alert("Success", "Joined pack successfully!");
    } catch (error) {
      logger.error("Failed to join pack", { error });
      Alert.alert("Error", "Failed to join pack");
    }
  };

  const handleLeavePack = async (packId: string) => {
    try {
      await communityAPI.leavePack(packId);
      void loadPackGroups(); // Reload to update membership status
      Alert.alert("Success", "Left pack successfully!");
    } catch (error) {
      logger.error("Failed to leave pack", { error });
      Alert.alert("Error", "Failed to leave pack");
    }
  };

  const handleCreatePack = () => {
    if (!newPackName.trim()) {
      Alert.alert("Error", "Please enter a pack name");
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement create pack API call
      Alert.alert("Success", "Pack created successfully!");
      setShowCreatePackModal(false);
      setNewPackName("");
      setNewPackDescription("");
      void loadPackGroups();
    } catch (error) {
      logger.error("Failed to create pack", { error });
      Alert.alert("Error", "Failed to create pack");
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggestionPress = (suggestion: AISuggestion) => {
    switch (suggestion.type) {
      case "post":
        // Navigate to post creation with pre-filled content
        Alert.alert(
          "AI Suggestion",
          `Creating a post about: ${suggestion.title}`,
        );
        break;
      case "activity":
        // Navigate to activity creation
        Alert.alert(
          "AI Suggestion",
          `Creating an activity: ${suggestion.title}`,
        );
        break;
      case "tip":
        // Navigate to tip sharing
        Alert.alert("AI Suggestion", `Sharing a tip: ${suggestion.title}`);
        break;
    }
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "feed" && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab("feed")}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === "feed" ? colors.primary : colors.text },
          ]}
        >
          Feed
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "packs" && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab("packs")}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === "packs" ? colors.primary : colors.text },
          ]}
        >
          Packs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "suggestions" && { borderBottomColor: colors.primary },
        ]}
        onPress={() => setActiveTab("suggestions")}
      >
        <SparklesIcon
          size={20}
          color={activeTab === "suggestions" ? colors.primary : colors.text}
        />
        <Text
          style={[
            styles.tabText,
            {
              color: activeTab === "suggestions" ? colors.primary : colors.text,
            },
            { marginLeft: 4 },
          ]}
        >
          AI
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderFeedTab = () => (
    <CommunityFeed
      userId={user.id}
      onCreatePost={(post: any) => {
        logger.info("Post created", { postId: post._id });
      }}
      onLikePost={(postId: string) => {
        logger.info("Post liked", { postId });
      }}
      onCommentOnPost={(postId: string, comment: string) => {
        logger.info("Comment added", { postId, comment });
      }}
      onSharePost={(postId: string) => {
        logger.info("Post shared", { postId });
      }}
    />
  );

  const renderPacksTab = () => (
    <ScrollView style={styles.packsContainer}>
      <View style={styles.packsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Pack Groups
        </Text>
        <TouchableOpacity
          style={[styles.createPackButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreatePackModal(true)}
        >
          <PlusIcon size={20} color="#FFFFFF" />
          <Text style={styles.createPackButtonText}>Create Pack</Text>
        </TouchableOpacity>
      </View>

      {packGroups.map((pack: PackGroup) => (
        <View
          key={pack._id}
          style={[styles.packCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.packHeader}>
            <View style={styles.packInfo}>
              <Text style={[styles.packName, { color: colors.text }]}>
                {pack.name}
              </Text>
              <Text
                style={[
                  styles.packDescription,
                  { color: colors.text, opacity: 0.7 },
                ]}
              >
                {pack.description}
              </Text>
              <View style={styles.packStats}>
                <UsersIcon size={16} color={colors.text} />
                <Text style={[styles.packMemberCount, { color: colors.text }]}>
                  {pack.memberCount} members
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.joinButton,
                {
                  backgroundColor: pack.isMember ? "#EF4444" : colors.primary,
                },
              ]}
              onPress={() =>
                pack.isMember
                  ? void handleLeavePack(pack._id)
                  : void handleJoinPack(pack._id)
              }
            >
              <Text style={styles.joinButtonText}>
                {pack.isMember ? "Leave" : "Join"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {packGroups.length === 0 && (
        <View style={styles.emptyPacks}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No pack groups yet
          </Text>
          <Text
            style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6 }]}
          >
            Create or join a pack group to connect with other pet owners!
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderSuggestionsTab = () => (
    <ScrollView style={styles.suggestionsContainer}>
      <View style={styles.suggestionsHeader}>
        <SparklesIcon size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          AI Suggestions
        </Text>
      </View>

      <Text
        style={[
          styles.suggestionsSubtitle,
          { color: colors.text, opacity: 0.7 },
        ]}
      >
        Personalized recommendations to help you engage with the community
      </Text>

      {aiSuggestions.map((suggestion: AISuggestion) => (
        <TouchableOpacity
          key={suggestion.id}
          style={[styles.suggestionCard, { backgroundColor: colors.card }]}
          onPress={() => handleAISuggestionPress(suggestion)}
        >
          <View style={styles.suggestionIcon}>
            <Text style={styles.suggestionEmoji}>{suggestion.icon}</Text>
          </View>
          <View style={styles.suggestionContent}>
            <Text style={[styles.suggestionTitle, { color: colors.text }]}>
              {suggestion.title}
            </Text>
            <Text
              style={[
                styles.suggestionDescription,
                { color: colors.text, opacity: 0.7 },
              ]}
            >
              {suggestion.description}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.suggestionAction,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => handleAISuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionActionText}>
              {suggestion.actionText}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Community
        </Text>
        <TouchableOpacity style={styles.searchButton}>
          <MagnifyingGlassIcon size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      {activeTab === "feed" && renderFeedTab()}
      {activeTab === "packs" && renderPacksTab()}
      {activeTab === "suggestions" && renderSuggestionsTab()}

      {/* Create Pack Modal */}
      <Modal
        visible={showCreatePackModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowCreatePackModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Pack
            </Text>
            <TouchableOpacity onPress={handleCreatePack} disabled={loading}>
              <Text style={[styles.createButton, { color: colors.primary }]}>
                {loading ? "Creating..." : "Create"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Pack Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Enter pack name"
                placeholderTextColor={colors.text + "80"}
                value={newPackName}
                onChangeText={setNewPackName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Describe your pack group"
                placeholderTextColor={colors.text + "80"}
                value={newPackDescription}
                onChangeText={setNewPackDescription}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" as const },
  searchButton: { padding: 8 },
  tabBar: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: { fontSize: 16, fontWeight: "600" as const },
  packsContainer: { flex: 1 },
  packsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold" as const },
  createPackButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createPackButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold" as const,
    marginLeft: 4,
  },
  packCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  packHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  packInfo: { flex: 1, marginRight: 12 },
  packName: { fontSize: 18, fontWeight: "bold" as const, marginBottom: 4 },
  packDescription: { fontSize: 14, marginBottom: 8 },
  packStats: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  packMemberCount: { fontSize: 12, marginLeft: 4 },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: { color: "#FFFFFF", fontWeight: "bold" as const },
  emptyPacks: {
    alignItems: "center" as const,
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold" as const, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" as const },
  suggestionsContainer: { flex: 1 },
  suggestionsHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  suggestionsSubtitle: {
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  suggestionCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  suggestionEmoji: { fontSize: 24 },
  suggestionContent: { flex: 1, marginRight: 12 },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 4,
  },
  suggestionDescription: { fontSize: 14 },
  suggestionAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  suggestionActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold" as const,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
  },
  cancelButton: { fontSize: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold" as const },
  createButton: { fontSize: 16, fontWeight: "bold" as const },
  modalContent: { flex: 1, padding: 16 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: "bold" as const, marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
});

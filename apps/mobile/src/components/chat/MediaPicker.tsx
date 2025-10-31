/**
 * Media Picker Component
 * Provides UI for selecting images, videos, files, GIFs, and stickers
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { chatMediaService } from '../../services/ChatMediaService';
import type { MediaFile, GifResult, StickerResult } from '../../services/ChatMediaService';
import { logger } from '@pawfectmatch/core';

export type MediaPickerMode = 'image' | 'video' | 'file' | 'gif' | 'sticker' | 'all';

interface MediaPickerProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaFile | GifResult | StickerResult) => void;
  mode?: MediaPickerMode;
  allowsMultipleSelection?: boolean;
  matchId: string;
}

type MediaPickerTab = 'camera' | 'library' | 'gif' | 'sticker' | 'file';

export function MediaPicker({
  visible,
  onClose,
  onMediaSelected,
  mode = 'all',
  allowsMultipleSelection = false,
  matchId: _matchId,
}: MediaPickerProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [activeTab, setActiveTab] = useState<MediaPickerTab>('library');
  const [isLoading, setIsLoading] = useState(false);
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [stickers, setStickers] = useState<StickerResult[]>([]);
  const [gifQuery, setGifQuery] = useState('');
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>('reactions');

  // Load trending GIFs and stickers on mount
  useEffect(() => {
    if (visible && activeTab === 'gif' && gifQuery.trim() === '') {
      handleGifSearch('');
    }
  }, [visible, activeTab]);

  useEffect(() => {
    if (visible && activeTab === 'sticker') {
      handleStickerCategoryChange(selectedStickerCategory);
    }
  }, [visible, activeTab, selectedStickerCategory]);

  const handlePickImage = async () => {
    setIsLoading(true);
    try {
      const images = await chatMediaService.pickImage({
        allowsEditing: true,
        quality: 0.8,
        allowsMultipleSelection,
      });
      
      if (images.length > 0) {
        onMediaSelected(images[0]!);
        if (!allowsMultipleSelection) {
          onClose();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to pick image', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    setIsLoading(true);
    try {
      const photo = await chatMediaService.takePhoto({
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (photo) {
        onMediaSelected(photo);
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to take photo', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickVideo = async () => {
    setIsLoading(true);
    try {
      const videos = await chatMediaService.pickVideo({ quality: 0.8 });
      
      if (videos.length > 0) {
        onMediaSelected(videos[0]!);
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to pick video', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickFile = async () => {
    setIsLoading(true);
    try {
      const files = await chatMediaService.pickFile();
      
      if (files.length > 0) {
        onMediaSelected(files[0]!);
        onClose();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to pick file', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGifSearch = async (query: string) => {
    setGifQuery(query);
    setIsLoading(true);
    try {
      const results = query.trim()
        ? await chatMediaService.searchGifs(query)
        : await chatMediaService.getTrendingGifs();
      setGifs(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to search GIFs', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStickerCategoryChange = async (category: string) => {
    setSelectedStickerCategory(category);
    setIsLoading(true);
    try {
      const results = await chatMediaService.getStickers(category);
      setStickers(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Failed to load stickers', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabs = () => {
    if (mode === 'image' || mode === 'video' || mode === 'file') {
      return null; // Hide tabs for single mode
    }

    const tabs: Array<{ key: MediaPickerTab; label: string; icon: string }> = [];
    
    if (mode === 'all') {
      tabs.push({ key: 'library', label: 'Library', icon: 'images-outline' });
      tabs.push({ key: 'camera', label: 'Camera', icon: 'camera-outline' });
    }
    
    if (mode === 'all' || mode === 'gif') {
      tabs.push({ key: 'gif', label: 'GIF', icon: 'logo-github' });
    }
    
    if (mode === 'all' || mode === 'sticker') {
      tabs.push({ key: 'sticker', label: 'Stickers', icon: 'happy-outline' });
    }
    
    if (mode === 'all') {
      tabs.push({ key: 'file', label: 'File', icon: 'document-outline' });
    }

    return (
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={`${tab.label} tab`}
            accessibilityState={{ selected: activeTab === tab.key }}
            accessibilityHint={`Switch to ${tab.label} media picker`}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? theme.colors.primary : theme.colors.onMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      );
    }

    switch (activeTab) {
      case 'camera':
        return (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleTakePhoto}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              accessibilityHint="Open camera to take a new photo"
            >
              <Ionicons name="camera" size={32} color={theme.colors.surface} />
              <Text style={[styles.optionLabel, { color: theme.colors.surface }]}>Take Photo</Text>
            </TouchableOpacity>
            {mode === 'all' || mode === 'video' ? (
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.success }]}
                onPress={handlePickVideo}
                accessibilityRole="button"
                accessibilityLabel="Record video"
                accessibilityHint="Open camera to record a new video"
              >
                <Ionicons name="videocam" size={32} color={theme.colors.surface} />
                <Text style={[styles.optionLabel, { color: theme.colors.surface }]}>Record Video</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );

      case 'library':
        return (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
              onPress={handlePickImage}
              accessibilityRole="button"
              accessibilityLabel="Choose photo"
              accessibilityHint="Select a photo from your library"
            >
              <Ionicons name="images" size={32} color={theme.colors.surface} />
              <Text style={[styles.optionLabel, { color: theme.colors.surface }]}>Choose Photo</Text>
            </TouchableOpacity>
            {mode === 'all' || mode === 'video' ? (
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.colors.success }]}
                onPress={handlePickVideo}
                accessibilityRole="button"
                accessibilityLabel="Choose video"
                accessibilityHint="Select a video from your library"
              >
                <Ionicons name="film" size={32} color={theme.colors.surface} />
                <Text style={[styles.optionLabel, { color: theme.colors.surface }]}>Choose Video</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );

      case 'gif':
        return (
          <View style={styles.gifContainer}>
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.onSurface,
                  borderColor: theme.colors.border 
                }]}
                placeholder="Search GIFs..."
                placeholderTextColor={theme.colors.onMuted}
                value={gifQuery}
                onChangeText={handleGifSearch}
                autoFocus
                accessibilityLabel="GIF search input"
                accessibilityHint="Type to search for GIFs"
                accessibilityRole="search"
              />
            </View>
            {gifs.length > 0 ? (
              <FlatList
                data={gifs}
                numColumns={3}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.gifItem}
                    onPress={() => {
                      onMediaSelected(item);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select GIF ${item.id}`}
                    accessibilityHint="Tap to select this GIF"
                  >
                    <Image
                      source={{ uri: item.preview || item.url }}
                      style={styles.gifImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.gifList}
              />
            ) : gifQuery.trim() === '' ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  Search for GIFs above or browse trending
                </Text>
                <TouchableOpacity
                  style={[styles.trendingButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleGifSearch('')}
                  accessibilityRole="button"
                  accessibilityLabel="View trending GIFs"
                  accessibilityHint="Show currently trending GIFs"
                >
                  <Text style={[styles.trendingButtonText, { color: theme.colors.surface }]}>
                  View Trending
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  No GIFs found for "{gifQuery}"
                </Text>
              </View>
            )}
          </View>
        );

      case 'sticker':
        return (
          <View style={styles.stickerContainer}>
            <ScrollView 
              horizontal 
              style={styles.categoryScroll}
              showsHorizontalScrollIndicator={false}
            >
              {['reactions', 'emotions', 'animals', 'objects', 'celebration'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedStickerCategory === category && styles.categoryChipActive,
                    selectedStickerCategory === category 
                      ? { backgroundColor: theme.colors.primary }
                      : { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                  ]}
                  onPress={() => handleStickerCategoryChange(category)}
                  accessibilityRole="button"
                  accessibilityLabel={`${category} sticker category`}
                  accessibilityState={{ selected: selectedStickerCategory === category }}
                  accessibilityHint={`Show ${category} stickers`}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedStickerCategory === category
                        ? { color: theme.colors.surface }
                        : { color: theme.colors.onSurface }
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {stickers.length > 0 ? (
              <FlatList
                data={stickers}
                numColumns={4}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.stickerItem}
                    onPress={() => {
                      onMediaSelected(item);
                      onClose();
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${selectedStickerCategory} sticker ${item.id}`}
                    accessibilityHint="Tap to select this sticker"
                  >
                    <Image
                      source={{ uri: item.url }}
                      style={styles.stickerImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.stickerList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                  No stickers found in {selectedStickerCategory}
                </Text>
              </View>
            )}
          </View>
        );

      case 'file':
        return (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.colors.info }]}
              onPress={handlePickFile}
              accessibilityRole="button"
              accessibilityLabel="Choose file"
              accessibilityHint="Select a file to attach"
            >
              <Ionicons name="document" size={32} color={theme.colors.surface} />
              <Text style={[styles.optionLabel, { color: theme.colors.surface }]}>Choose File</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Add Media</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          {renderTabs()}

          {/* Content */}
          <ScrollView style={styles.content}>{renderContent()}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
    },
    closeButton: {
      padding: 4,
    },
    tabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      gap: 4,
    },
    tabActive: {
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.primary,
    },
    tabLabel: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    tabLabelActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    optionsContainer: {
      gap: 16,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      borderRadius: theme.radii.lg,
      gap: 12,
    },
    optionLabel: {
      fontSize: 18,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    gifContainer: {
      flex: 1,
      padding: 16,
    },
    stickerContainer: {
      flex: 1,
      padding: 16,
    },
    placeholderText: {
      textAlign: 'center',
      fontSize: 16,
      marginTop: 40,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInput: {
      height: 44,
      borderRadius: theme.radii.md,
      paddingHorizontal: 16,
      borderWidth: 1,
      fontSize: 16,
    },
    gifList: {
      padding: 8,
    },
    gifItem: {
      flex: 1,
      aspectRatio: 1,
      margin: 4,
      borderRadius: theme.radii.md,
      overflow: 'hidden',
    },
    gifImage: {
      width: '100%',
      height: '100%',
    },
    stickerList: {
      padding: 8,
    },
    stickerItem: {
      flex: 1,
      aspectRatio: 1,
      margin: 4,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stickerImage: {
      width: '80%',
      height: '80%',
    },
    categoryScroll: {
      maxHeight: 50,
      marginBottom: 12,
    },
    categoryChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radii.full,
      marginRight: 8,
      borderWidth: 1,
    },
    categoryChipActive: {
      borderWidth: 0,
    },
    categoryChipText: {
      fontSize: 14,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 16,
      marginBottom: 16,
    },
    trendingButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: theme.radii.lg,
    },
    trendingButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });
}


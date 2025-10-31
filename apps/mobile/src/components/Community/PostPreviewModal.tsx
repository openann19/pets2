/**
 * Post Preview Modal Component
 * Wrapper for the PostPreview component in a modal
 */

import React from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { PostPreview } from './PostPreview';
import type { PostCreationData } from '../../services/postCreationService';

interface PostPreviewModalProps {
  visible: boolean;
  postData: PostCreationData | null;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  isLoading?: boolean;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({
  visible,
  postData,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  if (!postData) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      accessibilityViewIsModal
      transparent={true}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <TouchableWithoutFeedback>
            <View style={{ flex: 1, marginTop: 50 }}>
              <PostPreview
                postData={postData}
                onClose={onClose}
                onSubmit={onSubmit}
                isLoading={isLoading}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


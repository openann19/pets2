/**
 * Post Creation Modal Component
 * Wrapper for the CreatePostForm in a modal
 */

import React from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CreatePostForm } from './CreatePostForm';
import type { CreatePostRequest } from '../../services/communityAPI';
import type { UploadProgress } from '../../services/postCreationService';

interface PostCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePostRequest) => Promise<void>;
  isSubmitting?: boolean;
  uploadProgress?: UploadProgress | null;
}

export const PostCreationModal: React.FC<PostCreationModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting = false,
  uploadProgress,
}) => {
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
              <CreatePostForm
                onSubmit={onSubmit}
                onCancel={onClose}
                isSubmitting={isSubmitting}
                {...(uploadProgress !== undefined && { uploadProgress: uploadProgress ?? null })}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};


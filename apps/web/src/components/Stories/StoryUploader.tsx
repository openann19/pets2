'use client';
/**
 * StoryUploader Component
 *
 * Photo/video upload interface for creating stories with caption editor.
 *
 * Features:
 * - File selection (photo/video)
 * - Preview with caption overlay
 * - Duration indicator for videos
 * - Cloudinary upload with progress
 * - Success feedback
 */
import http from '@/lib/http';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, Loader2, Upload, Video, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
export function StoryUploader({ onSuccess, onCancel }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [caption, setCaption] = useState('');
    const [mediaType, setMediaType] = useState('photo');
    const fileInputRef = useRef(null);
    const queryClient = useQueryClient();
    // Upload story mutation
    const uploadStoryMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await http.post('/api/stories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response;
        },
        onSuccess: () => {
            toast.success('Story uploaded successfully!');
            queryClient.invalidateQueries({ queryKey: ['stories-feed'] });
            resetForm();
            if (onSuccess)
                onSuccess();
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to upload story');
        },
    });
    const handleFileSelect = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
            toast.error('Please select an image or video file');
            return;
        }
        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            toast.error('File size must be less than 50MB');
            return;
        }
        setMediaType(isVideo ? 'video' : 'photo');
        setSelectedFile(file);
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }, []);
    const handleUpload = useCallback(() => {
        if (!selectedFile)
            return;
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('mediaType', mediaType);
        if (caption.trim()) {
            formData.append('caption', caption.trim());
        }
        uploadStoryMutation.mutate(formData);
    }, [selectedFile, mediaType, caption, uploadStoryMutation]);
    const resetForm = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption('');
        setMediaType('photo');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);
    const handleCancel = useCallback(() => {
        resetForm();
        if (onCancel)
            onCancel();
    }, [resetForm, onCancel]);
    return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Create Story
                    </h2>
                    <button onClick={handleCancel} disabled={uploadStoryMutation.isPending} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50">
                        <X size={20}/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {!selectedFile ? (
        // File Selection UI
        <motion.div key="file-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden"/>

                                {/* Upload Button */}
                                <button onClick={() => fileInputRef.current?.click()} className="w-full py-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition flex flex-col items-center gap-4 group">
                                    <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition">
                                        <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400"/>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Choose a photo or video
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            Max size: 50MB
                                        </p>
                                    </div>
                                </button>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => {
                if (fileInputRef.current) {
                    fileInputRef.current.accept = 'image/*';
                    fileInputRef.current.click();
                }
            }} className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition">
                                        <ImageIcon size={20}/>
                                        <span className="font-medium">Photo</span>
                                    </button>
                                    <button onClick={() => {
                if (fileInputRef.current) {
                    fileInputRef.current.accept = 'video/*';
                    fileInputRef.current.click();
                }
            }} className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition">
                                        <Video size={20}/>
                                        <span className="font-medium">Video</span>
                                    </button>
                                </div>
                            </motion.div>) : (
        // Preview & Caption UI
        <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {/* Preview */}
                                <div className="relative w-full aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
                                    {mediaType === 'photo' && previewUrl ? (<Image src={previewUrl} alt="Preview" fill className="object-contain"/>) : mediaType === 'video' && previewUrl ? (<video src={previewUrl} controls className="w-full h-full object-contain"/>) : null}

                                    {/* Caption Overlay */}
                                    {caption && (<div className="absolute bottom-4 left-4 right-4">
                                            <p className="text-white text-center bg-black/50 px-4 py-2 rounded-full text-sm">
                                                {caption}
                                            </p>
                                        </div>)}
                                </div>

                                {/* Caption Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Add a caption (optional)
                                    </label>
                                    <textarea value={caption} onChange={(e) => setCaption(e.target.value.slice(0, 200))} placeholder="What's on your mind?" maxLength={200} rows={3} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"/>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                                        {caption.length}/200
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button onClick={resetForm} disabled={uploadStoryMutation.isPending} className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium disabled:opacity-50">
                                        Change
                                    </button>
                                    <button onClick={handleUpload} disabled={uploadStoryMutation.isPending} className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                                        {uploadStoryMutation.isPending ? (<>
                                                <Loader2 size={20} className="animate-spin"/>
                                                <span>Uploading...</span>
                                            </>) : ('Share to Story')}
                                    </button>
                                </div>
                            </motion.div>)}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>);
}
//# sourceMappingURL=StoryUploader.jsx.map
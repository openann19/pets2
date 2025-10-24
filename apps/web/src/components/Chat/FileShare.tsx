'use client';
import { CloudArrowUpIcon, DocumentIcon, DocumentTextIcon, MusicalNoteIcon, PaperClipIcon, PhotoIcon, VideoCameraIcon, XMarkIcon, } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
export const FileShare = ({ onFileSelect, onClose }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const fileTypes = [
        {
            id: 'image',
            label: 'Photos',
            icon: PhotoIcon,
            accept: 'image/*',
            description: 'JPG, PNG, GIF, WebP',
        },
        {
            id: 'video',
            label: 'Videos',
            icon: VideoCameraIcon,
            accept: 'video/*',
            description: 'MP4, MOV, AVI, WebM',
        },
        {
            id: 'audio',
            label: 'Audio',
            icon: MusicalNoteIcon,
            accept: 'audio/*',
            description: 'MP3, WAV, M4A, OGG',
        },
        {
            id: 'document',
            label: 'Documents',
            icon: DocumentTextIcon,
            accept: '.pdf,.doc,.docx,.txt,.rtf',
            description: 'PDF, DOC, TXT, RTF',
        },
        {
            id: 'other',
            label: 'Other Files',
            icon: DocumentIcon,
            accept: '*/*',
            description: 'Any file type',
        },
    ];
    const handleFileSelect = (file, type) => {
        setUploading(true);
        setUploadProgress(0);
        // Simulate upload progress
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);
        // Simulate upload completion
        setTimeout(() => {
            setUploadProgress(100);
            setUploading(false);
            onFileSelect(file, type);
            onClose();
        }, 1000);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            const type = getFileType(file);
            handleFileSelect(file, type);
        }
    };
    const getFileType = (file) => {
        if (file.type.startsWith('image/'))
            return 'image';
        if (file.type.startsWith('video/'))
            return 'video';
        if (file.type.startsWith('audio/'))
            return 'audio';
        if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text'))
            return 'document';
        return 'other';
    };
    const openFileDialog = (accept) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept;
            fileInputRef.current.click();
        }
    };
    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const type = getFileType(file);
            handleFileSelect(file, type);
        }
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share a File</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <XMarkIcon className="h-5 w-5 text-gray-500"/>
        </button>
      </div>

      {/* Drag and Drop Area */}
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
            ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-pink-400'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Drag and drop a file here</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">or choose from the options below</p>
      </div>

      {/* File Type Options */}
      <div className="mt-6 space-y-2">
        {fileTypes.map((fileType) => {
            const Icon = fileType.icon;
            return (<motion.button key={fileType.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openFileDialog(fileType.accept)} className="w-full flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3"/>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">{fileType.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{fileType.description}</p>
              </div>
              <PaperClipIcon className="h-5 w-5 text-gray-400"/>
            </motion.button>);
        })}
      </div>

      {/* Upload Progress */}
      {uploading && (<div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploading...
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div className="bg-pink-600 h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }}/>
          </div>
        </div>)}

      {/* Hidden File Input */}
      <input ref={fileInputRef} type="file" onChange={handleFileInputChange} className="hidden"/>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Maximum file size: 10MB
        </p>
      </div>
    </div>);
};
//# sourceMappingURL=FileShare.jsx.map
'use client';
import { useToast } from '@/components/ui/toast';
import { MicrophoneIcon, PaperAirplaneIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { logger } from '@pawfectmatch/core';
import { useEffect, useRef, useState } from 'react';
export const VoiceRecorder = ({ onSend, onCancel }) => {
    const toast = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach((track) => { track.stop(); });
            };
            mediaRecorder.start();
            setIsRecording(true);
            // Start timer
            timerRef.current = setInterval(() => {
                setDuration((prev) => {
                    if (prev >= 60) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        catch (error) {
            logger.error('Error accessing microphone:', { error });
            toast.error('Unable to access microphone', 'Please check your permissions.');
        }
    };
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };
    const handleSend = () => {
        if (audioBlob) {
            onSend(audioBlob, duration);
        }
    };
    const handleCancel = () => {
        if (isRecording) {
            stopRecording();
        }
        setAudioBlob(null);
        setDuration(0);
        onCancel();
    };
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    useEffect(() => {
        startRecording();
    }, []);
    return (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isRecording ? 'Recording...' : 'Voice Message'}
          </h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cancel">
            <XMarkIcon className="w-6 h-6"/>
          </button>
        </div>

        {/* Waveform Visualization */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-1 h-24">
            {isRecording ? (Array.from({ length: 20 }).map((_, i) => (<div key={i} className="w-1 bg-gradient-to-t from-pink-500 to-purple-600 rounded-full animate-pulse" style={{
                height: `${Math.random() * 60 + 20}%`,
                animationDelay: `${i * 0.05}s`,
            }}/>))) : (<div className="text-gray-400 dark:text-gray-500">
                <MicrophoneIcon className="w-12 h-12"/>
              </div>)}
          </div>
        </div>

        {/* Duration */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isRecording ? 'Recording in progress' : 'Ready to send'}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          {isRecording ? (<button onClick={stopRecording} className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full transition-colors" aria-label="Stop recording">
              <StopIcon className="w-8 h-8 text-white"/>
            </button>) : (<>
              <button onClick={handleCancel} className="flex items-center justify-center w-14 h-14 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors" aria-label="Delete">
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400"/>
              </button>
              <button onClick={handleSend} className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full transition-all shadow-lg" aria-label="Send">
                <PaperAirplaneIcon className="w-6 h-6 text-white"/>
              </button>
            </>)}
        </div>

        {/* Hint */}
        <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          {isRecording
            ? 'Tap stop when finished (max 60 seconds)'
            : 'Tap send to share your voice message'}
        </div>
      </div>
    </div>);
};
export default VoiceRecorder;
//# sourceMappingURL=VoiceRecorder.jsx.map
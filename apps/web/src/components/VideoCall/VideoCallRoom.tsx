/**
 * 🎥 PHASE 3: Video Call Room Component
 * WebRTC video calling interface for premium users
 */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../UI/LoadingSpinner';
import { VideoCameraIcon, VideoCameraSlashIcon, MicrophoneIcon, PhoneXMarkIcon, XMarkIcon, ArrowsPointingOutIcon, } from '@heroicons/react/24/solid';
import { useVideoCall } from '../../hooks/premium-hooks';
export default function VideoCallRoom({ roomId, userId, userName, onLeave }) {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const { localStream, isConnected, isVideoEnabled, isAudioEnabled, isScreenSharing, error, startCall, endCall, toggleVideo, toggleAudio, startScreenShare, stopScreenShare, } = useVideoCall(roomId, userId);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Initialize call on mount
    useEffect(() => {
        startCall({
            video: true,
            audio: true,
        });
    }, []);
    // Attach local stream to video element
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);
    const handleLeave = () => {
        endCall();
        onLeave();
    };
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        }
        else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };
    return (<div className="fixed inset-0 z-50 bg-gray-900">
      {/* Error Message */}
      {error && (<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-10">
          {error}
        </div>)}

      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote Video (Full Screen) */}
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"/>

        {/* Local Video (Picture-in-Picture) */}
        <motion.div drag dragConstraints={{
            top: 0,
            left: 0,
            right: window.innerWidth - 320,
            bottom: window.innerHeight - 240,
        }} className="absolute top-4 right-4 w-80 h-60 bg-gray-800 rounded-xl overflow-hidden shadow-2xl cursor-move">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"/>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded-lg">
            <p className="text-white text-sm font-medium">{userName} (You)</p>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-800 bg-opacity-90 px-6 py-4 rounded-full shadow-2xl">
          {/* Toggle Video */}
          <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoEnabled
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-red-500 hover:bg-red-600'}`} title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            {isVideoEnabled ? (<VideoCameraIcon className="w-6 h-6 text-white"/>) : (<VideoCameraSlashIcon className="w-6 h-6 text-white"/>)}
          </button>

          {/* Toggle Audio */}
          <button onClick={toggleAudio} className={`p-4 rounded-full transition-all ${isAudioEnabled
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-red-500 hover:bg-red-600'}`} title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
            <MicrophoneIcon className="w-6 h-6 text-white"/>
          </button>

          {/* Screen Share */}
          <button onClick={isScreenSharing ? stopScreenShare : startScreenShare} className={`p-4 rounded-full transition-all ${isScreenSharing
            ? 'bg-purple-500 hover:bg-purple-600'
            : 'bg-gray-700 hover:bg-gray-600'}`} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            <ArrowsPointingOutIcon className="w-6 h-6 text-white"/>
          </button>

          {/* End Call */}
          <button onClick={handleLeave} className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all" title="End call">
            <PhoneXMarkIcon className="w-6 h-6 text-white"/>
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-all" title="Toggle fullscreen">
            <ArrowsPointingOutIcon className="w-6 h-6 text-white"/>
          </button>
        </div>

        {/* Connection Status */}
        {!isConnected && (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <LoadingSpinner size="lg" color="#ffffff" className="mx-auto mb-4"/>
            <p className="text-white text-lg">Connecting to call...</p>
          </div>)}

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-white text-sm font-medium">Room: {roomId}</p>
          <p className="text-green-400 text-xs mt-1">● Connected</p>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=VideoCallRoom.jsx.map
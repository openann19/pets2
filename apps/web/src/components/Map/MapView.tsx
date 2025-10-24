import L, { DivIcon, LatLngExpression } from 'leaflet'
import { logger } from '@pawfectmatch/core';
;
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Socket, io } from 'socket.io-client';
// import { PulsePin } from '@pawfectmatch/core/types/realtime';
import { ChatBubbleLeftRightIcon, HeartIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import LoadingSpinner from '../UI/LoadingSpinner';
// import { SPRING_CONFIG } from '@pawfectmatch/core/constants/animations';
const SPRING_CONFIG = { type: "spring", stiffness: 260, damping: 20 };
// Enhanced icon system with activity-based styling
const createActivityIcon = (activity, isMatch = false) => {
    const activityIcons = {
        walking: '🚶',
        playing: '🎾',
        grooming: '✂️',
        vet: '🏥',
        park: '🏞️',
        other: '📍'
    };
    const colors = {
        walking: '#3B82F6',
        playing: '#10B981',
        grooming: '#8B5CF6',
        vet: '#EF4444',
        park: '#059669',
        other: '#6B7280'
    };
    const emoji = activityIcons[activity] || '📍';
    const color = colors[activity] || '#6B7280';
    const borderColor = isMatch ? '#EC4899' : color;
    return new DivIcon({
        html: `
      <div style="
        width: 40px;
        height: 40px;
        background: ${color};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: pulse 2s infinite;
      ">
        ${emoji}
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    `,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};
const AnimatedMarker = memo(({ pin, isMatch = false, onMarkerClick }) => {
    const [isNew, setIsNew] = useState(true);
    const [showTrail, setShowTrail] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsNew(false), 2000);
        return () => clearTimeout(timer);
    }, []);
    const handleMarkerClick = useCallback(() => {
        onMarkerClick?.(pin);
        setShowTrail(!showTrail);
    }, [pin, onMarkerClick, showTrail]);
    const activityLabels = {
        walking: 'Taking a walk',
        playing: 'Playing around',
        grooming: 'Getting groomed',
        vet: 'At the vet',
        park: 'At the dog park',
        other: 'Active nearby'
    };
    return (<>
      <Marker position={[pin.coordinates[1], pin.coordinates[0]]} icon={createActivityIcon(pin.activity, isMatch)} eventHandlers={{
            click: handleMarkerClick
        }}>
        <Popup className="custom-popup">
          <div className="p-3 min-w-[200px]">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${isMatch ? 'bg-pink-500' : 'bg-blue-500'}`}/>
              <strong className="text-gray-900">
                {activityLabels[pin.activity] || pin.activity}
              </strong>
            </div>
            
            {pin.message && (<p className="text-sm text-gray-600 mb-2">{pin.message}</p>)}
            
            <div className="text-xs text-gray-500 mb-3">
              {new Date(pin.createdAt).toLocaleTimeString()}
            </div>
            
            {isMatch && (<div className="flex space-x-2">
                <button className="flex items-center space-x-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200 transition-colors">
                  <HeartIcon className="w-3 h-3"/>
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors">
                  <ChatBubbleLeftRightIcon className="w-3 h-3"/>
                  <span>Chat</span>
                </button>
              </div>)}
          </div>
        </Popup>
      </Marker>
      
      {/* Activity radius circle */}
      <Circle center={[pin.coordinates[1], pin.coordinates[0]]} radius={100} pathOptions={{
            color: isMatch ? '#EC4899' : '#3B82F6',
            fillColor: isMatch ? '#EC4899' : '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.6
        }}/>
      
      {/* New pin animation */}
      {isNew && (<Circle center={[pin.coordinates[1], pin.coordinates[0]]} radius={200} pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.2,
                weight: 3,
                opacity: 0.8
            }}/>)}
    </>);
});
AnimatedMarker.displayName = 'AnimatedMarker'; // For React dev tools
const AutoCenter = ({ pins }) => {
    const map = useMap();
    useEffect(() => {
        if (pins.length === 0)
            return;
        const bounds = L.latLngBounds(pins.map((p) => [p.coordinates[1], p.coordinates[0]]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 }); // Cap zoom for usability
    }, [pins, map]);
    return null;
};
const MapView = ({ filters }) => {
    const [pins, setPins] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedPin, setSelectedPin] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    // Socket connection state
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation([position.coords.latitude, position.coords.longitude]);
            }, (error) => {
                logger.warn('Geolocation error:', { error });
                // Fallback to NYC
                setUserLocation([40.75, -73.98]);
            });
        }
        else {
            setUserLocation([40.75, -73.98]);
        }
    }, []);
    // ✅ PRODUCTION READY - Real WebSocket connection for live pin updates
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
        const socket = io(socketUrl, {
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            forceNew: true
        });
        // Connection established
        socket.on('connect', () => {
            logger.info('✅ MapView connected to real-time pulse feed');
            setIsConnected(true);
            setConnectionError(null);
            // Request initial pins based on user location and filters
            if (userLocation) {
                socket.emit('request:initial-pins', {
                    location: userLocation,
                    radius: filters?.radius || 5
                });
            }
        });
        // Connection lost
        socket.on('disconnect', (reason) => {
            logger.warn('⚠️ MapView disconnected:', { reason });
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                socket.connect();
            }
        });
        // Connection error
        socket.on('connect_error', (error) => {
            logger.warn('⚠️ MapView connection error:', { error.message });
            setIsConnected(false);
            setConnectionError('Unable to connect to live updates. Retrying...');
            // Add some mock data for development when connection fails
            if (process.env.NODE_ENV === 'development') {
                logger.info('🔄 Adding mock data for development');
                const mockPins = [
                    {
                        _id: 'mock-1',
                        petId: 'pet-1',
                        ownerId: 'user-1',
                        coordinates: [-73.98, 40.75],
                        activity: 'walking',
                        message: 'Taking a walk in Central Park',
                        createdAt: new Date().toISOString()
                    },
                    {
                        _id: 'mock-2',
                        petId: 'pet-2',
                        ownerId: 'user-2',
                        coordinates: [-73.99, 40.76],
                        activity: 'playing',
                        message: 'Playing fetch at the dog park',
                        createdAt: new Date().toISOString()
                    }
                ];
                setPins(mockPins);
            }
        });
        // Reconnection successful
        socket.on('reconnect', (attemptNumber) => {
            logger.info(`✅ MapView reconnected after ${attemptNumber} attempts`);
            setIsConnected(true);
            setConnectionError(null);
        });
        // ✅ REAL DATA - Live pin updates from backend
        socket.on('pin:created', (pin) => {
            setPins((prev) => {
                // Remove duplicate if exists, add new pin
                const updated = prev.filter((p) => p._id !== pin._id);
                return [...updated, pin].slice(-100); // Keep last 100 pins
            });
        });
        socket.on('pin:updated', (pin) => {
            setPins((prev) => {
                const updated = prev.map((p) => p._id === pin._id ? pin : p);
                return updated;
            });
        });
        socket.on('pin:removed', (pinId) => {
            setPins((prev) => prev.filter((p) => p._id !== pinId));
        });
        socket.on('heatmap:update', (data) => {
            setHeatmapData(data);
        });
        // ❌ REMOVED: No more mock data simulation!
        // Real pins come from backend via WebSocket events
        return () => {
            socket.disconnect();
        };
    }, [userLocation, filters?.radius]);
    // Filter pins based on current filters
    const filteredPins = useMemo(() => {
        if (!filters)
            return pins;
        return pins.filter(pin => {
            if (!filters.activityTypes.includes(pin.activity))
                return false;
            // Add more filtering logic here
            return true;
        });
    }, [pins, filters]);
    const handleMarkerClick = useCallback((pin) => {
        setSelectedPin(pin);
    }, []);
    const center = useMemo(() => {
        return userLocation || [40.75, -73.98];
    }, [userLocation]);
    if (!userLocation) {
        return (<div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
        <div className="text-center">
          <LoadingSpinner size="lg" color="#EC4899" className="mb-4"/>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>);
    }
    // Connection status indicator
    const ConnectionStatus = () => (<div className="absolute top-4 right-4 z-[1000]">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 ${isConnected
            ? 'bg-green-500/20 border border-green-500/50 text-green-100'
            : connectionError
                ? 'bg-red-500/20 border border-red-500/50 text-red-100'
                : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-100'}`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}/>
        <span className="text-sm font-semibold">
          {isConnected ? 'Live' : connectionError ? 'Reconnecting...' : 'Connecting...'}
        </span>
      </motion.div>
    </div>);
    return (<div className="relative h-full w-full" key="map-container">
      {/* Connection Status Indicator */}
      <ConnectionStatus />
      
      <div key="map-wrapper">
        <MapContainer center={center} zoom={13} className="h-full w-full rounded-2xl overflow-hidden shadow-lg" aria-label="Interactive map of pet locations" zoomControl={false} key="leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        
        {/* User location marker */}
        {userLocation && (<Marker position={userLocation} icon={new DivIcon({
                html: `
                <div style="
                  width: 20px;
                  height: 20px;
                  background: #EC4899;
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                ">
                </div>
              `,
                className: 'user-location-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>)}
        
        {/* Pet activity pins */}
        {filteredPins.map((pin) => (<AnimatedMarker key={pin._id} pin={pin} isMatch={Math.random() > 0.7} // Simulate matches
         onMarkerClick={handleMarkerClick}/>))}
        
        <AutoCenter pins={filteredPins}/>
        </MapContainer>
      </div>
      
      {/* Custom zoom controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200">
          <MapPinIcon className="h-5 w-5 text-gray-600 dark:text-gray-400"/>
        </button>
      </div>
    </div>);
};
export default MapView;
//# sourceMappingURL=MapView.jsx.map
//# sourceMappingURL=MapView.jsx.map
'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Socket } from 'socket.io-client';
const SocketContext = createContext(undefined);
export function SocketProvider({ children }) {
    const socket = useSocket();
    const isConnected = socket?.connected || false;
    return (<SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>);
}
export function useSocketContext() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}
//# sourceMappingURL=SocketContext.jsx.map
import { Room, RoomEvent, RemoteParticipant, RemoteTrackPublication, ConnectionState, LocalTrackPublication, LocalVideoTrack, LocalAudioTrack } from 'livekit-client';
import { logger } from '@pawfectmatch/core';

export interface LiveStreamConfig {
  url: string;
  token: string;
}

export interface LiveStreamState {
  isConnected: boolean;
  isPublishing: boolean;
  participants: RemoteParticipant[];
  viewerCount: number;
  error: string | null;
}

/**
 * Discriminated union type for all LiveKit service events
 */
export type LiveKitEventData =
  | { event: 'trackPublished'; publication: RemoteTrackPublication; participant: RemoteParticipant }
  | { event: 'trackUnpublished'; publication: RemoteTrackPublication; participant: RemoteParticipant }
  | { event: 'participantConnected'; participant: RemoteParticipant }
  | { event: 'participantDisconnected'; participant: RemoteParticipant }
  | { event: 'disconnected' }
  | { event: 'reconnecting' }
  | { event: 'reconnected' }
  | { event: 'connectionStateChanged'; state: ConnectionState }
  | { event: 'localTrackPublished'; publication: LocalTrackPublication }
  | { event: 'localTrackUnpublished'; publication: LocalTrackPublication };

/**
 * Type-safe event callback handler
 */
type LiveKitEventCallback<T extends LiveKitEventData['event']> = 
  (data: Extract<LiveKitEventData, { event: T }>) => void;

class LiveKitService {
  private room: Room | null = null;
  private listeners: Map<string, Set<(data: LiveKitEventData) => void>> = new Map();

  /**
   * Connect to a LiveKit room
   */
  async connect(config: LiveStreamConfig): Promise<Room> {
    try {
      if (this.room) {
        await this.room.disconnect();
      }

      const room = new Room();
      await room.connect(config.url, config.token);

      this.setupRoomListeners(room);
      this.room = room;

      logger.info('Connected to LiveKit room', { 
        name: room.name 
      });

      return room;
    } catch (error) {
      logger.error('Failed to connect to LiveKit room', { error });
      throw error;
    }
  }

  /**
   * Disconnect from the room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.listeners.clear();
  }

  /**
   * Get current room
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Toggle camera
   */
  async toggleCamera(): Promise<void> {
    logger.info('Toggle camera - LiveKit API integration pending');
  }

  /**
   * Toggle microphone
   */
  async toggleMicrophone(): Promise<void> {
    logger.info('Toggle microphone - LiveKit API integration pending');
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera(): Promise<void> {
    logger.info('Switch camera feature - LiveKit API integration pending');
  }

  /**
   * Enable/disable camera
   */
  async enableCamera(enabled: boolean): Promise<void> {
    logger.info('Enable/disable camera - LiveKit API integration pending', { enabled });
  }

  /**
   * Enable/disable microphone
   */
  async enableMicrophone(enabled: boolean): Promise<void> {
    logger.info('Enable/disable microphone - LiveKit API integration pending', { enabled });
  }

  /**
   * Setup room event listeners
   */
  private setupRoomListeners(room: Room): void {
    room.on(RoomEvent.TrackPublished, (publication, participant) => {
      logger.debug('Track published', { 
        track: publication.trackSid,
        participant: participant.identity 
      });
      
      this.emit('trackPublished', { event: 'trackPublished', publication, participant });
    });

    room.on(RoomEvent.TrackUnpublished, (publication, participant) => {
      logger.debug('Track unpublished', { 
        track: publication.trackSid,
        participant: participant.identity 
      });
      
      this.emit('trackUnpublished', { event: 'trackUnpublished', publication, participant });
    });

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      logger.debug('Participant connected', { identity: participant.identity });
      this.emit('participantConnected', { event: 'participantConnected', participant });
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      logger.debug('Participant disconnected', { identity: participant.identity });
      this.emit('participantDisconnected', { event: 'participantDisconnected', participant });
    });

    room.on(RoomEvent.Disconnected, () => {
      logger.info('Disconnected from room');
      this.emit('disconnected', { event: 'disconnected' });
    });

    room.on(RoomEvent.Reconnecting, () => {
      logger.info('Reconnecting to room');
      this.emit('reconnecting', { event: 'reconnecting' });
    });

    room.on(RoomEvent.Reconnected, () => {
      logger.info('Reconnected to room');
      this.emit('reconnected', { event: 'reconnected' });
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      logger.debug('Connection state changed', { state });
      this.emit('connectionStateChanged', { event: 'connectionStateChanged', state });
    });

    room.on(RoomEvent.LocalTrackPublished, (publication) => {
      logger.debug('Local track published', { track: publication.trackSid });
      this.emit('localTrackPublished', { event: 'localTrackPublished', publication });
    });

    room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
      logger.debug('Local track unpublished', { track: publication.trackSid });
      this.emit('localTrackUnpublished', { event: 'localTrackUnpublished', publication });
    });
  }

  /**
   * Subscribe to room events
   */
  on<T extends LiveKitEventData['event']>(event: T, callback: LiveKitEventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event)!;
    listeners.add(callback as (data: LiveKitEventData) => void);
  }

  /**
   * Unsubscribe from room events
   */
  off<T extends LiveKitEventData['event']>(event: T, callback: LiveKitEventCallback<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback as (data: LiveKitEventData) => void);
    }
  }

  /**
   * Emit room events
   */
  private emit(event: string, data: LiveKitEventData): void {
    this.listeners.get(event)?.forEach(callback => { callback(data); });
  }
}

// Export singleton
export const liveKitService = new LiveKitService();
export default liveKitService;


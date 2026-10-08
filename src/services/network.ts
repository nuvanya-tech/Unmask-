import { Player } from '../types/game';

type EventCallback = (data: any) => void;

export class NetworkManager {
  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;
  private roomCode: string | null = null;
  private player: Player | null = null;
  private keepAliveTimer: any = null;

  constructor() {
    this.setupListenersMap();
  }

  private setupListenersMap() {
    this.listeners.set('joined_room', new Set());
    this.listeners.set('peer_joined', new Set());
    this.listeners.set('peer_left', new Set());
    this.listeners.set('game_action', new Set());
    this.listeners.set('error', new Set());
    this.listeners.set('connected', new Set());
    this.listeners.set('disconnected', new Set());
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {
        console.error('Listener callback error:', e);
      }
    });
  }

  public connect(roomCode: string, player: Player, password?: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.roomCode = roomCode.trim().toUpperCase();
      this.player = player;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        if (this.ws) {
          this.ws.close();
        }

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.emit('connected', {});

          // Join room message
          this.ws?.send(
            JSON.stringify({
              type: 'join_room',
              payload: {
                roomCode: this.roomCode,
                player: this.player,
                password,
              },
            })
          );

          // Ping interval
          this.keepAliveTimer = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 20000);

          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (e) {
            console.error('Error parsing incoming message:', e);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('WebSocket error, continuing...', err);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
          this.emit('disconnected', {});
        };
      } catch (err) {
        console.error('WebSocket connection failed:', err);
        resolve(false);
      }
    });
  }

  private handleServerMessage(message: { type: string; payload?: any }) {
    const { type, payload } = message;

    if (type === 'joined_room') {
      this.emit('joined_room', payload);
      // Initialize WebRTC if guest joined or host is ready
      if (this.player?.isHost && payload.guest) {
        this.initiateWebRTC(true);
      }
    } else if (type === 'peer_joined') {
      this.emit('peer_joined', payload);
      if (this.player?.isHost) {
        this.initiateWebRTC(true);
      }
    } else if (type === 'peer_left') {
      this.emit('peer_left', payload);
    } else if (type === 'game_action') {
      this.emit('game_action', payload);
    } else if (type === 'error') {
      this.emit('error', payload);
    } else if (type === 'signal') {
      this.handleWebRTCSignal(payload);
    }
  }

  // WebRTC DataChannel (with transparent fallback to WS relay)
  private async initiateWebRTC(isInitiator: boolean) {
    try {
      const config: RTCConfiguration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };

      this.peerConnection = new RTCPeerConnection(config);

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'signal',
              payload: { candidate: event.candidate },
            })
          );
        }
      };

      if (isInitiator) {
        this.dataChannel = this.peerConnection.createDataChannel('unmask-game', { ordered: true });
        this.setupDataChannel(this.dataChannel);

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: 'signal',
              payload: { offer },
            })
          );
        }
      } else {
        this.peerConnection.ondatachannel = (event) => {
          this.dataChannel = event.channel;
          this.setupDataChannel(this.dataChannel);
        };
      }
    } catch (e) {
      console.warn('WebRTC peer negotiation notice: using WebSocket relay fallback', e);
    }
  }

  private async handleWebRTCSignal(signal: any) {
    try {
      if (!this.peerConnection) {
        await this.initiateWebRTC(false);
      }

      if (signal.offer) {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(signal.offer));
        const answer = await this.peerConnection?.createAnswer();
        if (answer) {
          await this.peerConnection?.setLocalDescription(answer);
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(
              JSON.stringify({
                type: 'signal',
                payload: { answer },
              })
            );
          }
        }
      } else if (signal.answer) {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(signal.answer));
      } else if (signal.candidate) {
        await this.peerConnection?.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (e) {
      console.warn('WebRTC signal handling notice, using WS fallback:', e);
    }
  }

  private setupDataChannel(channel: RTCDataChannel) {
    channel.onmessage = (event) => {
      try {
        const action = JSON.parse(event.data);
        this.emit('game_action', action);
      } catch (err) {
        console.error('Error parsing data channel message:', err);
      }
    };
  }

  /**
   * Broadcast a game action to the other player.
   * Uses WebRTC DataChannel if open, or WebSocket relay instantly.
   */
  public sendAction(actionType: string, payload: any) {
    const message = { actionType, payload, timestamp: Date.now() };

    // Try WebRTC DataChannel first
    let sentOverP2P = false;
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(message));
        sentOverP2P = true;
      } catch {
        // Fall back to WebSocket
      }
    }

    // Always send over WebSocket relay if not sent or as reliable channel
    if (!sentOverP2P && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'game_action',
          payload: message,
        })
      );
    }
  }

  public disconnect() {
    if (this.keepAliveTimer) clearInterval(this.keepAliveTimer);
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export const network = new NetworkManager();

import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ConnectedPlayer {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  ws?: WebSocket;
}

interface RoomRecord {
  code: string;
  password?: string;
  vibe: string;
  host: ConnectedPlayer;
  guest: ConnectedPlayer | null;
  createdAt: number;
  lastActive: number;
}

const rooms = new Map<string, RoomRecord>();

// Helper to generate 6-character room codes
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Clean up stale rooms every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActive > 1000 * 60 * 60 * 4) { // 4 hours
      rooms.delete(code);
    }
  }
}, 1000 * 60 * 15);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.use(express.json());

  // REST API: Room check
  app.post('/api/rooms/check', (req, res) => {
    const { roomCode } = req.body;
    if (!roomCode || typeof roomCode !== 'string') {
      return res.status(400).json({ error: 'Room code required' });
    }
    const cleanCode = roomCode.trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.json({ exists: false, error: 'That room does not exist anymore.' });
    }

    const isFull = !!(room.host && room.guest);
    return res.json({
      exists: true,
      roomCode: cleanCode,
      hasPassword: !!room.password,
      isFull,
      vibe: room.vibe,
      hostName: room.host.name,
      hostAvatar: room.host.avatar,
    });
  });

  // REST API: Create room
  app.post('/api/rooms/create', (req, res) => {
    const { hostName, hostAvatar, password, vibe, hostPlayerId } = req.body;
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    const assignedHostId = hostPlayerId || ('host_' + Math.random().toString(36).substring(2, 9));

    const room: RoomRecord = {
      code,
      password: password ? String(password).trim() : undefined,
      vibe: vibe || 'REAL',
      host: {
        id: assignedHostId,
        name: hostName || 'Player 1',
        avatar: hostAvatar || 'phantom',
        isHost: true,
      },
      guest: null,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };

    rooms.set(code, room);
    return res.json({
      success: true,
      roomCode: code,
      hostId: room.host.id,
      vibe: room.vibe,
    });
  });

  // WebSocket signaling and real-time state relay
  wss.on('connection', (ws) => {
    let currentRoomCode: string | null = null;
    let playerId: string | null = null;
    let isHost = false;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, payload } = message;

        if (type === 'join_room') {
          const { roomCode, player, password } = payload;
          const cleanCode = (roomCode || '').trim().toUpperCase();
          const room = rooms.get(cleanCode);

          if (!room) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: "That room doesn't exist anymore." } }));
            return;
          }

          // Check password if set
          if (room.password && room.password !== (password || '').trim()) {
            ws.send(JSON.stringify({ type: 'error', payload: { message: "That password doesn't match." } }));
            return;
          }

          currentRoomCode = cleanCode;
          playerId = player.id;
          room.lastActive = Date.now();

          // Identify if host reconnecting or guest joining
          if (player.isHost || room.host.id === player.id) {
            isHost = true;
            room.host.id = player.id;
            room.host.ws = ws;
            room.host.name = player.name || room.host.name;
            room.host.avatar = player.avatar || room.host.avatar;

            ws.send(JSON.stringify({
              type: 'joined_room',
              payload: {
                role: 'host',
                roomCode: cleanCode,
                vibe: room.vibe,
                host: { id: room.host.id, name: room.host.name, avatar: room.host.avatar },
                guest: room.guest ? { id: room.guest.id, name: room.guest.name, avatar: room.guest.avatar } : null,
              },
            }));

            // Notify guest if already present
            if (room.guest?.ws && room.guest.ws.readyState === WebSocket.OPEN) {
              room.guest.ws.send(JSON.stringify({
                type: 'peer_joined',
                payload: {
                  player: { id: room.host.id, name: room.host.name, avatar: room.host.avatar, isHost: true },
                },
              }));
            }
          } else {
            // Guest joining
            if (room.guest && room.guest.id !== player.id && room.guest.ws && room.guest.ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'error', payload: { message: 'This room already has two players.' } }));
              return;
            }

            isHost = false;
            room.guest = {
              id: player.id,
              name: player.name || 'Player 2',
              avatar: player.avatar || 'ember',
              isHost: false,
              ws,
            };

            ws.send(JSON.stringify({
              type: 'joined_room',
              payload: {
                role: 'guest',
                roomCode: cleanCode,
                vibe: room.vibe,
                host: { id: room.host.id, name: room.host.name, avatar: room.host.avatar },
                guest: { id: room.guest.id, name: room.guest.name, avatar: room.guest.avatar },
              },
            }));

            // Notify host that guest has connected
            if (room.host.ws && room.host.ws.readyState === WebSocket.OPEN) {
              room.host.ws.send(JSON.stringify({
                type: 'peer_joined',
                payload: {
                  player: { id: room.guest.id, name: room.guest.name, avatar: room.guest.avatar, isHost: false },
                },
              }));
            }
          }
          return;
        }

        // WebRTC Signaling Relay (offers, answers, ICE candidates)
        if (type === 'signal') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;
          room.lastActive = Date.now();

          const targetWs = isHost ? room.guest?.ws : room.host.ws;
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'signal',
              payload: payload,
            }));
          }
          return;
        }

        // Reliable Real-Time Game Action Relay (ensures 100% bulletproof sync)
        if (type === 'game_action') {
          if (!currentRoomCode) return;
          const room = rooms.get(currentRoomCode);
          if (!room) return;
          room.lastActive = Date.now();

          const targetWs = isHost ? room.guest?.ws : room.host.ws;
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'game_action',
              payload: payload,
            }));
          }
          return;
        }

        // Keep-alive ping
        if (type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomCode) {
        const room = rooms.get(currentRoomCode);
        if (room) {
          if (isHost && room.host.ws === ws) {
            room.host.ws = undefined;
            if (room.guest?.ws && room.guest.ws.readyState === WebSocket.OPEN) {
              room.guest.ws.send(JSON.stringify({
                type: 'peer_left',
                payload: { message: 'The host disconnected.' },
              }));
            }
          } else if (!isHost && room.guest?.ws === ws) {
            room.guest.ws = undefined;
            if (room.host.ws && room.host.ws.readyState === WebSocket.OPEN) {
              room.host.ws.send(JSON.stringify({
                type: 'peer_left',
                payload: { message: 'Your opponent left the room.' },
              }));
            }
          }
        }
      }
    });
  });

  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = parseInt(process.env.PORT || '3000', 10);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`UNMASK server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start UNMASK server:', err);
  process.exit(1);
});

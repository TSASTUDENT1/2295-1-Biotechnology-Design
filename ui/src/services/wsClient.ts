/**
 * wsClient.ts — WebSocket client for the Python backend.
 *
 * Connects to ws://localhost:8765 (the Pi's websocket_server.py).
 * Reconnects automatically on disconnect.
 * Fails silently during dev when no Pi is connected — MockAIService
 * still drives the UI normally.
 *
 * Inbound message schema:
 *   {"event": "mode_cycle"}   — GPIO 27 button pressed
 *   {"event": "frame", ...}   — real inference frame (future)
 */

type Message = { event: string; [key: string]: unknown };
type Handler = (msg: Message) => void;

const WS_URL = "ws://localhost:8765";
const RECONNECT_MS = 2000;

export class WSClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private stopped = false;

  constructor() {
    this.connect();
  }

  private connect() {
    if (this.stopped) return;
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as Message;
          this.handlers.forEach((h) => h(msg));
        } catch {
          // malformed message — ignore
        }
      };

      this.ws.onclose = () => {
        if (!this.stopped) {
          setTimeout(() => this.connect(), RECONNECT_MS);
        }
      };

      // suppress unhandled error events (connection refused during dev)
      this.ws.onerror = () => {};
    } catch {
      if (!this.stopped) {
        setTimeout(() => this.connect(), RECONNECT_MS);
      }
    }
  }

  subscribe(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  dispose() {
    this.stopped = true;
    this.ws?.close();
  }
}

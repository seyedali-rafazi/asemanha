import type { AircraftListResponse, BboxParams } from "./types";

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

type MessageHandler = (data: AircraftListResponse) => void;
type StatusHandler = (status: WebSocketStatus) => void;

function getWebSocketUrl(bbox?: BboxParams): string {
  let base = "ws://localhost:8000/api/v1/ws/live";
  if (import.meta.env.VITE_WS_BASE_URL) {
    base = import.meta.env.VITE_WS_BASE_URL;
  } else if (typeof window !== "undefined") {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      base = "ws://localhost:8000/api/v1/ws/live";
    } else {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      base = `${protocol}//${window.location.host}/api/v1/ws/live`;
    }
  }

  if (bbox) {
    const params = new URLSearchParams();
    if (bbox.lamin !== undefined) params.append("lamin", String(bbox.lamin));
    if (bbox.lomin !== undefined) params.append("lomin", String(bbox.lomin));
    if (bbox.lamax !== undefined) params.append("lamax", String(bbox.lamax));
    if (bbox.lomax !== undefined) params.append("lomax", String(bbox.lomax));
    if (bbox.zoom !== undefined) params.append("zoom", String(bbox.zoom));
    const qs = params.toString();
    if (qs) {
      base += `?${qs}`;
    }
  }

  return base;
}

export class LiveAircraftWebSocket {
  private ws: WebSocket | null = null;
  private customUrl?: string;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: WebSocketStatus = "disconnected";
  private currentBbox: BboxParams | null = null;
  private isExplicitlyClosed = false;

  constructor(url?: string) {
    this.customUrl = url;
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => this.statusHandlers.delete(handler);
  }

  private setStatus(status: WebSocketStatus) {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  public connect(bbox?: BboxParams) {
    if (bbox) {
      this.currentBbox = bbox;
    }
    this.isExplicitlyClosed = false;

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      if (bbox) {
        this.setBbox(bbox);
      }
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.setStatus("connecting");

    try {
      const targetUrl = this.customUrl || getWebSocketUrl(this.currentBbox ?? undefined);
      this.ws = new WebSocket(targetUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus("connected");
        if (this.currentBbox) {
          this.setBbox(this.currentBbox);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: AircraftListResponse = JSON.parse(event.data);
          this.messageHandlers.forEach((handler) => handler(data));
        } catch (e) {
          console.warn("[LiveWS] Failed to parse message:", e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn("[LiveWS] WebSocket error:", e);
        this.setStatus("error");
      };

      this.ws.onclose = () => {
        this.setStatus("disconnected");
        this.ws = null;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      console.warn("[LiveWS] Connection attempt failed:", e);
      this.setStatus("error");
      this.scheduleReconnect();
    }
  }

  public setBbox(bbox: BboxParams) {
    this.currentBbox = bbox;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(bbox));
      } catch (e) {
        console.warn("[LiveWS] Failed to send bbox filter:", e);
      }
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus("disconnected");
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("[LiveWS] Maximum reconnect attempts reached.");
      return;
    }

    const backoff = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, backoff);
  }
}

export const liveWebSocket = new LiveAircraftWebSocket();

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Set();
    this.isConnected = false;
  }

  connect(url) {
    if (this.ws) {
      if (this.ws.url === url && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        return;
      }
      this.ws.onclose = null; // Prevent reconnect loop from old instance
      this.ws.close();
    }
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.isConnected = true;
      console.log('Connected to TrustNode:', url);
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach(listener => listener(data));
      } catch (e) {
        console.error("Invalid message format", e);
      }
    };
    
    this.ws.onclose = () => {
      this.isConnected = false;
      console.log('Disconnected from TrustNode');
      // basic reconnect loop for demo
      setTimeout(() => this.connect(url), 2000);
    };
  }

  sendEvent(eventData) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(eventData));
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const wsClient = new WebSocketClient();

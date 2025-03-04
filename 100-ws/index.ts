import { MessageEvent, ErrorEvent, WebSocket } from 'ws';
// 定义事件数据结构
interface PumpCreatedPayload {
    id: string;
    name: string;
    timestamp: string;
}

// WebSocket 消息格式（根据 API 文档调整）
interface WebSocketMessage {
    event: "pump_created" | "heartbeat" | "error";
    payload: PumpCreatedPayload | string;
}

class WebSocketClient {
    private socket: WebSocket | null = null;
    private reconnectInterval = 3000; // 3 秒重试
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.connect();
    }

    // 连接 WebSocket
    private connect(): void {
        const url = `wss://shy-methodical-butterfly.solana-devnet.quiknode.pro/xxxx`
        //   const url = `wss://quicknote.com/ws?token=${this.apiKey}`;
        // const url = `wss://rpc.shyft.to?api_key=${this.apiKey}`;
        this.socket = new WebSocket(url);

        // 监听事件
        this.socket.addEventListener('open', () => this.handleOpen());
        this.socket.addEventListener('message', (event) => this.handleMessage(event));
        this.socket.addEventListener('error', (error) => this.handleError(error));
        this.socket.addEventListener('close', () => this.handleClose());
    }

    // 连接成功
    private handleOpen(): void {
        console.log('WebSocket 连接成功');
        this.subscribeToEvent('pump_created');
    }

    // 订阅事件
    private subscribeToEvent(eventName: string): void {
        if (this.socket?.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                action: "subscribe",
                event: eventName
            });
            this.socket.send(message);
        }
    }

    // 处理接收的消息
    private handleMessage(event: MessageEvent): void {
        try {
            const data: WebSocketMessage = JSON.parse(event.data.toString());

            if (data.event === 'pump_created') {
                const payload = data.payload as PumpCreatedPayload;
                console.log('新 Pump 创建:', payload);
            } else if (data.event === 'error') {
                console.error('服务端返回错误:', data.payload);
            }
        } catch (error) {
            console.error('消息解析失败:', error);
        }
    }

    // 处理错误
    private handleError(error: ErrorEvent): void {
        console.error('WebSocket 错误:', error);
    }

    // 处理连接关闭
    private handleClose(): void {
        console.log('连接已关闭，尝试重连...');
        setTimeout(() => this.connect(), this.reconnectInterval);
    }

    // 关闭连接
    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

// 使用示例
const API_KEY = 'my_shyft_key'; // 替换为你的 API Key
const wsClient = new WebSocketClient(API_KEY);

// 如需手动关闭连接
// wsClient.disconnect();
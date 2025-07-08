import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FastTextResult {
  tokens: Array<{
    word: string;
    lang: string;
    language: string;
    confidence: number;
  }>;
  phrases: Array<{
    words: string[];
    text: string;
    language: string;
    confidence: number;
    startIndex: number;
    endIndex: number;
    isUserLanguage: boolean;
  }>;
  switchPoints: number[];
  confidence: number;
  userLanguageMatch: boolean;
  detectedLanguages: string[];
  processing: {
    timeMs: number;
    engine: string;
    modelPath?: string;
    tokensPerSecond: number;
  };
}

export interface FastTextRequest {
  text: string;
  languages?: string[];
}

export interface FastTextResponse {
  error?: string;
  status?: string;
  engine?: string;
  model?: string;
  [key: string]: any;
}

class FastTextService extends EventEmitter {
  private worker: ChildProcess | null = null;
  private isReady = false;
  private pendingRequests = new Map<string, {
    resolve: (value: FastTextResult) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private requestIdCounter = 0;
  private workerPath: string;

  constructor() {
    super();
    this.workerPath = path.join(__dirname, '../../python_workers/fasttext_worker.py');
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('[FastText Service] Initializing FastText worker...');
      
      // Start the Python worker process
      this.worker = spawn('python3', [this.workerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.dirname(this.workerPath)
      });

      // Handle worker stdout (responses)
      this.worker.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line: string) => line.trim());
        for (const line of lines) {
          try {
            const response: FastTextResponse = JSON.parse(line);
            this.handleWorkerResponse(response);
          } catch (error) {
            console.error('[FastText Service] Invalid JSON from worker:', line);
          }
        }
      });

      // Handle worker stderr (logs)
      this.worker.stderr?.on('data', (data) => {
        console.error('[FastText Service] Worker stderr:', data.toString());
      });

      // Handle worker exit
      this.worker.on('exit', (code) => {
        console.log(`[FastText Service] Worker exited with code ${code}`);
        this.isReady = false;
        this.rejectAllPendingRequests(new Error('Worker process exited'));
      });

      // Handle worker error
      this.worker.on('error', (error) => {
        console.error('[FastText Service] Worker error:', error);
        this.isReady = false;
        this.rejectAllPendingRequests(error);
      });

      // Wait for ready signal
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.error('[FastText Service] Worker initialization timeout');
          resolve(false);
        }, 60000); // 60 second timeout for Render deployment

        this.once('ready', () => {
          clearTimeout(timeout);
          resolve(true);
        });

        this.once('error', () => {
          clearTimeout(timeout);
          resolve(false);
        });
      });

    } catch (error) {
      console.error('[FastText Service] Initialization error:', error);
      return false;
    }
  }

  private handleWorkerResponse(response: FastTextResponse): void {
    // Handle ready signal
    if (response.status === 'ready') {
      console.log(`[FastText Service] Worker ready with ${response.engine} engine`);
      this.isReady = true;
      this.emit('ready');
      return;
    }

    // Handle error responses
    if (response.error) {
      console.error('[FastText Service] Worker error:', response.error);
      this.emit('error', new Error(response.error));
      return;
    }

    // Handle regular responses - for now, resolve the oldest pending request
    // In a more sophisticated implementation, we'd use request IDs
    const pendingEntries = Array.from(this.pendingRequests.entries());
    if (pendingEntries.length > 0) {
      const [requestId, { resolve, timeout }] = pendingEntries[0];
      this.pendingRequests.delete(requestId);
      clearTimeout(timeout);
      resolve(response as FastTextResult);
    }
  }

  private rejectAllPendingRequests(error: Error): void {
    for (const [requestId, { reject, timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
      reject(error);
    }
    this.pendingRequests.clear();
  }

  async detectLanguage(text: string, languages: string[] = []): Promise<FastTextResult> {
    if (!this.isReady || !this.worker) {
      throw new Error('FastText service not initialized');
    }

    return new Promise<FastTextResult>((resolve, reject) => {
      const requestId = (++this.requestIdCounter).toString();
      
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('FastText request timeout'));
      }, 10000); // 10 second timeout

      // Store the request
      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      // Send the request
      const request: FastTextRequest = { text, languages };
      try {
        this.worker!.stdin?.write(JSON.stringify(request) + '\n');
      } catch (error) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async shutdown(): Promise<void> {
    if (this.worker) {
      this.worker.kill();
      this.worker = null;
    }
    this.isReady = false;
    this.rejectAllPendingRequests(new Error('Service shutting down'));
  }

  getStatus(): { ready: boolean; pendingRequests: number } {
    return {
      ready: this.isReady,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Singleton instance
export const fastTextService = new FastTextService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[FastText Service] Shutting down...');
  await fastTextService.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[FastText Service] Shutting down...');
  await fastTextService.shutdown();
  process.exit(0);
});

export default fastTextService;
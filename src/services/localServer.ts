import TcpSocket from 'react-native-tcp-socket';
import { FileManager } from './fileManager';
import { useFileStore } from '../store/fileStore';
import { v4 as uuidv4 } from 'uuid';
import { HttpParser, MultipartFormData } from './httpServerImpl';

export interface FileTransferRequest {
  filename: string;
  size: number;
  type: string;
  data: string; // base64
}

export class LocalServerManager {
  private static isRunning = false;
  private static serverPort = 5555;
  private static server: ReturnType<typeof TcpSocket.createServer> | null = null;
  private static socketConnections = new Map();

  static async startServer(port: number = 5555): Promise<boolean> {
    try {
      if (this.isRunning) {
        console.log('Server already running');
        return true;
      }

      this.serverPort = port;
      await FileManager.initialize();

      this.server = TcpSocket.createServer((socket) => {
        const socketId = uuidv4();
        let requestData = '';

        console.log(`[FileSync] New connection: ${socketId}`);

        socket.on('data', async (data) => {
          try {
            requestData += data.toString('binary');

            // Check if we have the complete headers
            if (!requestData.includes('\r\n\r\n')) {
              return; // Wait for more data
            }

            // Try to parse the request
            const parsed = HttpParser.parseRequest(requestData);
            if (!parsed) {
              this.sendErrorResponse(socket, 400, 'Invalid request');
              socket.destroy();
              return;
            }

            const { headers, body } = parsed;

            // Extract request line
            const firstLine = requestData.split('\r\n')[0];
            const [method, path] = firstLine.split(' ');

            console.log(`[FileSync] ${method} ${path}`);

            // Handle CORS preflight
            if (method === 'OPTIONS') {
              socket.write(HttpParser.buildCorsResponse());
              socket.destroy();
              return;
            }

            // Handle file upload
            if (method === 'POST' && path === '/upload') {
              await this.handleUpload(socket, headers, body);
              return;
            }

            // Handle GET root (health check)
            if (method === 'GET' && path === '/') {
              const response = HttpParser.buildHttpResponse(
                200,
                JSON.stringify({ status: 'ok', device: 'FileSync' })
              );
              socket.write(response);
              socket.destroy();
              return;
            }

            // 404
            this.sendErrorResponse(socket, 404, 'Not found');
            socket.destroy();
          } catch (error) {
            console.error('[FileSync] Error handling request:', error);
            this.sendErrorResponse(socket, 500, 'Internal server error');
            socket.destroy();
          }
        });

        socket.on('error', (err) => {
          console.error(`[FileSync] Socket error (${socketId}):`, err);
        });

        socket.on('close', () => {
          console.log(`[FileSync] Connection closed: ${socketId}`);
          this.socketConnections.delete(socketId);
        });

        this.socketConnections.set(socketId, socket);
      });

      this.server.listen(port, () => {
        console.log(`[FileSync] Server listening on port ${port}`);
      });

      this.server.on('error', (err) => {
        console.error('[FileSync] Server error:', err);
      });

      this.isRunning = true;
      return true;
    } catch (error) {
      console.error('[FileSync] Failed to start server:', error);
      return false;
    }
  }

  private static async handleUpload(
    socket: any,
    headers: Record<string, string>,
    body: string
  ) {
    try {
      const contentType = headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);

      if (!boundaryMatch) {
        this.sendErrorResponse(socket, 400, 'No boundary in Content-Type');
        socket.destroy();
        return;
      }

      const boundary = boundaryMatch[1].replace(/"/g, '');
      const formData = HttpParser.parseMultipart(body, boundary);

      // Check if we have file and metadata
      if (!formData.files.file) {
        this.sendErrorResponse(socket, 400, 'No file in request');
        socket.destroy();
        return;
      }

      const fileData = formData.files.file;
      let metadata: { name: string; type: string; size: number } | null = null;

      // Try to parse metadata from form field
      if (formData.fields.metadata) {
        try {
          metadata = JSON.parse(formData.fields.metadata);
        } catch {
          // Use filename if metadata parsing fails
          metadata = {
            name: fileData.filename,
            type: 'application/octet-stream',
            size: fileData.data.length,
          };
        }
      } else {
        metadata = {
          name: fileData.filename,
          type: 'application/octet-stream',
          size: fileData.data.length,
        };
      }

      // Convert buffer to base64
      const base64Data = fileData.data.toString('base64');

      // Save the file
      const fileId = uuidv4();
      const result = await FileManager.saveFile(metadata.name, base64Data);

      if (result) {
        // Add to store
        const addFile = useFileStore.getState().addFile;
        addFile({
          id: fileId,
          name: metadata.name,
          size: metadata.size,
          type: metadata.type,
          receivedAt: Date.now(),
          path: result.path,
        });

        console.log(`[FileSync] File saved: ${metadata.name} (${metadata.size} bytes)`);

        // Send success response
        const response = HttpParser.buildHttpResponse(
          200,
          JSON.stringify({
            success: true,
            id: fileId,
            message: 'File received successfully',
          })
        );
        socket.write(response);
      } else {
        this.sendErrorResponse(socket, 500, 'Failed to save file');
      }

      socket.destroy();
    } catch (error) {
      console.error('[FileSync] Error handling upload:', error);
      this.sendErrorResponse(socket, 500, 'Error processing upload');
      socket.destroy();
    }
  }

  private static sendErrorResponse(socket: any, statusCode: number, message: string) {
    const response = HttpParser.buildHttpResponse(
      statusCode,
      JSON.stringify({ success: false, message })
    );
    socket.write(response);
  }

  static stopServer() {
    if (this.server) {
      // Close all active connections
      this.socketConnections.forEach((socket) => {
        try {
          socket.destroy();
        } catch (err) {
          console.error('Error closing socket:', err);
        }
      });
      this.socketConnections.clear();

      // Close server
      try {
        this.server.close();
      } catch (err) {
        console.error('Error closing server:', err);
      }
      this.server = null;
    }
    this.isRunning = false;
    console.log('[FileSync] Server stopped');
  }

  static isServerRunning(): boolean {
    return this.isRunning;
  }

  static getServerInfo() {
    return {
      port: this.serverPort,
      running: this.isRunning,
      connections: this.socketConnections.size,
    };
  }

  static getConnectionCount(): number {
    return this.socketConnections.size;
  }
}

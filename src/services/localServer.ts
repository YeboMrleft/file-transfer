import { FileManager } from './fileManager';
import { useFileStore } from '../store/fileStore';
import { v4 as uuidv4 } from 'uuid';

export interface FileTransferRequest {
  filename: string;
  size: number;
  type: string;
  data: string; // base64
}

export class LocalServerManager {
  private static isRunning = false;
  private static serverPort = 5555;

  static async startServer(port: number = 5555): Promise<boolean> {
    try {
      this.serverPort = port;
      // In a real implementation, we'd start an actual HTTP server here
      // For now, we'll prepare the infrastructure
      await FileManager.initialize();
      this.isRunning = true;
      console.log(`FileSync server ready on port ${port}`);
      return true;
    } catch (error) {
      console.error('Failed to start server:', error);
      return false;
    }
  }

  static stopServer() {
    this.isRunning = false;
    console.log('FileSync server stopped');
  }

  static isServerRunning(): boolean {
    return this.isRunning;
  }

  static async handleFileUpload(request: FileTransferRequest) {
    try {
      const fileId = uuidv4();
      const result = await FileManager.saveFile(request.filename, request.data);

      if (result) {
        const fileInfo = await FileManager.getFileInfo(result.path);
        const addFile = useFileStore.getState().addFile;

        addFile({
          id: fileId,
          name: request.filename,
          size: request.size,
          type: request.type,
          receivedAt: Date.now(),
          path: result.path,
        });

        return {
          success: true,
          id: fileId,
          message: 'File received successfully',
        };
      } else {
        return {
          success: false,
          message: 'Failed to save file',
        };
      }
    } catch (error) {
      console.error('Error handling file upload:', error);
      return {
        success: false,
        message: 'Error processing file',
        error: String(error),
      };
    }
  }

  static getServerInfo() {
    return {
      port: this.serverPort,
      running: this.isRunning,
    };
  }
}

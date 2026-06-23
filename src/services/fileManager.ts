import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

const FILESYNC_DIR = `${FileSystem.documentDirectory}FileSync`;

export class FileManager {
  static async initialize() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FILESYNC_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FILESYNC_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize FileSync directory:', error);
    }
  }

  static async saveFile(
    filename: string,
    base64Data: string,
  ): Promise<{ id: string; path: string } | null> {
    try {
      const fileId = uuidv4();
      const fileExtension = filename.split('.').pop() || '';
      const safeName = `${fileId}.${fileExtension}`;
      const filePath = `${FILESYNC_DIR}/${safeName}`;

      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return { id: fileId, path: filePath };
    } catch (error) {
      console.error('Failed to save file:', error);
      return null;
    }
  }

  static async getFileInfo(filePath: string) {
    try {
      const info = await FileSystem.getInfoAsync(filePath);
      return info;
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      await FileSystem.deleteAsync(filePath);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  static async getAllFiles() {
    try {
      const files = await FileSystem.readDirectoryAsync(FILESYNC_DIR);
      return files;
    } catch (error) {
      console.error('Failed to read directory:', error);
      return [];
    }
  }

  static getFileSizeInMB(bytes: number): number {
    return Math.round((bytes / (1024 * 1024)) * 100) / 100;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

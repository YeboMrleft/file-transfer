import { NetworkStateType } from 'expo-network';
import * as Network from 'expo-network';

export class NetworkService {
  static async getLocalIpAddress(): Promise<string | null> {
    try {
      const ip = await Network.getIpAddressAsync();
      return ip;
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return null;
    }
  }

  static async checkWifiConnection(): Promise<boolean> {
    try {
      const state = await Network.getNetworkStateAsync();
      return (
        state.isConnected &&
        state.type === NetworkStateType.WIFI
      );
    } catch (error) {
      console.error('Failed to check WiFi connection:', error);
      return false;
    }
  }

  static async getNetworkState() {
    try {
      return await Network.getNetworkStateAsync();
    } catch (error) {
      console.error('Failed to get network state:', error);
      return null;
    }
  }

  static generateQRCodeValue(ip: string, port: number, deviceName: string): string {
    return JSON.stringify({
      type: 'filesync-device',
      ip,
      port,
      name: deviceName,
    });
  }

  static parseQRCodeValue(qrValue: string) {
    try {
      const data = JSON.parse(qrValue);
      if (data.type === 'filesync-device' && data.ip && data.port) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }
}

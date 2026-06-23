import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface DeviceStore {
  deviceId: string;
  deviceName: string;
  localIp: string | null;
  port: number;
  isServerRunning: boolean;
  isOnWifi: boolean;

  setDeviceId: (id: string) => void;
  setDeviceName: (name: string) => void;
  setLocalIp: (ip: string) => void;
  setPort: (port: number) => void;
  setServerRunning: (running: boolean) => void;
  setOnWifi: (onWifi: boolean) => void;
  reset: () => void;
}

const generateDeviceName = () => `FileSync-${uuidv4().split('-')[0]}`;

export const useDeviceStore = create<DeviceStore>((set) => ({
  deviceId: uuidv4(),
  deviceName: generateDeviceName(),
  localIp: null,
  port: 5555,
  isServerRunning: false,
  isOnWifi: false,

  setDeviceId: (id: string) => set({ deviceId: id }),
  setDeviceName: (name: string) => set({ deviceName: name }),
  setLocalIp: (ip: string) => set({ localIp: ip }),
  setPort: (port: number) => set({ port }),
  setServerRunning: (running: boolean) => set({ isServerRunning: running }),
  setOnWifi: (onWifi: boolean) => set({ isOnWifi: onWifi }),

  reset: () => set({
    deviceId: uuidv4(),
    deviceName: generateDeviceName(),
    localIp: null,
    port: 5555,
    isServerRunning: false,
    isOnWifi: false,
  }),
}));

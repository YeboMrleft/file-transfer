import { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useDeviceStore } from '@/store/deviceStore';
import { NetworkService } from '@/services/networkService';
import { LocalServerManager } from '@/services/localServer';

export default function HomeScreen() {
  const deviceStore = useDeviceStore();
  const [qrValue, setQrValue] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    initializeDevice();
  }, []);

  const initializeDevice = async () => {
    setIsConnecting(true);
    try {
      // Check WiFi connection
      const isWifi = await NetworkService.checkWifiConnection();
      deviceStore.setOnWifi(isWifi);

      if (isWifi) {
        // Get local IP
        const ip = await NetworkService.getLocalIpAddress();
        if (ip) {
          deviceStore.setLocalIp(ip);

          // Generate QR code value
          const qrData = NetworkService.generateQRCodeValue(
            ip,
            deviceStore.port,
            deviceStore.deviceName,
          );
          setQrValue(qrData);

          // Start server
          await LocalServerManager.startServer(deviceStore.port);
          deviceStore.setServerRunning(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize device:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleServer = async () => {
    if (deviceStore.isServerRunning) {
      LocalServerManager.stopServer();
      deviceStore.setServerRunning(false);
    } else {
      await initializeDevice();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">FileSync</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>
            Wireless File Transfer
          </ThemedText>
        </ThemedView>

        {/* Status */}
        <ThemedView style={styles.statusBox}>
          <ThemedView style={[styles.statusIndicator, deviceStore.isOnWifi && styles.statusActive]} />
          <ThemedView style={styles.statusContent}>
            <ThemedText type="default" style={styles.statusLabel}>
              {deviceStore.isOnWifi ? 'Connected to WiFi' : 'WiFi Not Connected'}
            </ThemedText>
            {deviceStore.localIp && (
              <ThemedText type="small" style={styles.ipText}>
                IP: {deviceStore.localIp}:{deviceStore.port}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        {/* Device Info */}
        <ThemedView style={styles.infoBox}>
          <ThemedText type="small" style={styles.label}>
            Device Name
          </ThemedText>
          <ThemedText type="default" style={styles.value}>
            {deviceStore.deviceName}
          </ThemedText>
        </ThemedView>

        {/* QR Code */}
        {qrValue && (
          <ThemedView style={styles.qrContainer}>
            <ThemedText type="small" style={styles.qrLabel}>
              Desktop App: Scan QR to Connect
            </ThemedText>
            <View style={styles.qrBox}>
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
            <ThemedText type="small" style={styles.qrHint}>
              Or enter: {deviceStore.localIp}:{deviceStore.port}
            </ThemedText>
          </ThemedView>
        )}

        {/* Server Toggle */}
        <TouchableOpacity
          style={[
            styles.button,
            deviceStore.isServerRunning && styles.buttonActive,
            isConnecting && styles.buttonDisabled,
          ]}
          onPress={toggleServer}
          disabled={isConnecting}
        >
          <ThemedText
            style={[
              styles.buttonText,
              deviceStore.isServerRunning && styles.buttonTextActive,
            ]}
          >
            {isConnecting ? 'Connecting...' : deviceStore.isServerRunning ? 'Server Running' : 'Start Server'}
          </ThemedText>
        </TouchableOpacity>

        {/* Instructions */}
        <ThemedView style={styles.instructions}>
          <ThemedText type="small" style={styles.instructionTitle}>
            How to Send Files:
          </ThemedText>
          <ThemedText type="small" style={styles.instructionText}>
            1. Open FileSync Desktop App on your computer
          </ThemedText>
          <ThemedText type="small" style={styles.instructionText}>
            2. Scan this device's QR code
          </ThemedText>
          <ThemedText type="small" style={styles.instructionText}>
            3. Select files and send
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    alignSelf: 'stretch',
  },
  header: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: Spacing.one,
    opacity: 0.7,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(100, 200, 100, 0.1)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  statusActive: {
    backgroundColor: '#4caf50',
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontWeight: '600',
  },
  ipText: {
    marginTop: Spacing.one,
    opacity: 0.7,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  infoBox: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  label: {
    opacity: 0.6,
    marginBottom: Spacing.one,
  },
  value: {
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  qrLabel: {
    opacity: 0.7,
  },
  qrBox: {
    backgroundColor: 'white',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrHint: {
    opacity: 0.6,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
  },
  button: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#f0f0f0',
    marginHorizontal: Spacing.two,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#4caf50',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '600',
    color: '#333',
  },
  buttonTextActive: {
    color: '#fff',
  },
  instructions: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    gap: Spacing.one,
  },
  instructionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  instructionText: {
    opacity: 0.7,
    lineHeight: 20,
  },
});

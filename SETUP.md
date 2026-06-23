# FileSync Setup & Implementation Guide

This guide walks through implementing and testing FileSync.

## Phase 1: Bootstrap the Mobile App (COMPLETE)

✅ Created project structure
✅ Set up state management (Zustand stores)
✅ Built UI screens (Home, Files)
✅ Implemented file management service
✅ Implemented network detection service
✅ Added all dependencies

**Status:** App scaffolding complete. Ready to test core logic.

---

## Phase 2: Implement HTTP Server & Test (NEXT - 1-2 hours)

The most critical piece is implementing the HTTP server in `LocalServerManager` that:
1. Listens for POST requests
2. Receives files as base64
3. Saves them to device storage
4. Updates the UI

### Step 1: Add React Native HTTP Server Library

**Option A: Use built-in Expo capabilities (preferred for now)**

Unfortunately, Expo doesn't include a built-in HTTP server. We have options:

**Option B: Use `react-native-tcp-socket` (recommended)**

```bash
npm install react-native-tcp-socket
```

This lets us create a TCP server that handles HTTP requests manually.

**Option C: Use Expo custom modules** (future)

For production, might need custom native module via EAS Build.

### Step 2: Update `src/services/localServer.ts`

Replace the placeholder with actual HTTP server logic:

```typescript
import TcpSocket from 'react-native-tcp-socket';

export class LocalServerManager {
  private static server: ReturnType<typeof TcpSocket.createServer> | null = null;

  static async startServer(port: number = 5555): Promise<boolean> {
    try {
      await FileManager.initialize();
      
      this.server = TcpSocket.createServer((socket) => {
        let requestData = '';

        socket.on('data', (data) => {
          requestData += data.toString();

          // Parse HTTP request (simplified)
          if (requestData.includes('\r\n\r\n')) {
            // Extract boundary for multipart
            const boundaryMatch = requestData.match(/boundary=([^\r\n]+)/);
            if (boundaryMatch) {
              const boundary = boundaryMatch[1];
              // Parse multipart form data
              // Extract file and metadata
              // Call handleFileUpload()
            }
            
            // Send HTTP response
            socket.write('HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n');
            socket.write(JSON.stringify({ success: true }));
            socket.destroy();
          }
        });

        socket.on('error', (err) => {
          console.error('Socket error:', err);
        });
      });

      this.server.listen(port);
      this.isRunning = true;
      console.log(`FileSync server running on port ${port}`);
      return true;
    } catch (error) {
      console.error('Failed to start server:', error);
      return false;
    }
  }

  static stopServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.isRunning = false;
  }
}
```

### Step 3: Add QR Code Library

```bash
npm install react-native-qrcode-svg
```

### Step 4: Render QR Code in Home Screen

Update `src/app/index.tsx`:

```typescript
import QRCode from 'react-native-qrcode-svg';

// In the JSX, replace the placeholder:
{qrValue && (
  <ThemedView style={styles.qrContainer}>
    <ThemedText type="small" style={styles.qrLabel}>
      Desktop App: Scan QR to Connect
    </ThemedText>
    <QRCode
      value={qrValue}
      size={200}
      backgroundColor="white"
      color="black"
    />
  </ThemedView>
)}
```

### Step 5: Test on Real Device

1. **Android Device/Emulator:**
   ```bash
   npm run android
   ```

2. **iOS Simulator:**
   ```bash
   npm run ios
   ```

3. **Expo Go (easiest to start):**
   ```bash
   npm start
   # Scan QR code with phone camera to open in Expo Go
   ```

4. **Check Home Screen:**
   - Device name appears ✓
   - IP address shows ✓
   - QR code displays ✓
   - Server button works ✓

5. **Check Files Screen:**
   - Empty state message ✓
   - Refresh works ✓

### Step 6: Manual Test File Upload

Since we don't have desktop app yet, test with `curl`:

```bash
# From your desktop on same WiFi:
curl -X POST http://192.168.1.100:5555/upload \
  -F "file=@/path/to/test.txt" \
  -F "metadata={\"name\":\"test.txt\",\"type\":\"text/plain\",\"size\":100}"
```

If successful:
- File appears in Files screen
- File is saved to device storage
- Can be deleted from UI

---

## Phase 3: Build Desktop Web App (2-3 hours)

Create `web-app/` directory:

```bash
cd ..
npm create vite@latest web-app -- --template react-ts
cd web-app
npm install
```

### Core Files to Create

**`web-app/src/services/deviceScanner.ts`** - mDNS discovery
```typescript
export class DeviceScanner {
  static async scanForDevices(): Promise<Device[]> {
    // Use browser-based mDNS or manual IP range scan
    // Return list of FileSync devices found
  }
}
```

**`web-app/src/services/fileTransfer.ts`** - Upload files
```typescript
export class FileTransfer {
  static async sendFile(
    deviceIp: string,
    devicePort: number,
    file: File
  ): Promise<TransferResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify({
      name: file.name,
      type: file.type,
      size: file.size,
    }));

    const response = await fetch(
      `http://${deviceIp}:${devicePort}/upload`,
      { method: 'POST', body: formData }
    );

    return response.json();
  }
}
```

**`web-app/src/pages/Main.tsx`** - UI
- Device discovery button
- List of available devices
- Drag-drop file upload
- Progress indicator

---

## Phase 4: Polish & Deploy (after MVP works)

- [ ] Desktop native app (Electron)
- [ ] Error handling and retry logic
- [ ] Folder sync
- [ ] Connection history
- [ ] Rate limiting
- [ ] File encryption
- [ ] Premium tier

---

## Timeline Estimate

| Phase | Time | Status |
|-------|------|--------|
| Mobile scaffolding | 2h | ✅ Done |
| HTTP server + QR | 2h | ⏳ Next |
| Testing on device | 1h | ⏳ Next |
| Desktop web app | 3h | 🔲 After |
| Polish & features | 2-3h | 🔲 Later |

---

## Troubleshooting Common Issues

### "Module not found: react-native-tcp-socket"
```bash
npm install react-native-tcp-socket
npm install --save-dev @types/react-native-tcp-socket
```

### App crashes on start
- Check console output
- Verify imports are correct
- Make sure all dependencies are installed

### QR code doesn't render
- Verify `react-native-qrcode-svg` is installed
- Check that `qrValue` is not empty
- Test with static string first

### Server doesn't start
- Check WiFi permission in Android/iOS settings
- Verify port 5555 isn't blocked
- Add port forwarding if behind firewall

### Files not saving
- Check device storage permissions
- Verify FileSync directory was created
- Check console for file system errors

---

## Next Commands

```bash
# Install HTTP server library
npm install react-native-tcp-socket

# Install QR code library
npm install react-native-qrcode-svg

# Start development
npm start

# Run on Android
npm run android
```

---

## Key Files to Complete

1. **`src/services/localServer.ts`** - HTTP server implementation
2. **`src/app/index.tsx`** - Add QR code rendering
3. **`web-app/`** - (New) Desktop web app
4. **`web-app/src/services/fileTransfer.ts`** - File upload logic

---

That's it! Once HTTP server + QR + desktop app are done, FileSync will be fully functional.

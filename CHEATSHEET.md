# FileSync Developer Cheatsheet

Quick reference for common tasks.

---

## 🚀 Getting Started

```bash
cd C:\Users\Administrator\file-transfer
npm install     # (already done)
npm start       # Start development
npm run android # Test on Android
npm run ios     # Test on iOS
npm run web     # Test on web
```

---

## 📱 UI/UX

### Home Screen (`src/app/index.tsx`)
- Shows device name
- Shows IP address + port
- Displays QR code
- Server on/off toggle
- WiFi status indicator

### Files Screen (`src/app/explore.tsx`)
- Lists received files
- Delete button per file
- Empty state message
- File size and date

---

## 🔧 State Management (Zustand)

### Add a File to List
```typescript
import { useFileStore } from '@/store/fileStore';

const addFile = useFileStore.getState().addFile;
addFile({
  id: 'uuid',
  name: 'file.txt',
  size: 1024,
  type: 'text/plain',
  receivedAt: Date.now(),
  path: '/path/to/file',
});
```

### Delete a File
```typescript
const removeFile = useFileStore.getState().removeFile;
removeFile('file-id');
```

### Get All Files
```typescript
const files = useFileStore((state) => state.files);
```

### Update Device Info
```typescript
import { useDeviceStore } from '@/store/deviceStore';

const deviceStore = useDeviceStore();
deviceStore.setLocalIp('192.168.1.100');
deviceStore.setServerRunning(true);
```

---

## 📁 File Operations

### Save File
```typescript
import { FileManager } from '@/services/fileManager';

const result = await FileManager.saveFile('filename.txt', base64Data);
// Returns: { id: 'uuid', path: '/path/to/file' }
```

### Delete File
```typescript
await FileManager.deleteFile('/path/to/file');
```

### Format File Size
```typescript
const sizeStr = FileManager.formatFileSize(1048576); // "1 MB"
```

### List All Files
```typescript
const files = await FileManager.getAllFiles();
```

---

## 🌐 Network Operations

### Get Local IP
```typescript
import { NetworkService } from '@/services/networkService';

const ip = await NetworkService.getLocalIpAddress();
```

### Check WiFi Connection
```typescript
const isWifi = await NetworkService.checkWifiConnection();
```

### Generate QR Code
```typescript
const qrValue = NetworkService.generateQRCodeValue(ip, port, deviceName);
// Returns JSON string
```

### Parse QR Code
```typescript
const data = NetworkService.parseQRCodeValue(qrValue);
// Returns: { type, ip, port, name }
```

---

## 🖥️ HTTP Server

### Start Server
```typescript
import { LocalServerManager } from '@/services/localServer';

await LocalServerManager.startServer(5555);
```

### Stop Server
```typescript
LocalServerManager.stopServer();
```

### Check if Running
```typescript
const isRunning = LocalServerManager.isServerRunning();
```

### Get Server Info
```typescript
const info = LocalServerManager.getServerInfo();
// Returns: { port, running, connections }
```

### Server Endpoints
```
POST /upload           - Receive file
GET /                  - Health check
OPTIONS /              - CORS preflight
```

---

## 🔍 Debugging

### View Console Logs
- Look for `[FileSync]` prefix
- Mobile: Expo app output
- Desktop: Terminal output

### Common Logs
```
[FileSync] Server listening on port 5555
[FileSync] New connection: uuid
[FileSync] POST /upload
[FileSync] File saved: filename (size bytes)
[FileSync] Connection closed: uuid
[FileSync] Server stopped
```

### Test Server Health
```bash
curl http://192.168.1.100:5555/
# Expected: {"status":"ok","device":"FileSync"}
```

### Send Test File
```bash
curl -X POST http://192.168.1.100:5555/upload \
  -F "file=@test.txt"
```

---

## 📋 Common Tasks

### Add New Screen
1. Create `src/app/newscreen.tsx`
2. Export React component
3. Auto-added to navigation via Expo Router

### Add New Service
1. Create `src/services/newservice.ts`
2. Export utility functions
3. Import in screens/other services

### Add New Store
1. Create `src/store/newstore.ts`
2. Use Zustand `create()` hook
3. Export custom hook

### Style a Component
1. Use `ThemedView` and `ThemedText`
2. Add `StyleSheet.create()` at bottom
3. Reference from `styles` object

---

## 🎨 Theme & Styling

### Colors (Light Mode)
- Background: `#FFFFFF`
- Text: `#000000`
- Accent: `#208AEF` (blue)
- Success: `#4CAF50` (green)

### Spacing Constants
```typescript
import { Spacing } from '@/constants/theme';
Spacing.one   // 4px
Spacing.two   // 8px
Spacing.three // 12px
Spacing.four  // 16px
Spacing.five  // 20px
Spacing.six   // 24px
```

### Create Styled View
```typescript
<ThemedView style={styles.container}>
  <ThemedText type="title">Hello</ThemedText>
</ThemedView>
```

---

## 🧪 Testing

### Test File Upload
```bash
# Windows PowerShell
curl -X POST http://192.168.1.X:5555/upload `
  -F "file=@C:\path\to\file.txt"

# Bash/Linux
curl -X POST http://192.168.1.X:5555/upload \
  -F "file=@/path/to/file.txt"
```

### Test Different File Types
```bash
# Text
curl -X POST http://192.168.1.X:5555/upload -F "file=@test.txt"

# Image
curl -X POST http://192.168.1.X:5555/upload -F "file=@photo.jpg"

# PDF
curl -X POST http://192.168.1.X:5555/upload -F "file=@doc.pdf"

# Large file
curl -X POST http://192.168.1.X:5555/upload -F "file=@video.mp4"
```

### Expected Response
```json
{
  "success": true,
  "id": "uuid-here",
  "message": "File received successfully"
}
```

---

## 🚨 Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 200 | Success | File uploaded ✓ |
| 400 | Bad Request | Check multipart format |
| 404 | Not Found | Wrong endpoint |
| 500 | Internal Error | Check server logs |

---

## 📦 Dependencies Quick Reference

| Package | Version | Use |
|---------|---------|-----|
| `expo` | ~56.0.12 | React Native runtime |
| `react-native` | 0.85.3 | Mobile framework |
| `zustand` | ^4.4.1 | State management |
| `uuid` | ^9.0.0 | ID generation |
| `expo-file-system` | ~56.0.6 | File I/O |
| `expo-network` | ~56.0.5 | Network detection |
| `react-native-tcp-socket` | ^6.4.1 | HTTP server |
| `react-native-qrcode-svg` | ^6.3.21 | QR code |

---

## 🔗 Key Files

| File | Purpose |
|------|---------|
| `src/app/index.tsx` | Home screen |
| `src/app/explore.tsx` | Files screen |
| `src/services/localServer.ts` | HTTP server |
| `src/services/fileManager.ts` | File I/O |
| `src/store/fileStore.ts` | File state |
| `src/store/deviceStore.ts` | Device state |
| `package.json` | Dependencies |
| `app.json` | App config |

---

## 📚 Documentation

- **QUICKSTART.md** — 5 minute setup
- **TESTING.md** — Detailed testing
- **SETUP.md** — Phase 2 & 3
- **ARCHITECTURE.md** — System design
- **IMPLEMENTATION_COMPLETE.md** — What was built

---

## ⚡ Pro Tips

1. **Use exact IP address** from app, not hostname
2. **Same WiFi network** required for both devices
3. **Server must be running** (green button) before upload
4. **Check logs** for debugging: `[FileSync]` prefix
5. **Test with small files** first (< 1MB)
6. **Clear terminal** output when testing: `clear` (Mac/Linux) or `cls` (Windows)

---

## 🎯 Quick Workflow

```
1. npm start
2. Open app on device
3. Note IP address
4. Tap "Start Server" (wait 1 sec)
5. From PC: curl -X POST http://IP:5555/upload -F "file=@test.txt"
6. Check Files tab on mobile
7. File appears → Success! ✓
```

---

## 🐛 Quick Fixes

**App won't start:**
```bash
npm install
npm start
```

**Server won't start:**
- Check WiFi is enabled
- Check port 5555 is free
- Check permissions in app settings

**File won't transfer:**
- Verify same WiFi network
- Verify IP is reachable: `ping IP`
- Try smaller file first
- Check server is running (green)

**QR code missing:**
- Make sure on WiFi (needs IP)
- Restart app
- Check IP is not null

---

Done! Bookmark this page for quick reference. 🚀

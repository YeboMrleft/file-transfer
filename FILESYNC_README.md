# FileSync - Instant Wireless File Transfer

Transfer files between devices wirelessly, without cables. Instant, private, and simple.

## Vision

FileSync replaces USB cable transfers with instant wireless file transfer. Send files from your desktop PC to your mobile device (or vice versa) on the same WiFi network—no cloud, no accounts, just instant transfer.

## What's Been Built (MVP Phase)

✅ **Mobile App Structure**
- Home screen with device info and WiFi status
- QR code data generation for desktop scanning
- Files screen showing received files
- File storage and deletion management

✅ **State Management**
- Zustand stores for files and device info
- Clean, hook-based architecture

✅ **Services**
- FileManager: Save/read/delete files from device storage
- NetworkService: Detect WiFi, get local IP, generate QR codes
- LocalServerManager: Handle file uploads and storage

✅ **Project Config**
- Expo Router for navigation
- TypeScript setup
- All dependencies added (uuid, zustand, expo-network, expo-file-system)

## Architecture

```
FileSync Mobile
├── Home Screen
│   ├── Device Name
│   ├── IP Address + Port
│   ├── QR Code (for desktop scanning)
│   └── Server Status Toggle
├── Files Screen
│   ├── List of received files
│   └── Delete/manage files
└── Services Layer
    ├── FileManager (I/O)
    ├── NetworkService (WiFi detection)
    └── LocalServerManager (HTTP server)
```

## Getting Started

```bash
cd C:\Users\Administrator\file-transfer
npm install
npm start
```

**Run on device:**
```bash
npm run android    # or iOS
```

## What Still Needs to be Done

### Phase 1 - Complete the MVP

1. **Implement HTTP Server** (LocalServerManager)
   - Use `react-native-tcp-socket` or create native module
   - Listen on port 5555
   - Handle multipart file uploads
   - Return proper responses

2. **Add QR Code Rendering**
   - Install `react-native-qrcode-svg`
   - Render actual QR in Home screen
   - Make it large and scannable

3. **Test Mobile App**
   - Verify device detection
   - Check file saving
   - Test file listing and deletion

### Phase 2 - Desktop Web App

1. **Create web-app directory** with Vite + React
2. **Device Discovery**
   - Implement mDNS scanning for FileSync devices
   - Display available devices with IPs
3. **File Upload Interface**
   - Drag-drop file zone
   - Select files to send
   - Show transfer progress
4. **QR Scanner** (optional for quick pairing)

### Phase 3 - Polish & Deploy

1. Desktop native app (Electron) for better UX
2. Folder sync support
3. Connection history
4. File version history
5. Premium features (cloud backup, team support)

## File Structure

```
file-transfer/
├── src/
│   ├── app/
│   │   ├── index.tsx           # Home screen ✅
│   │   ├── explore.tsx         # Files screen ✅
│   │   └── _layout.tsx         # Navigation
│   ├── services/
│   │   ├── fileManager.ts      # ✅ Ready
│   │   ├── networkService.ts   # ✅ Ready
│   │   └── localServer.ts      # ⚠️ Needs HTTP server
│   ├── store/
│   │   ├── fileStore.ts        # ✅ Ready
│   │   └── deviceStore.ts      # ✅ Ready
│   └── components/             # UI components
├── ARCHITECTURE.md             # Full design docs
├── package.json               # Dependencies
└── app.json                   # Expo config
```

## Key Files to Modify

**Next Priority:** `src/services/localServer.ts`
- Replace placeholder comments with actual HTTP server code
- Use react-native-tcp-socket or native implementation
- Test file reception and storage

## Testing Checklist

- [ ] App loads without errors
- [ ] Home screen shows device name
- [ ] WiFi status detected correctly
- [ ] IP address displays (when on WiFi)
- [ ] Server toggle works
- [ ] QR code renders
- [ ] Files screen shows empty state initially
- [ ] Files can be deleted from list

## Next Steps (in order)

1. Implement the HTTP server in `LocalServerManager`
2. Add `react-native-qrcode-svg` and render QR code
3. Test file upload on real device or emulator
4. Build desktop web app (scaffolding ready)
5. Implement device discovery and file upload in web app

## Dependencies Overview

```json
{
  "expo": "Baseline for React Native + tooling",
  "expo-file-system": "Save/read files on device",
  "expo-network": "Detect WiFi and get local IP",
  "uuid": "Generate unique IDs for files",
  "zustand": "Simple state management",
  "react-native": "Mobile framework"
}
```

## Revenue Model (Future)

- **Free tier:** 5 files/day, 100MB/file limit
- **Premium ($2.99/month):** Unlimited files, faster transfer, desktop auto-sync
- **Business ($9.99/month):** Team support, sync folders, analytics

## Questions?

Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design and data flows.

# FileSync Architecture

## Overview
Instant wireless file transfer between devices on the same WiFi network. Files bypass the cloud and transfer locally for speed and privacy.

## Tech Stack
- **Mobile:** React Native + Expo
- **Desktop:** React web app (Vite)
- **Transfer Protocol:** WebSocket + HTTP multipart
- **Discovery:** mDNS (Bonjour) for device discovery
- **File Storage:** Expo FileSystem API (mobile), native file system (desktop)

## System Design

### Mobile App (Sender/Receiver)
```
┌─────────────────────────────────────┐
│      FileSync Mobile App            │
├─────────────────────────────────────┤
│ UI Layer                            │
│ - Home (QR code, IP display)        │
│ - File List (received files)        │
│ - Settings                          │
├─────────────────────────────────────┤
│ Core Services                       │
│ - LocalServer (WebSocket listener)  │
│ - FileManager (save/read files)     │
│ - NetworkDiscovery (mDNS)           │
│ - QRCode Generator                  │
├─────────────────────────────────────┤
│ Platform: Android/iOS               │
└─────────────────────────────────────┘
```

### Desktop Web App (Sender)
```
┌─────────────────────────────────────┐
│     FileSync Web App                │
├─────────────────────────────────────┤
│ UI Layer                            │
│ - Device Discovery (scan WiFi)      │
│ - File Picker + Drag-Drop           │
│ - Transfer Progress                 │
├─────────────────────────────────────┤
│ Core Services                       │
│ - DeviceScanner (mDNS)              │
│ - FileTransfer (HTTP POST)          │
│ - ConnectionManager                 │
├─────────────────────────────────────┤
│ Platform: Windows/Mac/Linux         │
└─────────────────────────────────────┘
```

## Data Flow

### Sending Files (Desktop → Mobile)
```
1. Desktop app scans WiFi for FileSync devices (mDNS)
2. User selects mobile device from list
3. User selects file(s) to send
4. Desktop opens WebSocket connection to mobile
5. Desktop sends file metadata + file chunks
6. Mobile receives chunks, saves to FileSystem
7. Confirmation sent back
```

### Connection Methods
- **QR Code:** Desktop shows IP:PORT, mobile scans with camera
- **Manual IP:** User enters device IP manually (fallback)
- **mDNS Discovery:** Auto-find devices named "FileSync-{UUID}"

## API Endpoints

### Mobile WebSocket Server
```
ws://[mobile-ip]:5555

Messages:
- FILE_START: { id, name, size, type }
- FILE_CHUNK: { id, chunk: base64 }
- FILE_END: { id, checksum }
- ACK: { id }
- ERROR: { message }
```

### Desktop → Mobile (HTTP POST)
```
POST http://[mobile-ip]:5555/upload
Content-Type: multipart/form-data

Body:
- file: binary
- metadata: { name, type, size }
```

## File Storage

### Mobile
- **Path:** `/Documents/FileSync/` (Expo FileSystem)
- **Structure:** `FileSync/[date-folders]/[filename]`
- **Limit:** Device storage available
- **Cleanup:** User manual delete (or auto-cleanup after 7 days - premium)

### Desktop
- **Download Folder:** `~/Downloads/FileSync/`
- **Or:** User selectable

## Security
- **Privacy:** Local WiFi only, no cloud
- **Encryption:** Optional TLS on WebSocket (future)
- **Auth:** Device UUID pairing (optional)
- **Rate Limiting:** 10 MB/s per device (configurable)

## Features (MVP → Roadmap)

### MVP (Week 1-2)
- [x] Local WiFi file transfer
- [x] QR code device pairing
- [x] File list on mobile
- [x] Save to device
- [x] Basic desktop web app

### Phase 2
- [ ] Drag-drop file upload
- [ ] Transfer progress bars
- [ ] Multiple file support
- [ ] Folder sync
- [ ] Desktop native app (Electron)

### Phase 3 (Premium)
- [ ] Cloud backup integration
- [ ] Auto-sync folders
- [ ] File version history
- [ ] Team/multi-device support

## Dependencies

### Mobile (Expo)
```json
{
  "expo": "^56.0.0",
  "react-native": "^0.76.0",
  "expo-file-system": "*",
  "react-native-tcp-socket": "*",
  "react-native-qrcode": "*",
  "zustand": "*"
}
```

### Desktop (Vite + React)
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.0",
  "axios": "*",
  "bonjour": "*",
  "qrcode.react": "*"
}
```

## Deployment
- **Mobile:** Expo Go (dev), EAS Build → APK/IPA
- **Desktop:** Web app at `filesync.app` or Electron desktop app
- **Revenue:** Premium tier on mobile app

# FileSync Quick Start Guide

**Status:** ✅ HTTP Server + QR Code Ready to Test

---

## 🚀 Start the App (2 minutes)

```bash
cd C:\Users\Administrator\file-transfer
npm start
```

You'll see:
```
[FileSync] Server listening on port 5555
Expo app ready at http://localhost:19000
Scan the QR code to open in Expo Go
```

---

## 📱 Open on Mobile (Choose One)

### Option A: Android Emulator
```bash
# Press 'a' in terminal
# Or run:
npm run android
```

### Option B: iOS Simulator
```bash
# Press 'i' in terminal
# Or run:
npm run ios
```

### Option C: Expo Go (Easiest - requires phone)
1. Install Expo Go app on your phone
2. Scan the QR code shown in terminal
3. App opens in Expo Go

---

## ✅ Verify Mobile App Works

**Home Screen Should Show:**
- Device name (e.g., "FileSync-a1b2c3d4")
- "Connected to WiFi"
- IP address with port (e.g., "192.168.1.100:5555")
- Scannable QR code
- "Start Server" button

**Click "Start Server":**
- Button turns green
- Text changes to "Server Running"
- Console shows: `[FileSync] Server listening on port 5555`

**Files Screen:**
- Shows "No files received yet"
- Empty state message visible

---

## 📤 Test File Transfer (5 minutes)

### Step 1: Note the IP Address
From the Home screen, write down the IP. Example: `192.168.1.100`

### Step 2: Send a Test File from Desktop

Make sure PC and mobile are on **same WiFi**.

**Using PowerShell:**
```powershell
# Replace 192.168.1.100 with your device IP
curl -X POST http://192.168.1.100:5555/upload `
  -F "file=@C:\Users\$env:USERNAME\Documents\test.txt"
```

**Using bash/curl:**
```bash
# Create test file
echo "Hello FileSync" > test.txt

# Send to device (replace IP)
curl -X POST http://192.168.1.100:5555/upload \
  -F "file=@test.txt"
```

### Step 3: Check Mobile App

**Files Screen Should Show:**
- File appears in list
- Shows filename and size
- Shows date received
- Can delete with × button

---

## 🎯 What You've Now Built

| Component | Status | What It Does |
|-----------|--------|-------------|
| Mobile App | ✅ Ready | Receives files over WiFi |
| HTTP Server | ✅ Ready | Listens on port 5555 |
| QR Code | ✅ Ready | Shows device info |
| File Storage | ✅ Ready | Saves to device |
| File List UI | ✅ Ready | Shows received files |

---

## 📖 Next Steps

### Short Term (Today)
1. Test file transfer works ✓
2. Try different file types (txt, jpg, pdf)
3. Test deleting files

### Medium Term (This Week)
1. Build desktop web app
2. Implement device discovery
3. Add drag-drop upload UI

### Long Term (Next Week)
1. Polish and testing
2. Performance optimization
3. Deploy to app stores

---

## 🔧 Troubleshooting

### Issue: "WiFi Not Connected"
**Solution:** Device needs to be on WiFi
- Enable WiFi on phone/tablet
- Connect to same network as PC

### Issue: Server doesn't start
**Solution:** Check permissions
- On Android: Go to Settings → Apps → FileSync → Permissions → Allow Network
- On iOS: Settings → FileSync → Wi-Fi (turn On)

### Issue: File not received
**Solution:** Check network connection
```bash
# From PC, verify you can reach device
ping 192.168.1.100

# Check server is running
curl http://192.168.1.100:5555/
# Should return: {"status":"ok","device":"FileSync"}
```

### Issue: App crashes on startup
**Solution:** Reinstall dependencies
```bash
npm install
npm start
```

---

## 📊 Expected Results

### Successful Test
```
✅ Device shows IP: 192.168.1.100:5555
✅ QR code displays
✅ Server starts (green button)
✅ File sent via curl: 200 OK
✅ File appears in Files screen
✅ File shows: "test.txt · 100 B · 6/23/2026"
✅ Can delete file
```

### Console Output (When Working)
```
[FileSync] Server listening on port 5555
[FileSync] New connection: a1b2c3d4-...
[FileSync] POST /upload
[FileSync] File saved: test.txt (100 bytes)
[FileSync] Connection closed: a1b2c3d4-...
```

---

## 🎓 Learning the Code

### Key Files to Review

**Mobile App Logic:**
- `src/app/index.tsx` — Home screen with QR code
- `src/app/explore.tsx` — Files list screen

**Server Implementation:**
- `src/services/localServer.ts` — HTTP server (just built)
- `src/services/httpServerImpl.ts` — HTTP parsing utilities

**State Management:**
- `src/store/fileStore.ts` — File list state
- `src/store/deviceStore.ts` — Device info state

**File Handling:**
- `src/services/fileManager.ts` — Save/read/delete files

---

## 🚢 Deploy to Real Device

### Android (via APK)
```bash
eas build --platform android --local
# Then install APK on device
```

### iOS (via IPA)
```bash
# Requires Apple Developer account
eas build --platform ios --local
```

---

## 💡 Tips

- **Tip 1:** Use same WiFi for both PC and mobile
- **Tip 2:** Note the exact IP address shown in app
- **Tip 3:** Test with small files first (< 1MB)
- **Tip 4:** Check browser console if curl doesn't work
- **Tip 5:** Server must be running (green button)

---

## 📚 Full Documentation

- `ARCHITECTURE.md` — System design
- `IMPLEMENTATION_COMPLETE.md` — What was built
- `TESTING.md` — Detailed testing guide
- `SETUP.md` — Development guide

---

## ✨ That's It!

You now have a working wireless file transfer system.

**Next:** Build the desktop web app to make it user-friendly (follow instructions in SETUP.md Phase 2).

---

**Questions?** Check the relevant docs above or review the console output for errors.

Good luck! 🚀

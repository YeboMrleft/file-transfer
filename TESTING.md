# FileSync Testing Guide

## Testing the Mobile App

### 1. Run the App

```bash
cd C:\Users\Administrator\file-transfer
npm start
```

**Choose platform:**
- Android: Press `a`
- iOS: Press `i`
- Expo Go: Scan QR code with phone camera

### 2. Verify Mobile App Works

**Home Screen:**
- ✅ Device name displays (e.g., "FileSync-a1b2c3d4")
- ✅ WiFi status shows "Connected to WiFi"
- ✅ IP address displays (e.g., "192.168.1.100:5555")
- ✅ QR code is scannable
- ✅ "Start Server" button works (turns green)

**Files Screen:**
- ✅ Shows "No files received yet"
- ✅ Empty state message visible
- ✅ Can switch between tabs

### 3. Test HTTP Server (on same WiFi as device)

From your PC, send a test file to the mobile device:

**Using PowerShell:**

```powershell
$filePath = "C:\path\to\test.txt"
$ipAddress = "192.168.1.100"  # Replace with device IP from app
$port = "5555"

# Create form data
$boundary = [System.Guid]::NewGuid().ToString()
$uri = "http://$ipAddress:$port/upload"

# Read file as base64
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$base64 = [System.Convert]::ToBase64String($fileBytes)

# Create multipart body
$body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="test.txt"
Content-Type: text/plain

[file content here in binary]
--$boundary
Content-Disposition: form-data; name="metadata"

{"name":"test.txt","type":"text/plain","size":${fileBytes.Length}}
--$boundary--
"@

# Send request
Invoke-WebRequest -Uri $uri -Method POST -ContentType "multipart/form-data; boundary=$boundary" -Body $body
```

**Using curl (simpler):**

```bash
# Get file path and device IP first
curl -X POST http://192.168.1.100:5555/upload \
  -F "file=@C:\Users\Administrator\Documents\test.txt" \
  -F 'metadata={"name":"test.txt","type":"text/plain","size":100}'
```

### 4. Verify File Reception

After sending a file:
1. Check mobile app **Files** tab
2. File should appear in the list
3. File size and date should display
4. Should be able to delete file (tap × button)

### 5. Test Different File Types

Send various file types to test:

```bash
# Text file
curl -X POST http://192.168.1.X:5555/upload \
  -F "file=@test.txt"

# Image
curl -X POST http://192.168.1.X:5555/upload \
  -F "file=@photo.jpg"

# PDF
curl -X POST http://192.168.1.X:5555/upload \
  -F "file=@document.pdf"

# Large file (test size limits)
curl -X POST http://192.168.1.X:5555/upload \
  -F "file=@large-video.mp4"
```

### 6. Test Server Status

Check server health:

```bash
curl http://192.168.1.X:5555/
# Expected response: {"status":"ok","device":"FileSync"}
```

## Debugging

### Server Not Starting
- Check WiFi is enabled on device
- Verify port 5555 isn't blocked by firewall
- Check Android/iOS permissions for network access
- Look at console output for error messages

### File Not Saving
- Check file permissions in app settings
- Verify device has storage space
- Look for errors in app console
- Try smaller file first

### QR Code Not Rendering
- Ensure `react-native-qrcode-svg` is installed
- Check that `qrValue` is not empty
- Try reloading the app

### Connection Issues
- Ensure PC and mobile are on **same WiFi network**
- Not on VPN (VPN can isolate networks)
- Check IP address is reachable: `ping 192.168.1.X`
- Try manual IP entry instead of QR code

## Expected Console Output

**When app starts:**
```
[FileSync] Server listening on port 5555
```

**When file is received:**
```
[FileSync] New connection: a1b2c3d4-...
[FileSync] POST /upload
[FileSync] File saved: test.txt (1024 bytes)
[FileSync] Connection closed: a1b2c3d4-...
```

**When server stops:**
```
[FileSync] Server stopped
```

## Test Checklist

- [ ] App launches without errors
- [ ] Home screen shows device info
- [ ] QR code displays
- [ ] Server starts on button tap
- [ ] Server status changes to green/running
- [ ] Files tab is accessible
- [ ] Empty state message shows
- [ ] Can send file via curl/PostMan
- [ ] File appears in Files list
- [ ] File details show (name, size, date)
- [ ] Can delete file from list
- [ ] Server stops correctly

## Manual Test with Postman

1. Open Postman
2. Create POST request to `http://192.168.1.X:5555/upload`
3. Set up multipart form:
   - Key: `file` → Select your test file
   - Key: `metadata` → JSON string with file info
4. Send request
5. Check response and mobile app

## Stress Testing (Optional)

```bash
# Send 10 files rapidly
for i in {1..10}; do
  curl -X POST http://192.168.1.X:5555/upload \
    -F "file=@test-$i.txt" &
done
wait

# Check that all files appear in app
```

## Performance Notes

- Local WiFi transfers should be 10-100 MB/s
- Check network via: `iperf3` or similar tools
- Monitor device CPU/memory while transferring
- Test with files up to 500MB

---

Once all tests pass, the MVP is ready for the desktop web app!

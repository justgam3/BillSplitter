# Quick Testing Guide (Physical Device Only)

## 📱 Test with Your Phone (No Simulator Needed!)

### Prerequisites
- Your phone (Android or iPhone)
- Computer and phone on **same WiFi network**

---

## Step 1: Install Expo Go App

**Android:**
- Open Play Store
- Search "Expo Go"
- Install

**iPhone:**
- Open App Store
- Search "Expo Go"
- Install

---

## Step 2: Start Backend API

Open a terminal and run:

```bash
cd C:\new-projects\BillSplitter\backend
dotnet run --project src/BillSplitter.API
```

**Wait for this message:**
```
Now listening on: http://localhost:5000
```

✅ Keep this terminal open!

---

## Step 3: Start Frontend

Open a **new terminal** and run:

```bash
cd C:\new-projects\BillSplitter\frontend
npm start
```

**You'll see:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go
```

✅ Keep this terminal open too!

---

## Step 4: Open App on Your Phone

### Android:
1. Open **Expo Go** app
2. Tap **"Scan QR code"**
3. Scan the QR code from your terminal
4. Wait for app to load (may take 1-2 minutes first time)

### iPhone:
1. Open **Camera** app (not Expo Go)
2. Point at QR code
3. Tap the notification that appears
4. Opens in Expo Go automatically

---

## Step 5: Test the App!

Now you can test everything:

1. **Sign Up** → Enter email and strong password
2. **Get Code** → Check backend terminal for 6-digit code
3. **Verify** → Enter the code
4. **See Main Screen** → Your email should appear!

---

## 🐛 Troubleshooting

### App won't connect to backend

**Error:** "Network Error" or timeout

**Fix:**
```bash
# 1. Check your computer's IP hasn't changed
ipconfig | grep -i "ipv4"

# 2. If IP changed, update .env file
cd frontend
nano .env
# Update: API_BASE_URL=http://NEW_IP:5000/api

# 3. Restart Metro (Ctrl+C then npm start)
npm start
```

### Can't scan QR code

**Fix:** Just type the URL manually in Expo Go:
```
exp://172.20.10.13:8081
```

### Phone and computer not on same WiFi

**Fix:**
- Connect both to the same WiFi network
- Restart Metro bundler after reconnecting

### Firewall blocking connection

**Fix (Windows):**
```powershell
# Allow Node through firewall
netsh advfirewall firewall add rule name="Expo Metro" dir=in action=allow program="C:\Program Files\nodejs\node.exe"
```

---

## 🎯 Quick Test Checklist

- [ ] Backend running on port 5000
- [ ] Frontend Metro bundler running
- [ ] Phone and computer on same WiFi
- [ ] Expo Go app installed on phone
- [ ] QR code scanned or URL typed in Expo Go
- [ ] App loaded successfully
- [ ] Can register new user
- [ ] Can see verification code in backend terminal
- [ ] Can verify email
- [ ] Can see user email on main screen

---

## 💡 Pro Tips

1. **Keep terminals open** - Don't close backend or frontend terminals while testing

2. **Check backend logs** - Verification codes appear in backend terminal:
   ```
   Verification code for test@example.com: 123456
   ```

3. **Shake phone** - Opens Expo developer menu for:
   - Reload app
   - Show element inspector
   - Toggle performance monitor

4. **Hot reload works!** - Edit code and see changes instantly (most of the time)

5. **Backend changes need restart** - But frontend changes usually don't

---

## 🌐 Alternative: Test in Web Browser

If phone testing isn't working, you can test in browser:

```bash
# In frontend terminal, press 'w'
# Or run:
npm run web
```

Opens in browser at: `http://localhost:8081`

⚠️ **Note:** Some features may not work perfectly in web (it's a mobile app after all!)

---

## Next Steps After Testing Works

1. ✅ Test all authentication flows
2. ✅ Verify data persists in database
3. ✅ Test logout and re-login
4. ✅ Start building expense management features!

---

**Your app is ready to test on your phone!** 📱✨

No simulators, no Xcode, no Android Studio needed!

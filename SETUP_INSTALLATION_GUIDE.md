# Complete Setup Guide

## Step 1: Install Node.js (REQUIRED FIRST)

This is blocking everything else. You MUST install Node.js before running any commands.

### Windows Installation:
1. Go to https://nodejs.org
2. Click "LTS" (Long Term Support) version - get v20.x
3. Download the **Windows Installer (.msi)**
4. Run the installer
5. Accept all default options
6. Click "Install" 
7. **Restart your computer** (important!)
8. Restart PowerShell completely (close and reopen)

### Verify Installation:
```powershell
# In PowerShell, check these commands work:
node --version    # Should show v20.x.x or similar
npm --version     # Should show 9.x or 10.x
npx --version     # Should show 9.x or 10.x
```

If any of these fail, Node.js wasn't installed correctly. Repeat the installation.

---

## Step 2: Install Mobile App Dependencies

Once Node.js is confirmed working, run this:

```powershell
cd "c:\Users\MINI\Desktop\INO_FITNESS_APP\trainer-app\apps\mobile"

# Install Expo packages
npx expo install expo-router @expo/vector-icons react-native-safe-area-context react-native-screens

# Install all npm dependencies
npm install
```

**Time needed:** 5-10 minutes

**Expected output:** "added X packages" and no errors

---

## Step 3: Start Mobile Dev Server

```powershell
cd "c:\Users\MINI\Desktop\INO_FITNESS_APP\trainer-app\apps\mobile"

# Start Expo
npx expo start
```

You'll see output like:
```
Successfully compiled 6 screens
Press i to open on iOS simulator
Press a to open on Android emulator
Press j to open debugger
Scan QR code with Expo Go app
```

### To Test on Real Device:
1. Download "Expo Go" app from App Store or Google Play
2. Open Expo Go app
3. Scan the QR code shown in terminal
4. App should load in seconds

### To Test on Simulator:
- **iOS:** Have Xcode installed, press `i` in terminal
- **Android:** Have Android Studio installed, press `a` in terminal

---

## Step 4: Install Web App Dependencies

In a **separate** terminal/PowerShell:

```powershell
cd "c:\Users\MINI\Desktop\INO_FITNESS_APP\web-app"

# Install dependencies
npm install
```

---

## Step 5: Start Web Dev Server

```powershell
cd "c:\Users\MINI\Desktop\INO_FITNESS_APP\web-app"

# Start Next.js dev server
npm run dev
```

Visit http://localhost:3000 in your browser to see the web app.

---

## What You Just Built

### Mobile App Features (React Native):
✅ 6 fully styled screens
- Home - Daily workouts & stats
- Reminders - Toggle notifications
- Diet - Meal planning & macros
- Progress - Weekly activity chart
- Coach - AI chat interface
- Profile - User settings

✅ Modern design matching web version
✅ Tab-based navigation
✅ Real-time state management
✅ iOS + Android compatible

### Web App Features (Next.js):
✅ All 6 screens in browser
✅ Tailwind CSS styling
✅ Tab navigation
✅ Interactive components
✅ Production-ready code

---

## Troubleshooting

### "npx command not found"
→ Node.js not installed or not restarted after install
→ Solution: Install Node.js again, restart computer, restart PowerShell

### "Module not found: react-native"
→ npm install didn't complete
→ Solution: Delete node_modules folder and package-lock.json, run npm install again

### "Port 3000 already in use"
→ Another app is using the port
→ Solution: Kill the process or use different port: `npm run dev -- -p 3001`

### Expo QR code not loading
→ Check if phone is on same WiFi as computer
→ Try scanning again
→ Restart Expo: Press `Ctrl+C` in terminal and run `npx expo start` again

---

## Next Steps After Setup

1. **Test locally** - Verify all 6 screens work on mobile and web
2. **Deploy backend** - Follow PRODUCTION_SETUP_GUIDE.md
3. **Build for stores** - Create iOS/Android builds
4. **Submit to stores** - TestFlight + Google Play internal testing
5. **Launch** - Follow LAUNCH_CHECKLIST.md

---

## File Locations

**Mobile App:** `c:\Users\MINI\Desktop\INO_FITNESS_APP\trainer-app\apps\mobile\`
**Web App:** `c:\Users\MINI\Desktop\INO_FITNESS_APP\web-app\`
**Backend:** `c:\Users\MINI\Desktop\INO_FITNESS_APP\backend\`

---

## Quick Command Reference

```powershell
# Check Node.js is installed
node --version

# Mobile development
cd trainer-app/apps/mobile
npx expo start          # Start dev server
npm install             # Install dependencies

# Web development
cd web-app
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production

# Stop any dev server
Ctrl+C
```

**Everything is now ready to run locally!**

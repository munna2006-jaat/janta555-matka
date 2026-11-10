# 📱 GoldMatka Android APK Build & Deployment Guide

Yeh guide aapko **GoldMatka Mobile App** ko ek native Android `.apk` file me convert karne ka step-by-step tareeka batati hai, jisme **Startup Cool Gold Animation** shamil hai.

---

## ✨ Features of the Android App

1. **Cool Animated Startup Splash Screen**:
   - App open hote hi 3D Golden Pot (Matka) + Shimmering Gold Crown float karta hai.
   - Pulsing golden light rings aur glowing floating particles aate hain.
   - Royal Shimmering Text: **"GOLDMATKA"** ke saath sleek progress bar load hoti hai.
   - Smooth transition ke baad main app open hoti hai.
2. **Native Android Feel**:
   - Smooth 60fps gesture scrolling, pull-to-refresh, status bar matching, no browser URL bar.
   - Works on any Android phone (Android 7.0 to Android 15+).
3. **Real-time Live Sync**:
   - Instant bid placement, deposit screenshot upload, bank payout request, and Satta King / Kalyan live results.

---

## 🛠️ Method 1: Using Capacitor (Recommended - 5 Minutes)

Capacitor web app (React + Vite) ko sidha native Android project me convert kar deta hai.

### Step 1: Install Capacitor in Root
Terminal me run karein:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor Config
```bash
npx cap init "GoldMatka" "com.goldmatka.app" --web-dir "apps/user-web/dist"
```

### Step 3: Web App Build Karein
```bash
npm run build:user
```

### Step 4: Android Platform Add Karein
```bash
npx cap add android
```
*(Yeh aapke project me `android/` folder create kar dega jisme complete native Android Studio code hoga)*

### Step 5: Android Assets Sync Karein
```bash
npx cap sync android
```

### Step 6: APK Generate Karein (Command Line ya Android Studio)

#### Option A: Command Line se sidha APK banana (Bina Android Studio khole):
```bash
cd android
./gradlew assembleDebug
```
Aapka ready-to-install debug APK yahan ban jayega:
👉 **`android/app/build/outputs/apk/debug/app-debug.apk`**

#### Option B: Android Studio me kholkar run ya Signed APK banana:
```bash
npx cap open android
```
Android Studio open hoga:
1. Upar menu me **Build** par click karein.
2. **Build Bundle(s) / APK(s)** -> **Build APK(s)** select karein.
3. 1 minute me notification aayegi: `APK(s) generated successfully`.
4. **locate** par click karein aur APK ko kisi bhi phone me WhatsApp / Telegram / Google Drive se transfer karke install kar lein!

---

## 🌐 Method 2: Live Production URL ke saath APK Banana

Agar aap chahte hain ki APK aapki live server URL (jaise `https://guru777.getvoroa.com` ya aapka custom domain) se auto-connect rahe:

`capacitor.config.json` me `server.url` add kar dein:
```json
{
  "appId": "com.goldmatka.app",
  "appName": "GoldMatka",
  "webDir": "apps/user-web/dist",
  "server": {
    "url": "https://guru777.getvoroa.com",
    "cleartext": true
  }
}
```
Iska faayda: Jab bhi aap backend ya frontend me koi update push karenge, Android app bina re-install kiye automatically latest features load karegi!

---

## 📲 App Download Button on Website:
Website ke top header aur sidebar me **"Download App"** button already configured hai.
Aap apna generated `.apk` file `apps/user-web/public/goldmatka.apk` ya Google Drive link par daal kar users ko direct download de sakte hain!


<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ProTrade Journal - Trading Journal App

Trading journal application with AI-powered insights using Google Gemini.

View your app in AI Studio: https://ai.studio/apps/drive/1JusOCsFT-ZN3sUNw2IwcA_FaD9lmcOiS

## 📱 Android APK

This app can now be built as an Android APK! See the guides below:

- **[BUILD_APK_EASY.md](BUILD_APK_EASY.md)** - วิธีสร้าง APK แบบง่าย (ไม่ต้องติดตั้ง JDK) ผ่าน GitHub Actions
- **[BUILD_APK_INSTRUCTIONS.md](BUILD_APK_INSTRUCTIONS.md)** - คู่มือ build APK แบบละเอียด สำหรับการ build บนเครื่องตัวเอง

### Quick Start (Build APK via GitHub Actions)
1. Push โปรเจคนี้ไปยัง GitHub repository
2. ไปที่ Actions tab
3. เลือก "Build Android APK" workflow
4. คลิก "Run workflow"
5. รอประมาณ 5-10 นาที
6. ดาวน์โหลด APK จาก Artifacts

## 🚀 Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

## 📦 Build for Web

```bash
npm run build
```

## 🔧 Android Development Commands

```bash
# Sync web assets to Android
npm run android:sync

# Open Android project in Android Studio
npm run android:open

# Run on connected Android device
npm run android:run
```

## 🛠 Tech Stack

- React 19
- TypeScript
- Vite
- Capacitor (for Android/iOS)
- Google Gemini AI
- Tailwind CSS
- Recharts
- Lucide React Icons

## 📄 License

See LICENSE file for details.

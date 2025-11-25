# คู่มือการ Build APK สำหรับ ProTrade Journal

## ✅ สิ่งที่ทำเสร็จแล้ว
1. ✓ ติดตั้ง Capacitor dependencies
2. ✓ แก้ไข vite.config.ts ให้รองรับ Capacitor
3. ✓ สร้างไฟล์ capacitor.config.ts
4. ✓ Build โปรเจคเป็น static files (dist folder)
5. ✓ เพิ่ม Android platform
6. ✓ Sync web assets ไปยัง Android project

## 📋 สิ่งที่ต้องติดตั้งเพิ่ม

### 1. ติดตั้ง Java Development Kit (JDK) 17
- ดาวน์โหลด JDK 17 จาก: https://adoptium.net/temurin/releases/?version=17
- เลือก Windows x64 installer (.msi)
- ติดตั้งและจดจำ path ที่ติดตั้ง (เช่น `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot`)

### 2. ตั้งค่า Environment Variables
เปิด PowerShell แบบ Administrator แล้วรันคำสั่ง:
```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot', 'Machine')
```
(แทนที่ path ด้วย path ที่ติดตั้ง JDK จริง)

จากนั้นเพิ่ม Java ใน PATH:
```powershell
$path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$newPath = $path + ';C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot\bin'
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'Machine')
```

### 3. ติดตั้ง Android Studio (Optional แต่แนะนำ)
- ดาวน์โหลด: https://developer.android.com/studio
- ติดตั้ง Android SDK และ SDK Tools
- เปิด Android Studio และติดตั้ง Android SDK Platform 33+ และ Build Tools

## 🔨 วิธีการ Build APK

### วิธีที่ 1: ใช้ Android Studio (แนะนำ)
```powershell
# เปิด Android project ใน Android Studio
npx cap open android
```
จากนั้นใน Android Studio:
- เลือก Build > Build Bundle(s) / APK(s) > Build APK(s)
- APK จะอยู่ที่ `android\app\build\outputs\apk\debug\app-debug.apk`

### วิธีที่ 2: ใช้ Command Line (หลังจากติดตั้ง JDK แล้ว)
```powershell
# ใน root folder ของโปรเจค
cd android
.\gradlew.bat assembleDebug
```
APK จะอยู่ที่ `android\app\build\outputs\apk\debug\app-debug.apk`

## 📱 ติดตั้ง APK บนมือถือ

### วิธีที่ 1: USB Debugging
1. เปิด Developer Options และ USB Debugging บนมือถือ Android
2. เชื่อมต่อมือถือกับคอมพิวเตอร์
3. รันคำสั่ง:
```powershell
npx cap run android
```

### วิธีที่ 2: Transfer APK ไปติดตั้งเอง
1. Copy ไฟล์ `app-debug.apk` ไปยังมือถือ
2. เปิดไฟล์ APK บนมือถือเพื่อติดตั้ง
3. อาจต้องอนุญาตการติดตั้งจากแหล่งที่ไม่รู้จักใน Settings

## 🔄 การอัปเดตโค้ดและ Build ใหม่

เมื่อแก้ไขโค้ด ให้รันคำสั่งตามลำดับ:
```powershell
# 1. Build web assets ใหม่
npm run build

# 2. Sync ไปยัง Android project
npx cap sync android

# 3. Build APK ใหม่
cd android
.\gradlew.bat assembleDebug
```

## 📝 หมายเหตุ

- APK ที่สร้างจะเป็น debug version (ไม่ได้ sign สำหรับ production)
- หากต้องการสร้าง release APK สำหรับเผยแพร่บน Google Play Store จะต้อง:
  - สร้าง keystore สำหรับ signing
  - แก้ไข gradle config
  - รัน `.\gradlew.bat assembleRelease`

## 🚀 ข้อมูลโปรเจค
- App ID: `com.protrade.journal`
- App Name: `ProTrade Journal`
- Web Directory: `dist`

## ❓ Troubleshooting

### หาก build ไม่สำเร็จ
1. ตรวจสอบว่า JAVA_HOME ตั้งค่าถูกต้อง: `echo $env:JAVA_HOME`
2. ตรวจสอบ Java version: `java -version` (ควรเป็น 17 ขึ้นไป)
3. ลอง clean build: `.\gradlew.bat clean`
4. ลอง sync ใหม่: `npx cap sync android`

### หาก app crash เมื่อเปิด
1. ตรวจสอบ logs: `npx cap run android -l`
2. ตรวจสอบว่า API keys ถูกต้อง (GEMINI_API_KEY)
3. ตรวจสอบ permissions ใน AndroidManifest.xml

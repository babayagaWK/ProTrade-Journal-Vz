# 📱 สร้าง APK แบบง่าย (ไม่ต้องติดตั้ง JDK)

หากคุณไม่ต้องการติดตั้ง Java และ Android SDK บนเครื่อง มีวิธีอื่นในการสร้าง APK:

## วิธีที่ 1: ใช้ GitHub Actions (แนะนำ)

1. Push โปรเจคนี้ขึ้น GitHub
2. ไปที่ Actions tab
3. สร้าง workflow ใหม่ด้วย config นี้:

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'temurin'
        java-version: '17'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build web app
      run: npm run build
      
    - name: Sync to Android
      run: npx cap sync android
      
    - name: Build APK
      run: |
        cd android
        chmod +x gradlew
        ./gradlew assembleDebug
        
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: app-debug
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

4. APK จะถูกสร้างอัตโนมัติและสามารถดาวน์โหลดได้จาก Artifacts

## วิธีที่ 2: ใช้ Online Build Service

### Expo Application Services (EAS)
```bash
npm install -g eas-cli
eas build -p android
```

### Ionic Appflow
สมัครใช้งานที่ https://ionic.io/appflow และ build บน cloud

## วิธีที่ 3: ใช้ Docker (สำหรับผู้ที่มี Docker ติดตั้งอยู่)

สร้างไฟล์ `Dockerfile`:
```dockerfile
FROM node:18

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    android-sdk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build
RUN npx cap sync android

WORKDIR /app/android
RUN ./gradlew assembleDebug
```

จากนั้นรัน:
```bash
docker build -t protrade-android .
docker create --name temp protrade-android
docker cp temp:/app/android/app/build/outputs/apk/debug/app-debug.apk .
docker rm temp
```

## วิธีที่ 4: ใช้ Visual Studio Code + Remote Development

1. ติดตั้ง extension "Remote - Containers"
2. สร้างไฟล์ `.devcontainer/devcontainer.json`:
```json
{
  "name": "Android Dev",
  "image": "thyrlian/android-sdk:latest",
  "postCreateCommand": "npm install"
}
```
3. เปิดโปรเจคใน container และ build APK

## 🎯 แนะนำสำหรับผู้ใช้ Windows

**วิธีที่ง่ายที่สุด:** ใช้ GitHub Actions (วิธีที่ 1)
- ไม่ต้องติดตั้งอะไรเลย
- Build ฟรีบน GitHub
- ใช้เวลาประมาณ 5-10 นาที
- ได้ APK มาเลย

## 📥 ติดตั้ง APK บนมือถือ

1. ดาวน์โหลดไฟล์ `app-debug.apk`
2. Transfer ไปยังมือถือ Android
3. เปิด Settings > Security
4. เปิด "Unknown sources" หรือ "Install unknown apps"
5. คลิกที่ไฟล์ APK เพื่อติดตั้ง

## ⚠️ หมายเหตุ

- APK ที่สร้างจากวิธีนี้เป็น **debug version**
- ไม่สามารถเผยแพร่บน Google Play Store ได้โดยตรง
- สำหรับใช้ทดสอบส่วนตัวเท่านั้น
- หากต้องการ release version ต้องมี keystore และ signing config

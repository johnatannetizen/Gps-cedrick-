# GUÍA DE COMPILACIÓN Y PUBLICACIÓN MÓVIL — CEDRICK GPS
Plataforma: Flutter (Android & iOS)
Identificador: `com.cedrickgps.app`

## 1. Requisitos Previos
- Flutter SDK 3.19.x o superior
- Android Studio con SDK 34 y Java 17/21
- Xcode 15+ (para compilación iOS en macOS)
- CocoaPods instalado (`sudo gem install cocoapods`)

## 2. Generación de Artefactos Android

### A. APK de Instalación Directa (Pruebas y Distribución Privada)
```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release
```
El archivo ejecutable generado se ubica en:
`build/app/outputs/flutter-apk/app-release.apk`

### B. Android App Bundle (AAB para Google Play Store)
1. Generar la clave de firma digital:
```bash
keytool -genkey -v -keystore cedrick-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cedrick
```
2. Configurar `android/key.properties` con las credenciales seguras.
3. Compilar el paquete optimizado:
```bash
flutter build appbundle --release
```
El archivo generado se ubica en:
`build/app/outputs/bundle/release/app-release.aab`

## 3. Generación de Artefactos iOS (Apple App Store & TestFlight)
1. Instalar dependencias de pods nativas:
```bash
cd mobile/ios
pod install
cd ..
```
2. Compilar paquete de release:
```bash
flutter build ipa --release
```
3. Abrir `ios/Runner.xcworkspace` en Xcode, seleccionar el Team de Apple Developer ID, habilitar capacidades (Capabilities):
   - Background Modes: Location Updates, Remote Notifications, Background Fetch
   - Push Notifications
4. Subir a TestFlight o App Store Connect mediante el Organizador de Xcode.

## 4. Verificación de Transmisión CEDRICK GPS TRACKER
Una vez instalada la aplicación:
1. Activar permisos de ubicación "Permitir siempre".
2. Configurar URL de servidor: `https://tu-servidor.com:5055` o `https://tu-servidor.com/api/positions`.
3. Asignar ID de dispositivo único (ej. `CEDRICK-USER-01`).
4. Iniciar seguimiento. La notificación permanente en la barra de estado confirmará la emisión continua de paquetes GPS.

# CEDRICK GPS — Ecosistema Unificado de Rastreo GPS Profesional
Basado en la integración y modernización de los 3 repositorios oficiales:
1. `traccar-server` (Motor central Java / Netty / REST API / Protocolos GPS)
2. `traccar-web` (Consola Web React / Material UI / MapLibre / Vite)
3. `traccar-manager` (App Móvil Flutter para Android e iOS)
4. Módulo `CEDRICK GPS TRACKER` (Rastreador nativo para smartphones)

## Identidad Visual
- **Negro Obsidiana**: `#050505` (Fondo y contraste ultra-profundo)
- **Dorado Imperial**: `#D4AF37` (Acentos de alta jerarquía, cursos de GPS, alertas premium)
- **Blanco Puro**: `#FFFFFF` y Grises Neutros (`#F4F4F5`, `#A1A1AA`, `#27272A`)
- **Iconografía**: Lucide Icons en Web y Material/Cupertino en Flutter.

## Estructura del Ecosistema
```
CEDRICK-GPS/
├── server/               # Backend Java Traccar con configuraciones personalizadas
│   ├── traccar.xml       # Configuración con protocolos (5055 OsmAnd, GT06, Teltonika, Coban)
│   ├── schema-cedrick.sql# Esquema de base de datos PostgreSQL
│   └── strings_es.properties # Traducciones y personalización oficial CEDRICK GPS
├── web/                  # Panel web en React 19 + Tailwind CSS + MapLibre/Leaflet
│   ├── src/              # Componentes de mapa en vivo, historial, geocercas, grupos
│   └── server.ts         # API Gateway & Servidor de aplicaciones
├── mobile/               # Aplicación Flutter para Android & iOS (Traccar Manager evolucionado)
│   ├── lib/              # Código Dart con temas Obsidian/Gold y arquitectura unificada
│   ├── android/          # Manifest con permisos FOREGROUND_SERVICE_LOCATION
│   └── ios/              # Info.plist con permisos de geolocalización continua
├── tracker/              # Módulo CEDRICK GPS TRACKER (Convierte cualquier móvil en GPS)
│   ├── cedrick_tracker.ts# Servicio de tracking en segundo plano y sync offline
│   └── PROTOCOLO_5055.md # Especificación del protocolo de transmisión HTTP
├── docker/               # Orquestación de contenedores para producción
│   ├── docker-compose.yml# Traccar Server + PostgreSQL + Web Console + Certbot Nginx
│   └── Dockerfile
├── documentation/        # Documentación de ingeniería y legal
│   ├── ARQUITECTURA.md   # Mapeo de los 3 repositorios y flujo de datos
│   ├── INSTALACION.md    # Guía paso a paso para despliegue en VPS
│   ├── SEGURIDAD_LEY_1581.md # Protección de datos personales (Colombia)
│   └── COMPILACION_MOVIL.md  # Instrucciones para generar APK, AAB e IPA
└── testing/              # Suite de pruebas automatizadas de integración
    └── integration_suite.ts  # Validación de API REST, geocercas y auth
```

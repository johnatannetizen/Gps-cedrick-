# ARQUITECTURA DE INTEGRACIÓN — CEDRICK GPS

## 1. Visión General del Ecosistema
CEDRICK GPS unifica tres proyectos de referencia de Traccar en una plataforma integral, escalable y con identidad Obsidian Black (`#050505`) y Imperial Gold (`#D4AF37`):

```
+-----------------------------------------------------------------------------------+
|                           ECOSISTEMA CEDRICK GPS                                  |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ DISPOSITIVOS EMISORES ]                                                        |
|  - Vehículos: GPS Físicos (Teltonika, Coban, GT06/Concox, Suntech) -> TCP/UDP     |
|  - Teléfonos: Módulo CEDRICK GPS TRACKER (iOS/Android/Web)        -> HTTP 5055    |
|                                                                                   |
|                                  |                                                |
|                                  v                                                |
|  +-----------------------------------------------------------------------------+  |
|  |                   SERVIDOR CENTRAL CEDRICK GPS (Java / Netty)               |  |
|  | - Receptores de Protocolo Multipuerto: 5055, 5023, 5001, 5027               |  |
|  | - Motor de Geocodificación Inversa (Nominatim / OSM)                         |  |
|  | - Motor de Alertas (Geocercas, Exceso de Velocidad, Botón SOS, Corte Motor)   |  |
|  | - API REST & WebSocket en tiempo real (/api/*)                              |  |
|  | - Base de Datos Relacional PostgreSQL 16 (Índices geoespaciales)            |  |
|  +-----------------------------------------------------------------------------+  |
|                                  |                                                |
|         +------------------------+------------------------+                       |
|         |                                                 |                       |
|         v                                                 v                       |
|  +-----------------------------+           +-----------------------------+        |
|  |      PANEL WEB CEDRICK      |           |    APP MÓVIL CEDRICK GPS    |        |
|  | (React 19 + MapLibre/Leaflet|           | (Flutter Android & iOS)     |        |
|  |  MUI + Tailwind CSS)        |           | - Panel de control táctil   |        |
|  | - Mapa Satelital/Oscuro     |           | - Notificaciones Push FCM   |        |
|  | - Historial y scrubber      |           | - Comandos remotos          |        |
|  | - Geocercas circulo/polígono|           | - CEDRICK GPS TRACKER       |        |
|  | - Grupos y Familias Ley 1581|           |   integrado con Background  |        |
|  +-----------------------------+           +-----------------------------+        |
+-----------------------------------------------------------------------------------+
```

## 2. Inventario de Componentes y Versiones

| Componente | Repositorio Base | Tecnología | Versión | Rol en CEDRICK GPS |
|------------|------------------|------------|---------|---------------------|
| Servidor Backend | `johnatannetizen/traccar` | Java 21, Gradle, Netty, Liquibase | 6.5+ | Ingestión multi-protocolo, procesamiento geoespacial, autenticación centralizada |
| Panel Web | `johnatannetizen/traccar-web` | React 19, MapLibre GL, Vite, Tailwind | 6.17.0+ | Consola de monitoreo de flotas, geocercas, telemetría y reportes |
| App Móvil | `johnatannetizen/traccar-manager` | Flutter 3.7.2+, Dart, Android/iOS | 6.2.4+ | Supervisión móvil y telemetría de bolsillo |
| Emisor Móvil | Módulo `CEDRICK GPS TRACKER` | Geolocator, BackgroundService, OsmAnd 5055 | 1.0.0 | Emisión de ubicación en tiempo real desde el teléfono autorizado |

## 3. Protocolos de Red y Puertos
- **5055/TCP**: Ingestión HTTP para CEDRICK GPS TRACKER y clientes OsmAnd.
- **5023/TCP**: Protocolo Concox / GT06.
- **5001/TCP**: Protocolo Coban.
- **5027/TCP**: Protocolo Teltonika.
- **8082/TCP**: API REST Traccar y WebSocket `/api/socket`.
- **443/TCP**: HTTPS seguro con Nginx reverse proxy y certificados TLS Let's Encrypt.

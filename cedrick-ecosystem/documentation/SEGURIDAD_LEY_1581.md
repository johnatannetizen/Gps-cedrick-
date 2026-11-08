# POLÍTICA DE SEGURIDAD Y CUMPLIMIENTO LEGAL — LEY 1581 DE 2012 (COLOMBIA)
**Plataforma**: CEDRICK GPS
**Marco Normativo**: Ley Estatutaria 1581 de 2012, Decreto Reglamentario 1377 de 2013 y directrices de la Superintendencia de Industria y Comercio (SIC).

## 1. Principios de Protección de Datos en Rastreo GPS
Los datos de geolocalización continua constituyen datos personales de carácter sensible en tanto revelan hábitos, rutinas, ubicaciones de residencia y trabajo.

### A. Principio de Libertad y Consentimiento Expreso
- Ningún dispositivo o teléfono smartphone con la modalidad **CEDRICK GPS TRACKER** puede transmitir su ubicación sin la autorización previa, expresa e informada del titular.
- La aplicación móvil y web incluyen una casilla de verificación obligatoria y un registro de auditoría de consentimiento con marca de tiempo UTC y dirección IP.
- Está prohibido el uso de modo espía u oculto. Una notificación permanente en el dispositivo indica activamente la emisión de coordenadas.

### B. Principio de Finalidad
- La información de telemetría recopilada (latitud, longitud, altitud, velocidad, estado del motor, batería) se destina exclusivamente a:
  1. Seguridad y monitoreo de la flota o persona autorizada.
  2. Generación de reportes de recorrido solicitados por el titular o administrador.
  3. Despacho y optimización de rutas operativas.

### C. Principio de Seguridad y Confidencialidad
- **Cifrado en Tránsito**: Todo el tráfico HTTP/WebSocket viaja sobre TLS 1.3 con certificados SSL clase A+.
- **Cifrado en Reposo**: Las credenciales de usuario utilizan hashing seguro `Argon2id` / `PBKDF2`.
- **RBAC (Control de Acceso Basado en Roles)**: Aislamiento estricto de datos entre cuentas, grupos y flotas. Un usuario solo puede acceder a los dispositivos sobre los cuales posee permiso expreso.

## 2. Derechos de los Titulares (Habeas Data)
Los usuarios pueden ejercer en cualquier momento:
- **Conocer**: Ver el historial de posiciones almacenadas en la plataforma.
- **Actualizar y Rectificar**: Modificar datos de perfil, nombres de dispositivos y geocercas.
- **Suprimir**: Botón de eliminación definitiva de historial de rutas y baja de cuenta en `Configuración > Privacidad y Habeas Data`.

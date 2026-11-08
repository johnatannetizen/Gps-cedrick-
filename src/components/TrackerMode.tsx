import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  MapPin, 
  Battery, 
  Gauge, 
  Wifi, 
  WifiOff, 
  ShieldCheck, 
  Settings, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  RefreshCw,
  Compass,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TrackerModeProps {
  onPositionSent?: (pos: any) => void;
}

export const TrackerMode: React.FC<TrackerModeProps> = ({ onPositionSent }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [deviceId, setDeviceId] = useState('CEDRICK-PHONE-01');
  const [serverUrl, setServerUrl] = useState('/api/positions');
  const [intervalSec, setIntervalSec] = useState(5);
  const [batterySaveMode, setBatterySaveMode] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(true);

  // Estados de telemetría en vivo
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [currentAltitude, setCurrentAltitude] = useState<number | null>(null);
  const [currentHeading, setCurrentHeading] = useState<number>(0);
  const [packetsSent, setPacketsSent] = useState(0);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [lastTransmissionTime, setLastTransmissionTime] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Listo para iniciar rastreo');
  const [hasError, setHasError] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Reproducir sonido de confirmación de paquete transmitido
  const playBeep = () => {
    if (!audioFeedback) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignorar si el navegador bloquea audio
    }
  };

  // Enviar posición al servidor Central Traccar / CEDRICK API
  const transmitPosition = async (pos: GeolocationPosition) => {
    const now = Date.now();
    const effectiveInterval = batterySaveMode ? Math.max(intervalSec * 2, 10) * 1000 : intervalSec * 1000;
    
    if (now - lastSentRef.current < effectiveInterval) {
      return; // Esperar intervalo configurado
    }
    lastSentRef.current = now;

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const speed = (pos.coords.speed || 0) * 3.6; // m/s a km/h
    const accuracy = pos.coords.accuracy;
    const heading = pos.coords.heading || 0;
    const altitude = pos.coords.altitude || 2600;

    setCurrentLat(lat);
    setCurrentLng(lon);
    setCurrentSpeed(speed);
    setCurrentAccuracy(accuracy);
    setCurrentAltitude(altitude);
    setCurrentHeading(heading);

    const payload = {
      id: deviceId,
      lat,
      lon,
      speed,
      bearing: heading,
      altitude,
      accuracy,
      batt: 92,
      timestamp: Math.floor(now / 1000)
    };

    try {
      // Protocolo OsmAnd / Traccar 5055 mediante GET con query params
      const queryParams = new URLSearchParams({
        id: deviceId,
        lat: lat.toString(),
        lon: lon.toString(),
        speed: (speed / 1.852).toFixed(1), // nudos requeridos por estándar Traccar
        bearing: heading.toString(),
        altitude: altitude.toString(),
        batt: '92',
        timestamp: Math.floor(now / 1000).toString()
      });

      const endpoint = `${serverUrl}?${queryParams.toString()}`;
      const response = await fetch(endpoint, { method: 'GET' });

      if (response.ok) {
        setPacketsSent(prev => prev + 1);
        setLastTransmissionTime(new Date().toLocaleTimeString());
        setStatusMessage('Paquete telemetría transmitido con éxito');
        setHasError(false);
        playBeep();
        if (onPositionSent) onPositionSent(payload);

        // Si hay paquetes pendientes en cola offline, transmitirlos
        if (offlineQueue.length > 0) {
          flushOfflineQueue();
        }
      } else {
        throw new Error('Servidor respondió con error');
      }
    } catch (err) {
      setHasError(true);
      setStatusMessage('Sin conexión directa. Guardando en cola offline.');
      setOfflineQueue(prev => [...prev.slice(-99), payload]);
    }
  };

  const flushOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    const queueCopy = [...offlineQueue];
    setOfflineQueue([]);
    for (const item of queueCopy) {
      try {
        const queryParams = new URLSearchParams({
          id: item.id,
          lat: item.lat.toString(),
          lon: item.lon.toString(),
          speed: (item.speed / 1.852).toFixed(1),
          bearing: item.bearing.toString(),
          altitude: item.altitude.toString(),
          batt: '90'
        });
        await fetch(`${serverUrl}?${queryParams.toString()}`);
        setPacketsSent(prev => prev + 1);
      } catch (e) {
        setOfflineQueue(prev => [...prev, item]);
      }
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatusMessage('Geolocalización no soportada por este navegador');
      setHasError(true);
      return;
    }

    setStatusMessage('Iniciando sensor GPS nativo...');
    setIsTracking(true);
    setHasError(false);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => transmitPosition(pos),
      (err) => {
        setStatusMessage(`Error GPS: ${err.message}`);
        setHasError(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setStatusMessage('Rastreo detenido por el usuario');
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Banner Principal del Módulo */}
      <div className="bg-gradient-to-r from-[#0e0e11] via-[#141418] to-[#0e0e11] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                Módulo Oficial de Rastreo Móvil
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              CEDRICK <span className="text-[#D4AF37]">GPS TRACKER</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Convierte este teléfono inteligente o estación de trabajo en un dispositivo rastreador emisor de telemetría de alta precisión, sincronizado directamente con el servidor central Traccar (Protocolo OsmAnd Puerto 5055).
            </p>
          </div>

          {/* Gran Botón de Transmisión */}
          <button
            onClick={isTracking ? stopTracking : startTracking}
            className={`px-6 py-4 rounded-xl font-extrabold text-sm flex items-center gap-3 transition-all transform active:scale-95 shadow-xl ${
              isTracking
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 ring-4 ring-red-600/20 animate-pulse'
                : 'bg-gradient-to-r from-[#D4AF37] to-[#E5C158] hover:from-[#E5C158] hover:to-[#D4AF37] text-black shadow-[#D4AF37]/30 ring-4 ring-[#D4AF37]/20'
            }`}
          >
            {isTracking ? (
              <>
                <Square className="w-5 h-5 fill-current" />
                <span>DETENER RASTREO</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>INICIAR TRANSMISIÓN GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Indicador Visible de Estado (No seguimiento oculto - Cumplimiento Ley 1581) */}
        <div className="mt-4 pt-4 border-t border-[#27272a] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${isTracking ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
            <span className="font-bold text-white uppercase tracking-wider">
              {isTracking ? 'TRANSMITIENDO EN VIVO (SEGUIMIENTO ACTIVO)' : 'SENSOR GPS EN ESPERA'}
            </span>
          </div>
          <span className={`font-mono text-xs ${hasError ? 'text-red-400' : 'text-zinc-400'}`}>
            {statusMessage}
          </span>
        </div>
      </div>

      {/* Cuadrícula de Métricas en Tiempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Velocidad */}
        <div className="bg-[#141418] border border-[#23232a] rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1 flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-[#D4AF37]" />
            Velocidad Real
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {currentSpeed.toFixed(1)} <span className="text-xs font-normal text-zinc-400">km/h</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">Calculada por satélite</span>
        </div>

        {/* Coordenadas */}
        <div className="bg-[#141418] border border-[#23232a] rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            Latitud / Longitud
          </span>
          <div className="text-xs font-bold text-white font-mono truncate">
            {currentLat ? `${currentLat.toFixed(5)}, ${currentLng?.toFixed(5)}` : 'Esperando fix...'}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Precisión: ±{currentAccuracy ? currentAccuracy.toFixed(1) : '--'} m
          </span>
        </div>

        {/* Paquetes Emitidos */}
        <div className="bg-[#141418] border border-[#23232a] rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            Paquetes Enviados
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {packetsSent}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            Último: {lastTransmissionTime || 'Ninguno'}
          </span>
        </div>

        {/* Buffer Offline */}
        <div className="bg-[#141418] border border-[#23232a] rounded-xl p-4">
          <span className="text-xs text-zinc-400 block mb-1 flex items-center gap-1.5">
            {offlineQueue.length > 0 ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
            Cola Offline
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {offlineQueue.length} <span className="text-xs font-normal text-zinc-400">paquetes</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
            {offlineQueue.length > 0 ? 'Esperando reconexión...' : 'Buffer sincronizado'}
          </span>
        </div>
      </div>

      {/* Configuración del Dispositivo Emisor */}
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#D4AF37]" />
          Parámetros de Transmisión y Protocolo OsmAnd
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Identificador del Dispositivo */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">
              Identificador Único (IMEI / Device ID):
            </label>
            <input
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={isTracking}
              className="w-full bg-[#141418] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <span className="text-[10px] text-zinc-500 mt-0.5 block">
              Debe coincidir con el identificador registrado en el panel central de Traccar.
            </span>
          </div>

          {/* URL de Ingestión */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">
              Servidor / Endpoint de Ingestión:
            </label>
            <input
              type="text"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={isTracking}
              className="w-full bg-[#141418] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <span className="text-[10px] text-zinc-500 mt-0.5 block">
              Predeterminado: Servidor local /api/positions o https://tudominio.com:5055
            </span>
          </div>
        </div>

        {/* Intervalo y Optimización */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#1e1e24]">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Frecuencia de Envío: <b className="text-[#D4AF37] font-mono">{intervalSec} seg</b>
            </label>
            <input
              type="range"
              min="2"
              max="60"
              step="1"
              value={intervalSec}
              onChange={(e) => setIntervalSec(parseInt(e.target.value, 10))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>2s (Alta precisión)</span>
              <span>60s (Ahorro)</span>
            </div>
          </div>

          {/* Modo Ahorro Batería */}
          <div className="flex items-center justify-between p-3 bg-[#141418] rounded-lg border border-[#27272a]">
            <div>
              <span className="text-xs font-medium text-white block">Ahorro de Batería</span>
              <span className="text-[10px] text-zinc-400">Reduce tasa si está estático</span>
            </div>
            <input
              type="checkbox"
              checked={batterySaveMode}
              onChange={(e) => setBatterySaveMode(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
            />
          </div>

          {/* Feedback Sonoro */}
          <div className="flex items-center justify-between p-3 bg-[#141418] rounded-lg border border-[#27272a]">
            <div>
              <span className="text-xs font-medium text-white block">Aviso Sonoro</span>
              <span className="text-[10px] text-zinc-400">Bip al emitir paquete</span>
            </div>
            <button
              onClick={() => setAudioFeedback(!audioFeedback)}
              className="p-1.5 rounded-lg bg-[#1f1f24] text-zinc-300 hover:text-[#D4AF37]"
            >
              {audioFeedback ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Aviso de Transparencia y Ley 1581 de Colombia */}
      <div className="p-4 rounded-xl bg-[#141418] border border-[#27272a] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-400 leading-relaxed">
          <b className="text-white block mb-0.5">Seguridad y Cumplimiento Normativo (Ley Estatutaria 1581 de 2012)</b>
          Este módulo transmite datos de geolocalización de forma voluntaria, consciente y explícita. No opera en modo oculto ni recolecta información sin una indicación visual permanente en pantalla. Al activar el rastreo, usted autoriza el almacenamiento seguro de sus coordenadas en la base de datos de CEDRICK GPS.
        </div>
      </div>
    </div>
  );
};

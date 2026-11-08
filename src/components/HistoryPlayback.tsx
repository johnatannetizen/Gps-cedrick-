import React, { useState, useEffect } from 'react';
import { Device, Position } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Calendar, 
  MapPin, 
  Clock, 
  Gauge, 
  Compass, 
  Download,
  Navigation
} from 'lucide-react';

interface HistoryPlaybackProps {
  devices: Device[];
  selectedDevice: Device | null;
  historyPositions: Position[];
  currentIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (index: number) => void;
  onSelectDevice: (device: Device) => void;
}

export const HistoryPlayback: React.FC<HistoryPlaybackProps> = ({
  devices,
  selectedDevice,
  historyPositions,
  currentIndex,
  isPlaying,
  onTogglePlay,
  onSeek,
  onSelectDevice
}) => {
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week'>('today');

  const currentPos = historyPositions[currentIndex] || historyPositions[0];

  // Cálculo de estadísticas del recorrido
  const totalPoints = historyPositions.length;
  const maxSpeed = historyPositions.length > 0 ? Math.max(...historyPositions.map(p => p.speed)) : 0;
  const avgSpeed = historyPositions.length > 0 
    ? (historyPositions.reduce((acc, p) => acc + p.speed, 0) / historyPositions.length) 
    : 0;

  // Exportar recorrido a CSV
  const exportToCSV = () => {
    if (historyPositions.length === 0) return;
    const headers = ['ID,Fecha_Hora,Latitud,Longitud,Velocidad_kmh,Rumbo_grados,Direccion\n'];
    const rows = historyPositions.map(p => 
      `${p.id},"${p.serverTime}",${p.latitude},${p.longitude},${p.speed.toFixed(1)},${p.course},"${p.address || ''}"`
    );
    const csvContent = headers.join('') + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CEDRICK_Recorrido_${selectedDevice?.name || 'vehiculo'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabecera y Selección */}
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
            Módulo de Reproducción de Rutas
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D4AF37]" />
            Historial de Telemetría y Trayectorias
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selector de Vehículo */}
          <select
            value={selectedDevice?.id || (devices[0]?.id || '')}
            onChange={(e) => {
              const dev = devices.find(d => d.id === parseInt(e.target.value, 10));
              if (dev) onSelectDevice(dev);
            }}
            className="bg-[#141418] border border-[#27272a] text-xs font-semibold text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37]"
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.attributes.plateNumber || d.uniqueId})
              </option>
            ))}
          </select>

          {/* Rango de Tiempo */}
          <div className="flex items-center bg-[#141418] border border-[#27272a] rounded-lg p-1 text-xs">
            <button
              onClick={() => setDateRange('today')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 'today' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateRange('yesterday')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 'yesterday' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ayer
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                dateRange === 'week' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Últimos 7 días
            </button>
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Panel del Reproductor y Barra de Tiempo (Scrubber) */}
      <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Métricas del Punto Actual */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#0e0e11] rounded-xl border border-[#23232a]">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Velocidad en Punto</span>
            <div className="text-xl font-bold text-white font-mono flex items-center gap-1 mt-0.5">
              <Gauge className="w-4 h-4 text-[#D4AF37]" />
              {currentPos ? currentPos.speed.toFixed(1) : 0} <span className="text-xs font-normal text-zinc-400">km/h</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Marca de Tiempo</span>
            <div className="text-xs font-bold text-white font-mono mt-1">
              {currentPos ? new Date(currentPos.serverTime).toLocaleString() : '--'}
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Velocidad Máxima</span>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {maxSpeed.toFixed(1)} <span className="text-xs font-normal text-zinc-400">km/h</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-mono block">Puntos de Telemetría</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {currentIndex + 1} <span className="text-xs font-normal text-zinc-500">/ {totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Línea de Tiempo (Scrubber Slider) */}
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
            <span>Inicio del Recorrido</span>
            <span className="text-[#D4AF37] font-bold">
              Progreso: {totalPoints > 0 ? Math.round(((currentIndex + 1) / totalPoints) * 100) : 0}%
            </span>
            <span>Destino Final</span>
          </div>

          <input
            type="range"
            min="0"
            max={Math.max(0, totalPoints - 1)}
            value={currentIndex}
            onChange={(e) => onSeek(parseInt(e.target.value, 10))}
            className="w-full accent-[#D4AF37] h-2 bg-[#27272a] rounded-lg cursor-pointer"
          />
        </div>

        {/* Controles de Reproducción */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#23232a]">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={onTogglePlay}
              className="w-12 h-12 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black flex items-center justify-center font-bold shadow-lg shadow-[#D4AF37]/20 transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Reiniciar */}
            <button
              onClick={() => onSeek(0)}
              className="p-3 rounded-xl bg-[#1f1f24] hover:bg-[#27272a] text-zinc-300 hover:text-white transition-colors"
              title="Volver al inicio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Velocidad Multiplicadora */}
          <div className="flex items-center gap-1 bg-[#0e0e11] border border-[#23232a] p-1 rounded-lg text-xs font-mono">
            <span className="text-zinc-500 px-2">Velocidad:</span>
            {[1, 2, 5, 10].map(mult => (
              <button
                key={mult}
                onClick={() => setSpeedMultiplier(mult)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  speedMultiplier === mult
                    ? 'bg-[#D4AF37] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mult}x
              </button>
            ))}
          </div>

          {/* Dirección Geocodificada Actual */}
          {currentPos && (
            <div className="text-right text-xs text-zinc-400 max-w-sm truncate">
              <span className="text-zinc-500 block text-[10px]">Posición en mapa:</span>
              <span className="text-white font-medium">{currentPos.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

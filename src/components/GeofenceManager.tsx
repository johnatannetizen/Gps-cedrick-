import React, { useState } from 'react';
import { Geofence } from '../types';
import { Layers, Plus, Trash2, ShieldAlert, MapPin, Gauge } from 'lucide-react';

interface GeofenceManagerProps {
  geofences: Geofence[];
  onAddGeofence: (newGeo: Partial<Geofence>) => void;
  onDeleteGeofence: (id: number) => void;
}

export const GeofenceManager: React.FC<GeofenceManagerProps> = ({
  geofences,
  onAddGeofence,
  onDeleteGeofence
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(1200);
  const [speedLimit, setSpeedLimit] = useState(50);
  const [color, setColor] = useState('#D4AF37');
  const [centerLat, setCenterLat] = useState(4.6534);
  const [centerLon, setCenterLon] = useState(-74.0837);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGeofence({
      name,
      description,
      area: `CIRCLE(${centerLat} ${centerLon}, ${radius})`,
      color,
      speedLimit,
      calendarId: 0,
      attributes: {
        type: 'circle',
        radius,
        centerLat,
        centerLon,
        alertOnEnter: true,
        alertOnExit: true
      }
    });

    setName('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
            Control Perimetral y Delimitación Virtual
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#D4AF37]" />
            Administrador de Geocercas & Zonas Seguras
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Geocerca</span>
        </button>
      </div>

      {/* Lista de Geocercas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {geofences.map(gf => (
          <div key={gf.id} className="bg-[#141418] border border-[#23232a] rounded-xl p-4 shadow-xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-3.5 h-3.5 rounded-full ring-2 ring-black shrink-0" 
                  style={{ backgroundColor: gf.color || '#D4AF37' }} 
                />
                <h3 className="text-sm font-bold text-white">{gf.name}</h3>
              </div>
              <button
                onClick={() => onDeleteGeofence(gf.id)}
                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                title="Eliminar geocerca"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-3">{gf.description}</p>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#0e0e11] p-2.5 rounded-lg border border-[#1f1f24] font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block">Tipo & Radio</span>
                <span className="text-zinc-200">
                  {gf.attributes?.radius ? `Círculo ${gf.attributes.radius}m` : 'Polígono WKT'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block">Límite Velocidad</span>
                <span className="text-[#D4AF37] font-bold">
                  {gf.speedLimit ? `${gf.speedLimit} km/h` : 'Sin límite'}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#1f1f24] flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                Alertas Activas (Entrada / Salida)
              </span>
              <span className="text-zinc-500">ID #{gf.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Geocerca */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141418] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D4AF37]" />
              Crear Nueva Geocerca Perimetral
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre de la Zona:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Zona Norte Bogotá o Parqueadero Seguro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Descripción Operativa:</label>
                <input
                  type="text"
                  placeholder="Ej: Control de despacho y arribo nocturno"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Radio (metros):</label>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Límite (km/h):</label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={speedLimit}
                    onChange={(e) => setSpeedLimit(parseInt(e.target.value, 10))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Latitud Centro:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={centerLat}
                    onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Longitud Centro:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={centerLon}
                    onChange={(e) => setCenterLon(parseFloat(e.target.value))}
                    className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23232a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg shadow-md shadow-[#D4AF37]/20"
                >
                  Guardar Geocerca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

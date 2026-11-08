import React, { useState } from 'react';
import { Device, Position } from '../types';
import { 
  Search, 
  Car, 
  Truck, 
  Smartphone, 
  Shield, 
  Power, 
  Battery, 
  Gauge, 
  Navigation, 
  AlertCircle,
  Plus,
  Key
} from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  positions: Position[];
  selectedDevice: Device | null;
  onSelectDevice: (device: Device) => void;
  onOpenAddModal: () => void;
  onSendCommand: (device: Device, type: string) => void;
  onShowHistory: (device: Device) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  positions,
  selectedDevice,
  onSelectDevice,
  onOpenAddModal,
  onSendCommand,
  onShowHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'car' | 'truck' | 'motorcycle' | 'phone'>('all');

  const filteredDevices = devices.filter(dev => {
    const matchesSearch = 
      dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dev.attributes.plateNumber && dev.attributes.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || dev.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'truck': return Truck;
      case 'phone': return Smartphone;
      default: return Car;
    }
  };

  return (
    <div className="w-full lg:w-96 bg-[#0e0e11] border-r border-[#23232a] flex flex-col h-full">
      {/* Cabecera del Panel de Flota */}
      <div className="p-4 border-b border-[#23232a]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              Monitoreo de Flotas & Móviles
            </h2>
            <span className="text-xs text-zinc-400">
              {filteredDevices.length} unidades registradas
            </span>
          </div>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black rounded-lg text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Vincular</span>
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por placa, nombre o IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#141418] border border-[#27272a] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Filtros de Categoría */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'car', label: 'Autos' },
            { id: 'truck', label: 'Carga' },
            { id: 'phone', label: 'Móviles' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                  : 'text-zinc-400 hover:text-white bg-[#141418]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Dispositivos */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e1e24] p-2 space-y-2">
        {filteredDevices.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No se encontraron unidades con los filtros seleccionados.
          </div>
        ) : (
          filteredDevices.map(dev => {
            const pos = positions.find(p => p.deviceId === dev.id);
            const isSelected = selectedDevice?.id === dev.id;
            const Icon = getCategoryIcon(dev.category);
            const speed = pos ? pos.speed : 0;
            const isOnline = dev.status === 'online';

            return (
              <div
                key={dev.id}
                onClick={() => onSelectDevice(dev)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181f] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                    : 'bg-[#141418] border-[#23232a] hover:border-zinc-700'
                }`}
              >
                {/* Cabecera Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected 
                        ? 'bg-[#D4AF37] text-black font-bold' 
                        : 'bg-[#1f1f24] text-[#D4AF37]'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">
                        {dev.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400 font-mono">
                        <span className="text-[#D4AF37] font-semibold">{dev.attributes.plateNumber || dev.uniqueId}</span>
                        <span>·</span>
                        <span>{dev.model}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isOnline 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    {isOnline ? 'EN VIVO' : 'OFFLINE'}
                  </span>
                </div>

                {/* Métricas de Telemetría */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#0e0e11] rounded-lg border border-[#1f1f24] mb-2.5 text-xs">
                  {/* Velocidad */}
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Velocidad</span>
                    <span className="font-bold text-white font-mono flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-[#D4AF37]" />
                      {speed.toFixed(0)} <span className="text-[10px] font-normal text-zinc-400">km/h</span>
                    </span>
                  </div>

                  {/* Ignición */}
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Motor</span>
                    <span className={`font-bold font-mono flex items-center gap-1 text-[11px] ${
                      dev.attributes.ignition ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      <Key className="w-3 h-3" />
                      {dev.attributes.ignition ? 'ON' : 'OFF'}
                    </span>
                  </div>

                  {/* Batería */}
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Batería</span>
                    <span className="font-bold text-white font-mono flex items-center gap-1 text-[11px]">
                      <Battery className="w-3 h-3 text-amber-400" />
                      {dev.attributes.batteryLevel}%
                    </span>
                  </div>
                </div>

                {/* Ubicación y Dirección Geocodificada */}
                {pos && (
                  <p className="text-[11px] text-zinc-400 truncate mb-2.5 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    <span>{pos.address}</span>
                  </p>
                )}

                {/* Botonera de Acciones Remotas */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#23232a]" onClick={(e) => e.stopPropagation()}>
                  {/* Corte de Motor */}
                  <button
                    onClick={() => onSendCommand(dev, dev.attributes.fuelCutoff ? 'engineResume' : 'engineStop')}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-[11px] font-semibold transition-all ${
                      dev.attributes.fuelCutoff
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-800'
                    }`}
                    title={dev.attributes.fuelCutoff ? 'Restaurar alimentación de combustible' : 'Desactivar relé de motor'}
                  >
                    <Power className="w-3 h-3" />
                    <span>{dev.attributes.fuelCutoff ? 'Reanudar' : 'Corte Motor'}</span>
                  </button>

                  {/* Historial de Recorridos */}
                  <button
                    onClick={() => onShowHistory(dev)}
                    className="px-2.5 py-1 bg-[#1f1f24] hover:bg-[#27272a] text-[#D4AF37] border border-[#2d2d34] rounded text-[11px] font-medium transition-colors"
                  >
                    Ruta
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

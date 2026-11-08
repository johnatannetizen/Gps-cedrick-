import React, { useState } from 'react';
import { Device } from '../types';
import { Plus, Smartphone, Car, Truck, Key, X } from 'lucide-react';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDevice: (deviceData: any) => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose,
  onAddDevice
}) => {
  const [name, setName] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [category, setCategory] = useState<'car' | 'truck' | 'motorcycle' | 'phone'>('car');
  const [model, setModel] = useState('Teltonika FMB920');
  const [contact, setContact] = useState('');
  const [speedLimit, setSpeedLimit] = useState(80);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddDevice({
      name,
      uniqueId: uniqueId || `CEDRICK-${Date.now().toString().slice(-6)}`,
      category,
      model,
      contact: contact || 'Conductor Autorizado',
      speedLimit,
      plateNumber: plateNumber.toUpperCase()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#141418] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            Vincular Nueva Unidad a CEDRICK GPS
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nombre o Alias del Dispositivo:</label>
            <input
              type="text"
              required
              placeholder="Ej: Camioneta Hilux #04 o Celular Supervisor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Identificador / IMEI:</label>
              <input
                type="text"
                placeholder="Ej: 864920041289123"
                value={uniqueId}
                onChange={(e) => setUniqueId(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Placa Vehicular:</label>
              <input
                type="text"
                placeholder="Ej: KLR-942"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tipo de Unidad:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="car">Automóvil / Camioneta</option>
                <option value="truck">Camión / Carga Pesada</option>
                <option value="motorcycle">Motocicleta</option>
                <option value="phone">Smartphone (CEDRICK Tracker)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Modelo de Rastreador:</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Conductor / Titular Asignado:</label>
            <input
              type="text"
              placeholder="Ej: Juan Camilo Pérez"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Límite de Alerta de Velocidad (km/h):</label>
            <input
              type="number"
              min="20"
              max="160"
              value={speedLimit}
              onChange={(e) => setSpeedLimit(parseInt(e.target.value, 10))}
              className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23232a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg shadow-md shadow-[#D4AF37]/20"
            >
              Vincular Dispositivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

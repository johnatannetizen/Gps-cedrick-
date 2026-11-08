import React from 'react';
import { Device } from '../types';
import { Power, ShieldAlert, Navigation, RefreshCw, X } from 'lucide-react';

interface CommandModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSendCommand: (device: Device, type: string) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  device,
  isOpen,
  onClose,
  onSendCommand
}) => {
  if (!isOpen || !device) return null;

  const handleAction = (type: string) => {
    onSendCommand(device, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#141418] border border-[#27272a] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Comandos Telemáticos Remotos
            </h3>
            <span className="text-xs text-[#D4AF37] font-mono">{device.name}</span>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Corte de Motor */}
          <button
            onClick={() => handleAction(device.attributes.fuelCutoff ? 'engineResume' : 'engineStop')}
            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
              device.attributes.fuelCutoff
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200'
            }`}
          >
            <Power className="w-5 h-5 shrink-0" />
            <div className="text-left text-xs">
              <b className="block">{device.attributes.fuelCutoff ? 'Restaurar Suministro Combustible' : 'Corte de Motor Inmediato'}</b>
              <span className="text-[10px] opacity-80">
                {device.attributes.fuelCutoff ? 'Reactivar relé de encendido' : 'Desactiva bomba de inyección'}
              </span>
            </div>
          </button>

          {/* Alarma Perimetral */}
          <button
            onClick={() => handleAction('armAlarm')}
            className="w-full p-3 bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] rounded-xl flex items-center gap-3 text-zinc-200 transition-all text-xs"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left">
              <b className="block text-white">Armar Alarma Perimetral</b>
              <span className="text-[10px] text-zinc-400">Activa sensor de movimiento y sirena</span>
            </div>
          </button>

          {/* Posición Inmediata */}
          <button
            onClick={() => handleAction('positionSingle')}
            className="w-full p-3 bg-[#1f1f24] hover:bg-[#27272a] border border-[#27272a] rounded-xl flex items-center gap-3 text-zinc-200 transition-all text-xs"
          >
            <Navigation className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div className="text-left">
              <b className="block text-white">Solicitar Reporte Satelital GPS</b>
              <span className="text-[10px] text-zinc-400">Forzar fix inmediato de coordenadas</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Smartphone, 
  Layers, 
  ShieldCheck, 
  Bell, 
  History, 
  Server, 
  Cpu,
  Flame,
  Users,
  Settings2
} from 'lucide-react';
import { NotificationAlert } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onlineCount: number;
  totalDevices: number;
  notifications: NotificationAlert[];
  onClearNotifications: () => void;
  isTrackingActive: boolean;
  onOpenTracker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onlineCount,
  totalDevices,
  notifications,
  onClearNotifications,
  isTrackingActive,
  onOpenTracker
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'map', label: 'Centro de Monitoreo', icon: MapPin },
    { id: 'tracker', label: 'CEDRICK Tracker', icon: Radio, highlight: isTrackingActive },
    { id: 'history', label: 'Historial & Recorridos', icon: History },
    { id: 'geofences', label: 'Geocercas & Zonas', icon: Layers },
    { id: 'groups', label: 'Familias & Ley 1581', icon: Users },
    { id: 'mobile-app', label: 'App Móvil Flutter', icon: Smartphone },
    { id: 'ecosystem', label: 'Arquitectura & Tests', icon: Cpu },
    { id: 'integrations', label: 'APIs & Diagnóstico', icon: Settings2 }
  ];

  return (
    <header className="bg-[#050505] border-b border-[#23232a] sticky top-0 z-50">
      {/* Barra superior de telemetría y marca */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Marca Oficial CEDRICK GPS */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#A68523] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 border border-[#D4AF37]/40">
              <span className="font-bold text-black text-xl tracking-wider">C</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-wider">
                  CEDRICK <span className="text-[#D4AF37]">GPS</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#18181b] text-[#D4AF37] border border-[#D4AF37]/30">
                  PRO v6.5
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Servidor Traccar Central: Conectado</span>
                <span className="text-zinc-600 hidden sm:inline">|</span>
                <span className="hidden sm:inline text-zinc-400 font-mono">Puerto 5055 OsmAnd Activo</span>
              </div>
            </div>
          </div>

          {/* Estado de Dispositivos y Acciones Rápidas */}
          <div className="flex items-center gap-3">
            {/* Botón rápido CEDRICK GPS TRACKER móvil */}
            <button
              onClick={onOpenTracker}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isTrackingActive 
                  ? 'bg-gradient-to-r from-red-950/80 to-amber-950/80 border-[#D4AF37] text-[#D4AF37] shadow-lg shadow-[#D4AF37]/20 animate-pulse'
                  : 'bg-[#141418] border-[#27272a] text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isTrackingActive ? 'text-red-400 animate-ping' : 'text-[#D4AF37]'}`} />
              <span className="hidden sm:inline">
                {isTrackingActive ? 'Rastreador Transmitiendo' : 'Activar Modo Rastreador'}
              </span>
              <span className="sm:hidden">Tracker</span>
            </button>

            {/* Contador de Flota */}
            <div className="hidden md:flex items-center gap-2 bg-[#0e0e11] border border-[#23232a] px-3 py-1.5 rounded-lg text-xs">
              <span className="text-zinc-400">Flota:</span>
              <span className="font-bold text-emerald-400 font-mono">{onlineCount}</span>
              <span className="text-zinc-600">/</span>
              <span className="font-bold text-zinc-300 font-mono">{totalDevices} Activos</span>
            </div>

            {/* Notificaciones de Alertas */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg bg-[#141418] border border-[#23232a] text-zinc-300 hover:text-white transition-colors"
                title="Alertas del sistema"
              >
                <Bell className="w-4 h-4 text-zinc-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Alertas */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141418] border border-[#27272a] rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-[#23232a] flex items-center justify-between bg-[#0e0e11]">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Alertas de Seguridad & Telemetría
                    </span>
                    <button
                      onClick={onClearNotifications}
                      className="text-[11px] text-zinc-400 hover:text-[#D4AF37] transition-colors"
                    >
                      Limpiar todo
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#23232a]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-500">
                        No hay eventos recientes. Flota operando normalmente.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className="p-3 hover:bg-[#18181f] transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                              notif.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' :
                              notif.severity === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}>
                              {notif.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {new Date(notif.eventTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 mt-1 font-medium">{notif.message}</p>
                          <span className="text-[11px] text-[#D4AF37] mt-0.5 block">{notif.deviceName}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Perfil Usuario */}
            <div className="flex items-center gap-2 pl-2 border-l border-[#23232a]">
              <div className="w-8 h-8 rounded-full bg-[#18181b] border border-[#D4AF37]/50 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
                JD
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-bold text-white leading-tight">Admin Cedrick</span>
                <span className="block text-[10px] text-zinc-500">Colombia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegación Segmentada */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#18181b] text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm shadow-[#D4AF37]/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#121214]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.highlight && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-1" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

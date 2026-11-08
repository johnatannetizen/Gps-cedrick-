import React, { useState } from 'react';
import { Device, Position } from '../types';
import { 
  Smartphone, 
  MapPin, 
  Shield, 
  Radio, 
  Bell, 
  User, 
  Code, 
  Battery, 
  Wifi, 
  Key, 
  Gauge, 
  Power, 
  Check, 
  Copy, 
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MobileSimulatorProps {
  devices: Device[];
  positions: Position[];
  onSendCommand: (device: Device, type: string) => void;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  devices,
  positions,
  onSendCommand
}) => {
  const [activeScreen, setActiveScreen] = useState<'devices' | 'map' | 'tracker' | 'alerts' | 'profile'>('devices');
  const [activeTab, setActiveTab] = useState<'simulator' | 'flutter-code'>('simulator');
  const [selectedMobileDevice, setSelectedMobileDevice] = useState<Device>(devices[0] || null);
  const [copiedCode, setCopiedCode] = useState(false);

  const flutterMainCode = `// CEDRICK GPS — APP MÓVIL OFICIAL FLUTTER (Android & iOS)
// Basado en traccar-manager evolucionado con identidad Obsidian & Gold

import 'package:flutter/material.dart';
import 'package:cedrick_gps/theme/app_colors.dart';
import 'package:cedrick_gps/services/tracker_service.dart';
import 'package:cedrick_gps/screens/main_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const CedrickGpsApp());
}

class CedrickGpsApp extends StatelessWidget {
  const CedrickGpsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CEDRICK GPS',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: CedrickColors.obsidianBlack,
        primaryColor: CedrickColors.imperialGold,
        colorScheme: const ColorScheme.dark(
          primary: CedrickColors.imperialGold,
          secondary: CedrickColors.imperialGoldHover,
          surface: CedrickColors.obsidianCard,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: CedrickColors.obsidianBlack,
          elevation: 0,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabecera */}
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
            Ecosistema Móvil Multiplataforma (Flutter 3.x)
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#D4AF37]" />
            Aplicación Móvil CEDRICK GPS (Android & iOS)
          </h2>
        </div>

        {/* Selector de Vista: Simulador vs Código Flutter */}
        <div className="flex bg-[#141418] border border-[#27272a] p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'simulator' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Emulador Interactivo
          </button>
          <button
            onClick={() => setActiveTab('flutter-code')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'flutter-code' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Código Fuente Flutter
          </button>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
          {/* Mockup de Teléfono Móvil */}
          <div className="w-[340px] h-[680px] bg-black border-[10px] border-[#18181b] rounded-[48px] shadow-2xl shadow-black ring-1 ring-[#D4AF37]/30 relative flex flex-col overflow-hidden">
            {/* Notch / Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#141418] rounded-full z-30 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
            </div>

            {/* Barra de Estado Móvil */}
            <div className="h-8 bg-[#050505] text-zinc-400 px-6 flex items-center justify-between text-[11px] font-mono z-20 pt-1">
              <span>09:41</span>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Wifi className="w-3 h-3 text-[#D4AF37]" />
                <span className="text-[10px]">5G</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            {/* Cabecera de la App Móvil */}
            <div className="bg-[#050505] border-b border-[#23232a] px-4 py-2.5 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#D4AF37] flex items-center justify-center font-bold text-black text-xs">
                  C
                </div>
                <span className="text-xs font-black text-white tracking-wider">
                  CEDRICK <span className="text-[#D4AF37]">GPS</span>
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                En Línea
              </span>
            </div>

            {/* Contenido Dinámico de la Pantalla */}
            <div className="flex-1 overflow-y-auto bg-[#0a0a0c] p-3 space-y-3">
              {activeScreen === 'devices' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                    <span className="font-bold uppercase text-white">Mis Vehículos</span>
                    <span className="text-[#D4AF37] font-mono">{devices.length} Activos</span>
                  </div>

                  {devices.map(dev => {
                    const pos = positions.find(p => p.deviceId === dev.id);
                    return (
                      <div
                        key={dev.id}
                        onClick={() => setSelectedMobileDevice(dev)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          selectedMobileDevice?.id === dev.id
                            ? 'bg-[#18181f] border-[#D4AF37]'
                            : 'bg-[#121215] border-[#23232a]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <b className="text-xs text-white truncate max-w-[170px]">{dev.name}</b>
                          <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                            {dev.attributes.plateNumber || 'MÓVIL'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1 font-mono text-white">
                            <Gauge className="w-3 h-3 text-[#D4AF37]" />
                            {pos ? pos.speed.toFixed(0) : 0} km/h
                          </span>
                          <span className={dev.attributes.ignition ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                            {dev.attributes.ignition ? 'MOTOR ON' : 'MOTOR OFF'}
                          </span>
                          <span className="text-zinc-400">{dev.attributes.batteryLevel}%</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Acciones Rápidas del Dispositivo Seleccionado */}
                  {selectedMobileDevice && (
                    <div className="mt-3 p-3 bg-[#141418] rounded-xl border border-[#D4AF37]/40 space-y-2">
                      <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                        Comando Remoto: {selectedMobileDevice.name}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => onSendCommand(selectedMobileDevice, selectedMobileDevice.attributes.fuelCutoff ? 'engineResume' : 'engineStop')}
                          className={`py-2 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                            selectedMobileDevice.attributes.fuelCutoff
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{selectedMobileDevice.attributes.fuelCutoff ? 'Restaurar' : 'Corte Motor'}</span>
                        </button>
                        <button
                          onClick={() => onSendCommand(selectedMobileDevice, 'armAlarm')}
                          className="py-2 px-2 bg-[#1f1f24] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] rounded-lg text-[10px] font-semibold"
                        >
                          Alarma SOS
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeScreen === 'map' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <b className="text-xs text-white">Mapa Satelital Móvil</b>
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">
                    Renderizado nativo MapLibre GL con soporte vectorial y offline caching en Flutter.
                  </p>
                </div>
              )}

              {activeScreen === 'tracker' && (
                <div className="space-y-3 p-1">
                  <div className="bg-[#141418] border border-[#D4AF37]/40 rounded-xl p-3 text-center space-y-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <b className="text-xs text-white block">CEDRICK GPS TRACKER</b>
                    <p className="text-[10px] text-zinc-400">
                      Módulo nativo de emisión en segundo plano activo.
                    </p>
                    <div className="p-2 bg-[#050505] rounded-lg font-mono text-[10px] text-[#D4AF37]">
                      Puerto 5055 • HTTP OsmAnd
                    </div>
                  </div>
                </div>
              )}

              {activeScreen === 'alerts' && (
                <div className="space-y-2">
                  <b className="text-xs text-white block mb-2">Notificaciones Push FCM</b>
                  <div className="p-2 bg-[#141418] rounded-lg border border-[#23232a] text-[10px] text-zinc-300">
                    <span className="text-[#D4AF37] font-bold block">Geocerca Aeropuerto</span>
                    Ingreso confirmado a zona segura.
                  </div>
                  <div className="p-2 bg-[#141418] rounded-lg border border-[#23232a] text-[10px] text-zinc-300">
                    <span className="text-amber-400 font-bold block">Velocidad Elevada</span>
                    Toyota Fortuner superó 80 km/h.
                  </div>
                </div>
              )}

              {activeScreen === 'profile' && (
                <div className="space-y-3 p-2 text-xs">
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-[#D4AF37] text-black font-bold mx-auto flex items-center justify-center text-sm mb-1">
                      JD
                    </div>
                    <b className="text-white block">Johnatan Cabrales</b>
                    <span className="text-[10px] text-zinc-500 font-mono">ID: ADMIN-COL-001</span>
                  </div>
                  <div className="p-2.5 bg-[#141418] rounded-lg border border-[#23232a] space-y-1.5 text-[11px] text-zinc-300">
                    <div className="flex justify-between">
                      <span>Servidor Traccar:</span>
                      <span className="text-[#D4AF37] font-mono">cedrickgps.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ley 1581 Colombia:</span>
                      <span className="text-emerald-400">Aceptado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de Navegación Inferior Móvil (Bottom Navigation Bar) */}
            <div className="bg-[#050505] border-t border-[#23232a] px-2 py-1.5 flex items-center justify-around z-20">
              {[
                { id: 'devices', label: 'Flota', icon: Shield },
                { id: 'map', label: 'Mapa', icon: MapPin },
                { id: 'tracker', label: 'Tracker', icon: Radio },
                { id: 'alerts', label: 'Alertas', icon: Bell },
                { id: 'profile', label: 'Perfil', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveScreen(tab.id as any)}
                    className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                      isSelected ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel Lateral de Especificaciones Técnicas Móviles */}
          <div className="max-w-md space-y-4">
            <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-5 shadow-2xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                Especificaciones de Distribución Móvil
              </h3>

              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex justify-between p-2 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                  <span className="text-zinc-400">Framework:</span>
                  <span className="font-mono text-white">Flutter 3.x / Dart (Android & iOS)</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                  <span className="text-zinc-400">Paquete Android:</span>
                  <span className="font-mono text-[#D4AF37]">com.cedrickgps.app</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                  <span className="text-zinc-400">Formatos Compilables:</span>
                  <span className="font-mono text-white">APK Release / AAB / iOS IPA</span>
                </div>
                <div className="flex justify-between p-2 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                  <span className="text-zinc-400">Servicio en Background:</span>
                  <span className="text-emerald-400 font-bold">FOREGROUND_SERVICE_LOCATION</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
              <b className="text-white block">Compatibilidad del Servidor</b>
              <p>
                La aplicación móvil se conecta mediante WebSocket a <code className="text-[#D4AF37]">/api/socket</code> para recibir actualizaciones en tiempo real y realiza llamadas REST a <code className="text-[#D4AF37]">/api/devices</code> y <code className="text-[#D4AF37]">/api/commands/send</code>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Visualizador de Código Flutter */
        <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#23232a]">
            <span className="text-xs font-mono text-[#D4AF37] font-bold">
              mobile/lib/main.dart (Tema Oficial Obsidian & Gold)
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(flutterMainCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f24] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] rounded-lg text-xs font-medium transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar Código'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#0a0a0c] rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed border border-[#1f1f24]">
            {flutterMainCode}
          </pre>
        </div>
      )}
    </div>
  );
};

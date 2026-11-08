/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MapView } from './components/MapView';
import { DeviceList } from './components/DeviceList';
import { TrackerMode } from './components/TrackerMode';
import { HistoryPlayback } from './components/HistoryPlayback';
import { GeofenceManager } from './components/GeofenceManager';
import { GroupsAndPrivacy } from './components/GroupsAndPrivacy';
import { MobileSimulator } from './components/MobileSimulator';
import { EcosystemArchitecture } from './components/EcosystemArchitecture';
import { IntegrationsPanel } from './components/IntegrationsPanel';
import { AddDeviceModal } from './components/AddDeviceModal';
import { CommandModal } from './components/CommandModal';
import { Device, Position, Geofence, Group, NotificationAlert } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [devices, setDevices] = useState<Device[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Modales
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandDevice, setCommandDevice] = useState<Device | null>(null);

  // Historial Playback
  const [historyPositions, setHistoryPositions] = useState<Position[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isHistoryPlaying, setIsHistoryPlaying] = useState<boolean>(false);

  // Notificación toast rápida
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Carga inicial de datos desde la API REST Traccar de CEDRICK GPS
  const fetchData = async () => {
    try {
      const [devRes, posRes, geoRes, grpRes, notifRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/positions'),
        fetch('/api/geofences'),
        fetch('/api/groups'),
        fetch('/api/notifications')
      ]);

      if (devRes.ok) {
        const devData = await devRes.json();
        setDevices(devData);
        if (!selectedDevice && devData.length > 0) {
          setSelectedDevice(devData[0]);
        }
      }

      if (posRes.ok) setPositions(await posRes.json());
      if (geoRes.ok) setGeofences(await geoRes.json());
      if (grpRes.ok) setGroups(await grpRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (e) {
      console.error('Error al conectar con el servidor CEDRICK GPS:', e);
    }
  };

  // Cargar ruta histórica para reproducción
  const fetchHistory = async (dev: Device) => {
    try {
      const res = await fetch(`/api/reports/route?deviceId=${dev.id}`);
      if (res.ok) {
        const histData = await res.json();
        setHistoryPositions(histData);
        setHistoryIndex(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Control de animación del Scrubber en Historial
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHistoryPlaying && historyPositions.length > 0) {
      timer = setInterval(() => {
        setHistoryIndex(prev => {
          if (prev >= historyPositions.length - 1) {
            setIsHistoryPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isHistoryPlaying, historyPositions]);

  // Manejar envío de comando telemático (Corte motor, etc.)
  const handleSendCommand = async (device: Device, type: string) => {
    try {
      const res = await fetch('/api/commands/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: device.id, type })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        fetchData();
      }
    } catch (e) {
      showToast('Error al enviar comando al vehículo');
    }
  };

  // Manejar creación de nuevo dispositivo
  const handleAddDevice = async (deviceData: any) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      if (res.ok) {
        showToast(`Dispositivo "${deviceData.name}" vinculado exitosamente`);
        fetchData();
      }
    } catch (e) {
      showToast('Error al vincular dispositivo');
    }
  };

  // Manejar creación de geocerca
  const handleAddGeofence = async (geoData: Partial<Geofence>) => {
    try {
      const res = await fetch('/api/geofences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geoData)
      });
      if (res.ok) {
        showToast(`Geocerca "${geoData.name}" creada y armada`);
        fetchData();
      }
    } catch (e) {
      showToast('Error al guardar geocerca');
    }
  };

  // Manejar eliminación de geocerca
  const handleDeleteGeofence = async (id: number) => {
    try {
      await fetch(`/api/geofences/${id}`, { method: 'DELETE' });
      showToast('Geocerca eliminada');
      fetchData();
    } catch (e) {
      showToast('Error al eliminar geocerca');
    }
  };

  // Manejar creación de grupo
  const handleAddGroup = async (groupData: Partial<Group>) => {
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      if (res.ok) {
        showToast(`Grupo "${groupData.name}" creado con éxito`);
        fetchData();
      }
    } catch (e) {
      showToast('Error al crear grupo');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
      setNotifications([]);
      showToast('Alertas limpiadas');
    } catch (e) {
      console.error(e);
    }
  };

  const onlineDevicesCount = devices.filter(d => d.status === 'online').length;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Toast Flotante */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#18181f] border border-[#D4AF37] text-white px-4 py-3 rounded-xl shadow-2xl shadow-black text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Central con Navegación y Telemetría */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onlineCount={onlineDevicesCount}
        totalDevices={devices.length}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        isTrackingActive={activeTab === 'tracker'}
        onOpenTracker={() => setActiveTab('tracker')}
      />

      {/* Área Principal de Contenido según Pestaña Activa */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-6.5rem)] overflow-hidden">
            <DeviceList
              devices={devices}
              positions={positions}
              selectedDevice={selectedDevice}
              onSelectDevice={(dev) => setSelectedDevice(dev)}
              onOpenAddModal={() => setIsAddDeviceOpen(true)}
              onSendCommand={(dev, type) => handleSendCommand(dev, type)}
              onShowHistory={(dev) => {
                setSelectedDevice(dev);
                fetchHistory(dev);
                setActiveTab('history');
              }}
            />
            <div className="flex-1 relative h-full">
              <MapView
                devices={devices}
                positions={positions}
                geofences={geofences}
                selectedDevice={selectedDevice}
                onSelectDevice={(dev) => setSelectedDevice(dev)}
                onSendCommand={(dev, type) => handleSendCommand(dev, type)}
              />
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="flex-1 overflow-y-auto">
            <TrackerMode
              onPositionSent={(pos) => {
                fetchData();
              }}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 flex flex-col h-[calc(100vh-6.5rem)] overflow-hidden">
            <div className="h-64 sm:h-72 overflow-y-auto border-b border-[#23232a]">
              <HistoryPlayback
                devices={devices}
                selectedDevice={selectedDevice}
                historyPositions={historyPositions}
                currentIndex={historyIndex}
                isPlaying={isHistoryPlaying}
                onTogglePlay={() => setIsHistoryPlaying(!isHistoryPlaying)}
                onSeek={(idx) => setHistoryIndex(idx)}
                onSelectDevice={(dev) => {
                  setSelectedDevice(dev);
                  fetchHistory(dev);
                }}
              />
            </div>
            <div className="flex-1 relative">
              <MapView
                devices={devices}
                positions={positions}
                geofences={geofences}
                selectedDevice={selectedDevice}
                onSelectDevice={(dev) => setSelectedDevice(dev)}
                onSendCommand={(dev, type) => handleSendCommand(dev, type)}
                historyTrail={historyPositions}
                historyCurrentIndex={historyIndex}
              />
            </div>
          </div>
        )}

        {activeTab === 'geofences' && (
          <div className="flex-1 overflow-y-auto">
            <GeofenceManager
              geofences={geofences}
              onAddGeofence={handleAddGeofence}
              onDeleteGeofence={handleDeleteGeofence}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="flex-1 overflow-y-auto">
            <GroupsAndPrivacy
              groups={groups}
              onAddGroup={handleAddGroup}
            />
          </div>
        )}

        {activeTab === 'mobile-app' && (
          <div className="flex-1 overflow-y-auto">
            <MobileSimulator
              devices={devices}
              positions={positions}
              onSendCommand={(dev, type) => handleSendCommand(dev, type)}
            />
          </div>
        )}

        {activeTab === 'ecosystem' && (
          <div className="flex-1 overflow-y-auto">
            <EcosystemArchitecture />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="flex-1 overflow-y-auto">
            <IntegrationsPanel />
          </div>
        )}
      </main>

      {/* Modales */}
      <AddDeviceModal
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        onAddDevice={handleAddDevice}
      />

      <CommandModal
        device={commandDevice}
        isOpen={isCommandOpen}
        onClose={() => {
          setIsCommandOpen(false);
          setCommandDevice(null);
        }}
        onSendCommand={handleSendCommand}
      />
    </div>
  );
}

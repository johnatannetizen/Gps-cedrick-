import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Device, Position, Geofence } from '../types';
import { 
  Layers, 
  Crosshair, 
  Navigation, 
  Zap, 
  Battery, 
  MapPin, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface MapViewProps {
  devices: Device[];
  positions: Position[];
  geofences: Geofence[];
  selectedDevice: Device | null;
  onSelectDevice: (device: Device) => void;
  onSendCommand: (device: Device, type: string) => void;
  historyTrail?: Position[];
  historyCurrentIndex?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  devices,
  positions,
  geofences,
  selectedDevice,
  onSelectDevice,
  onSendCommand,
  historyTrail,
  historyCurrentIndex
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const geofenceLayersRef = useRef<L.LayerGroup | null>(null);
  const historyPolylineRef = useRef<L.Polyline | null>(null);
  const historyCarMarkerRef = useRef<L.Marker | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const [mapLayerType, setMapLayerType] = useState<'dark' | 'satellite' | 'streets'>('dark');

  // URL de capas de mapas compatibles con OpenStreetMap
  const tileProviders = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };

  // Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centro inicial: Bogotá, Colombia
    const map = L.map(mapContainerRef.current, {
      center: [4.6534, -74.0837],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const provider = tileProviders[mapLayerType];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;
    geofenceLayersRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cambio de capa base de mapa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const provider = tileProviders[mapLayerType];
    const newLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: 19
    }).addTo(map);

    baseTileLayerRef.current = newLayer;
  }, [mapLayerType]);

  // Actualización de Geocercas
  useEffect(() => {
    const layerGroup = geofenceLayersRef.current;
    if (!layerGroup) return;
    layerGroup.clearLayers();

    geofences.forEach(gf => {
      if (gf.attributes?.type === 'circle' && gf.attributes.centerLat && gf.attributes.centerLon) {
        const circle = L.circle([gf.attributes.centerLat, gf.attributes.centerLon], {
          radius: gf.attributes.radius || 1000,
          color: gf.color || '#D4AF37',
          fillColor: gf.color || '#D4AF37',
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '4, 4'
        });
        circle.bindTooltip(`<b>${gf.name}</b><br>${gf.description}`, {
          sticky: true,
          className: 'bg-black text-[#D4AF37] border border-[#27272a] p-1 rounded font-sans text-xs'
        });
        circle.addTo(layerGroup);
      } else if (gf.area && gf.area.startsWith('POLYGON')) {
        // Parse simple WKT POLYGON((lat lon, ...))
        try {
          const coordsStr = gf.area.replace('POLYGON((', '').replace('))', '');
          const points = coordsStr.split(',').map(pair => {
            const [lat, lon] = pair.trim().split(' ').map(Number);
            return [lat, lon] as [number, number];
          });
          const polygon = L.polygon(points, {
            color: gf.color || '#D4AF37',
            fillColor: gf.color || '#D4AF37',
            fillOpacity: 0.12,
            weight: 2
          });
          polygon.bindTooltip(`<b>${gf.name}</b>`, {
            sticky: true,
            className: 'bg-black text-[#D4AF37] border border-[#27272a] p-1 rounded font-sans text-xs'
          });
          polygon.addTo(layerGroup);
        } catch (e) {
          console.error('Error al dibujar polígono:', e);
        }
      }
    });
  }, [geofences]);

  // Actualización de Marcadores de Dispositivos
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    devices.forEach(dev => {
      const pos = positions.find(p => p.deviceId === dev.id);
      if (!pos) return;

      const isSelected = selectedDevice?.id === dev.id;
      const isOnline = dev.status === 'online';
      const isTracker = dev.category === 'phone';

      // Icono SVG personalizado de CEDRICK GPS con rotación según rumbo
      const iconHtml = `
        <div class="relative flex items-center justify-center transition-transform duration-300" style="transform: rotate(${pos.course}deg);">
          <div class="w-10 h-10 rounded-full flex items-center justify-center ${
            isSelected 
              ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/50 ring-4 ring-[#D4AF37]/30 scale-110' 
              : isOnline
                ? 'bg-[#141418] text-[#D4AF37] border-2 border-[#D4AF37] shadow-md shadow-black'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-600'
          }">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          ${dev.attributes.fuelCutoff ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[9px] text-white font-bold ring-2 ring-black">
              !
            </div>
          ` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'cedrick-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22]
      });

      if (markersRef.current[dev.id]) {
        markersRef.current[dev.id].setLatLng([pos.latitude, pos.longitude]);
        markersRef.current[dev.id].setIcon(customIcon);
      } else {
        const marker = L.marker([pos.latitude, pos.longitude], { icon: customIcon }).addTo(map);
        marker.on('click', () => onSelectDevice(dev));
        markersRef.current[dev.id] = marker;
      }

      // Contenido del Popup con diseño Obsidian/Gold
      const popupContent = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 6px; margin-bottom: 8px;">
            <b style="color: #FFFFFF; font-size: 13px;">${dev.name}</b>
            <span style="font-size: 10px; font-family: monospace; color: ${isOnline ? '#10B981' : '#71717A'}; font-weight: bold;">
              ${isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div style="font-size: 11px; color: #A1A1AA; line-height: 1.6;">
            <div>Placa / ID: <span style="color: #D4AF37; font-family: monospace;">${dev.attributes.plateNumber || dev.uniqueId}</span></div>
            <div>Velocidad: <b style="color: #FFFFFF;">${pos.speed.toFixed(1)} km/h</b></div>
            <div>Ignición: <span style="color: ${dev.attributes.ignition ? '#10B981' : '#EF4444'}; font-weight: bold;">${dev.attributes.ignition ? 'ENCENDIDO' : 'APAGADO'}</span></div>
            <div>Batería: <span style="color: #FFFFFF;">${pos.attributes.batteryLevel}%</span></div>
            <div>Rumbo: <span style="color: #FFFFFF;">${pos.course}°</span> | Satélites: <span style="color: #FFFFFF;">${pos.attributes.satellites || 12}</span></div>
            <div style="margin-top: 4px; font-size: 10px; color: #71717A;">${pos.address}</div>
          </div>
          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #27272a; display: flex; gap: 6px;">
            <button id="btn-fuel-${dev.id}" style="flex: 1; padding: 5px 8px; font-size: 10px; font-weight: bold; background: ${dev.attributes.fuelCutoff ? '#10B981' : '#EF4444'}; color: #FFFFFF; border: none; border-radius: 6px; cursor: pointer;">
              ${dev.attributes.fuelCutoff ? 'Restaurar Motor' : 'Corte de Motor'}
            </button>
          </div>
        </div>
      `;

      const marker = markersRef.current[dev.id];
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-fuel-${dev.id}`);
        if (btn) {
          btn.onclick = () => {
            onSendCommand(dev, dev.attributes.fuelCutoff ? 'engineResume' : 'engineStop');
            marker.closePopup();
          };
        }
      });
    });
  }, [devices, positions, selectedDevice]);

  // Centrar cuando se selecciona un dispositivo
  useEffect(() => {
    if (!selectedDevice || !mapInstanceRef.current) return;
    const pos = positions.find(p => p.deviceId === selectedDevice.id);
    if (pos) {
      mapInstanceRef.current.setView([pos.latitude, pos.longitude], 15, { animate: true });
      const marker = markersRef.current[selectedDevice.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedDevice]);

  // Trazado de Historial y Reproducción Animada
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (historyTrail && historyTrail.length > 0) {
      const latlngs = historyTrail.map(p => [p.latitude, p.longitude] as [number, number]);

      if (!historyPolylineRef.current) {
        historyPolylineRef.current = L.polyline(latlngs, {
          color: '#D4AF37',
          weight: 4,
          opacity: 0.85,
          dashArray: '6, 6'
        }).addTo(map);
      } else {
        historyPolylineRef.current.setLatLngs(latlngs);
      }

      // Marcador de auto en movimiento para el scrubber
      if (typeof historyCurrentIndex === 'number' && historyTrail[historyCurrentIndex]) {
        const curr = historyTrail[historyCurrentIndex];
        const carIcon = L.divIcon({
          className: 'history-car',
          html: `
            <div class="w-8 h-8 rounded-full bg-[#D4AF37] text-black flex items-center justify-center shadow-xl ring-4 ring-[#D4AF37]/40" style="transform: rotate(${curr.course}deg);">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        if (!historyCarMarkerRef.current) {
          historyCarMarkerRef.current = L.marker([curr.latitude, curr.longitude], { icon: carIcon }).addTo(map);
        } else {
          historyCarMarkerRef.current.setLatLng([curr.latitude, curr.longitude]);
          historyCarMarkerRef.current.setIcon(carIcon);
        }
      }
    } else {
      if (historyPolylineRef.current) {
        map.removeLayer(historyPolylineRef.current);
        historyPolylineRef.current = null;
      }
      if (historyCarMarkerRef.current) {
        map.removeLayer(historyCarMarkerRef.current);
        historyCarMarkerRef.current = null;
      }
    }
  }, [historyTrail, historyCurrentIndex]);

  const fitAllDevices = () => {
    const map = mapInstanceRef.current;
    if (!map || positions.length === 0) return;
    const bounds = L.latLngBounds(positions.map(p => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Contenedor Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Controles Flotantes Superiores en Mapa */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Selector de Capas */}
        <div className="bg-[#141418]/90 backdrop-blur-md border border-[#27272a] rounded-xl p-1 shadow-2xl flex items-center gap-1">
          <button
            onClick={() => setMapLayerType('dark')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapLayerType === 'dark' 
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/30' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Obsidiana
          </button>
          <button
            onClick={() => setMapLayerType('satellite')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapLayerType === 'satellite' 
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/30' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Satélite HD
          </button>
          <button
            onClick={() => setMapLayerType('streets')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mapLayerType === 'streets' 
                ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/30' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            OpenStreetMap
          </button>
        </div>

        {/* Botón Centrar Todos */}
        <button
          onClick={fitAllDevices}
          className="self-end bg-[#141418]/90 backdrop-blur-md border border-[#27272a] hover:border-[#D4AF37]/50 text-zinc-300 hover:text-[#D4AF37] p-2 rounded-xl shadow-2xl transition-all flex items-center gap-2 text-xs font-medium"
          title="Centrar en toda la flota"
        >
          <Crosshair className="w-4 h-4 text-[#D4AF37]" />
          <span className="hidden sm:inline">Ver Flota Completa</span>
        </button>
      </div>

      {/* Leyenda y Coordenadas Rápidas Inferior */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-[#0e0e11]/85 backdrop-blur-md border border-[#23232a] px-3 py-1.5 rounded-lg text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
          <span>Vehículo Activo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Ignición On</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Geocerca Activa</span>
        </div>
        <span className="text-zinc-600">|</span>
        <span className="text-zinc-300">WGS84 • Colombia EPSG:3116</span>
      </div>
    </div>
  );
};

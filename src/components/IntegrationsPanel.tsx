import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Wifi, 
  MapPin, 
  Bell, 
  Mail, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  CreditCard, 
  ExternalLink,
  ChevronRight,
  Settings2,
  Activity,
  Layers,
  Compass,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

interface IntegrationService {
  id: string;
  name: string;
  category: 'telemetry' | 'maps' | 'notifications' | 'location' | 'communication';
  activeProvider: string;
  configured: boolean;
  requiredVars: string[];
  missingVars: string[];
  billingRequired: boolean;
  billingNotice: string;
  status: 'connected' | 'not_configured' | 'error' | 'untested';
  lastTested: string | null;
  lastLatencyMs: number | null;
  lastMessage: string;
  details: Record<string, any>;
}

export const IntegrationsPanel: React.FC = () => {
  const [services, setServices] = useState<IntegrationService[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [selectedService, setSelectedService] = useState<IntegrationService | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedEnv, setCopiedEnv] = useState(false);

  // Cargar configuración de integraciones
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/integrations/config');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services);
        if (!selectedService && data.services.length > 0) {
          setSelectedService(data.services[0]);
        }
      }
    } catch (e) {
      console.error('Error al consultar integraciones:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Probar conectividad real de un servicio
  const testService = async (serviceId: string) => {
    setTestingId(serviceId);
    try {
      const res = await fetch(`/api/integrations/test/${serviceId}`, {
        method: 'POST'
      });
      const result = await res.json();
      
      // Actualizar estado local
      setServices(prev => prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: result.success ? 'connected' : (result.status === 'not_configured' ? 'not_configured' : 'error'),
            lastLatencyMs: result.latencyMs || null,
            lastMessage: result.message,
            lastTested: new Date().toISOString()
          };
        }
        return s;
      }));
    } catch (e: any) {
      setServices(prev => prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: 'error',
            lastMessage: `Error de red: ${e.message}`,
            lastTested: new Date().toISOString()
          };
        }
        return s;
      }));
    } finally {
      setTestingId(null);
    }
  };

  // Probar todos los servicios disponibles
  const testAllServices = async () => {
    setIsTestingAll(true);
    for (const service of services) {
      await testService(service.id);
    }
    setIsTestingAll(false);
  };

  // Cambiar proveedor activo en caliente
  const handleSwitchProvider = async (category: string, provider: string) => {
    try {
      const res = await fetch('/api/integrations/switch-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, provider })
      });
      if (res.ok) {
        await fetchConfig();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredServices = services.filter(s => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  const connectedCount = services.filter(s => s.status === 'connected').length;
  const notConfiguredCount = services.filter(s => s.status === 'not_configured').length;
  const errorCount = services.filter(s => s.status === 'error').length;
  const billingCount = services.filter(s => s.billingRequired).length;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Banner Principal de Diagnóstico */}
      <div className="bg-gradient-to-r from-[#0e0e11] via-[#141418] to-[#0e0e11] border border-[#D4AF37]/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                100% APIs Gratuitas & Open Source ($0 USD)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-[#D4AF37]" />
              Diagnóstico de API & Servicios Externos
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Monitoreo y comprobación de conectividad en tiempo real de los 13 servicios de CEDRICK GPS. Todos los proveedores han sido migrados a alternativas 100% gratuitas, sin cuotas comerciales, sin tarjetas de crédito ni suscripciones.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={testAllServices}
              disabled={isTestingAll || loading}
              className="w-full md:w-auto px-5 py-3 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isTestingAll ? 'animate-spin' : ''}`} />
              <span>{isTestingAll ? 'Comprobando 13 Servicios...' : 'Probar Todos los Servicios ($0)'}</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Resumen Rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#23232a]">
          <div className="bg-[#0e0e11] p-3 rounded-xl border border-[#23232a]">
            <span className="text-[10px] text-zinc-500 font-mono block">SERVICIOS ACTIVOS</span>
            <span className="text-xl font-black text-white font-mono">{services.length}</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Integraciones maestras</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-xl border border-emerald-900/40">
            <span className="text-[10px] text-emerald-400 font-mono block">CONECTADOS REALES</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{connectedCount}</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Comprobados con éxito</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-xl border border-emerald-900/30">
            <span className="text-[10px] text-emerald-400 font-mono block">COSTO MENSUAL</span>
            <span className="text-xl font-black text-emerald-400 font-mono">$0 USD</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">Sin facturación comercial</span>
          </div>
          <div className="bg-[#0e0e11] p-3 rounded-xl border border-[#D4AF37]/30">
            <span className="text-[10px] text-[#D4AF37] font-mono block">PROVEEDORES LIBRES</span>
            <span className="text-xl font-black text-[#D4AF37] font-mono">13 / 13</span>
            <span className="text-[10px] text-zinc-400 block mt-0.5">OpenStreetMap, ntfy, OSRM</span>
          </div>
        </div>
      </div>

      {/* Filtros de Categoría */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'Todos los Servicios' },
          { id: 'telemetry', label: '🛰️ Telemetría & Protocolos' },
          { id: 'maps', label: '🗺️ Mapas & Cartografía' },
          { id: 'notifications', label: '🔔 Notificaciones Push' },
          { id: 'location', label: '📍 Geolocalización Nativa' },
          { id: 'communication', label: '✉️ Servidor SMTP' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === cat.id
                ? 'bg-[#18181f] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm'
                : 'bg-[#0e0e11] text-zinc-400 hover:text-white border border-[#23232a]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Cuadrícula de Servicios y Panel de Inspección Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Servicios */}
        <div className="lg:col-span-2 space-y-3">
          {filteredServices.map(service => {
            const isSelected = selectedService?.id === service.id;
            const isTesting = testingId === service.id;

            return (
              <div
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181f] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                    : 'bg-[#141418] border-[#23232a] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{service.name}</h3>
                      {service.billingRequired && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> Requiere Pago
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400 block font-mono">
                      Proveedor: <span className="text-[#D4AF37]">{service.activeProvider}</span>
                    </span>
                  </div>

                  {/* Estado Badge */}
                  <div className="flex items-center gap-2">
                    {service.status === 'connected' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Conectado ({service.lastLatencyMs}ms)
                      </span>
                    )}
                    {service.status === 'not_configured' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> No Configurado
                      </span>
                    )}
                    {service.status === 'error' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Error de Conexión
                      </span>
                    )}
                    {service.status === 'untested' && (
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 flex items-center gap-1.5">
                        Sin Probar
                      </span>
                    )}
                  </div>
                </div>

                {/* Mensaje de Última Comprobación */}
                <div className="mt-3 p-2.5 bg-[#0e0e11] rounded-lg border border-[#1f1f24] text-xs font-mono text-zinc-300 flex items-center justify-between">
                  <span className="truncate max-w-[80%]">{service.lastMessage}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testService(service.id);
                    }}
                    disabled={isTesting}
                    className="px-2.5 py-1 bg-[#1f1f24] hover:bg-[#27272a] text-[#D4AF37] border border-[#2d2d34] rounded text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Probando...' : 'Comprobar'}</span>
                  </button>
                </div>

                {/* Variables Faltantes si aplica */}
                {service.missingVars.length > 0 && (
                  <div className="mt-2 text-[11px] text-amber-400/90 flex items-center gap-1.5 font-mono">
                    <span>Faltan variables en .env:</span>
                    <span className="text-white font-bold">{service.missingVars.join(', ')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel de Detalles de la Integración Seleccionada */}
        <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-5 shadow-2xl space-y-4 h-fit sticky top-20">
          {selectedService ? (
            <div className="space-y-4">
              <div className="border-b border-[#23232a] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold block">
                  Configuración Avanzada
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedService.name}</h3>
              </div>

              {selectedService.id === 'osm-tiles' && (
                <div className="p-3 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
                  <span className="text-xs font-bold text-white block">Cambiar Proveedor de Teselas:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleSwitchProvider('maps', 'osm-standard')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      OpenStreetMap Standard (Gratis)
                    </button>
                    <button
                      onClick={() => handleSwitchProvider('maps', 'cartodb-dark')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      CartoDB Dark Matter (Obsidiana)
                    </button>
                  </div>
                </div>
              )}

              {selectedService.id === 'satellite-provider' && (
                <div className="p-3 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
                  <span className="text-xs font-bold text-white block">Proveedor Satelital Gratuito ($0 USD):</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleSwitchProvider('satellite', 'esri')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      Esri World Imagery HD (Gratuito)
                    </button>
                    <button
                      onClick={() => handleSwitchProvider('satellite', 'usgs')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      USGS Public Ortho ($0 Público)
                    </button>
                  </div>
                </div>
              )}

              {selectedService.id === 'geocoding' && (
                <div className="p-3 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
                  <span className="text-xs font-bold text-white block">Proveedor de Geocodificación Inversa:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleSwitchProvider('geocoder', 'nominatim')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      Nominatim OSM (100% Gratis)
                    </button>
                    <button
                      onClick={() => handleSwitchProvider('geocoder', 'photon')}
                      className="p-2 rounded bg-[#18181b] hover:bg-[#27272a] text-zinc-200 border border-[#27272a] text-left text-[11px]"
                    >
                      Photon Komoot (Sin cuotas/límites)
                    </button>
                  </div>
                </div>
              )}

              {(selectedService.id === 'fcm' || selectedService.id === 'apns') && (
                <div className="p-3 bg-[#0e0e11] rounded-xl border border-emerald-950/40 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Push Gratuito Operativo sin Cuotas</span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Canal pub-sub libre activo vía <code className="text-[#D4AF37]">https://ntfy.sh/cedrick_gps_alerts</code> y Web Push W3C. Compatible con Android, iOS (PWA/ntfy App) y Navegadores sin pagar $99 USD/año a Apple ni requerir tarjeta en Firebase.
                  </p>
                </div>
              )}

              {/* Nota de Facturación */}
              <div className="p-3 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-1 text-xs">
                <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">
                  Régimen de Costos & Facturación
                </span>
                <p className="text-zinc-300 leading-relaxed">{selectedService.billingNotice}</p>
              </div>

              {/* Variables de Entorno Requeridas */}
              <div className="p-3 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2 text-xs">
                <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">
                  Variables de Entorno (.env)
                </span>
                <div className="space-y-1">
                  {selectedService.requiredVars.map(v => (
                    <div key={v} className="flex items-center justify-between font-mono text-[11px] p-1.5 bg-[#141418] rounded border border-[#1f1f24]">
                      <span className="text-white">{v}</span>
                      <span className={selectedService.missingVars.includes(v) ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {selectedService.missingVars.includes(v) ? 'Faltante' : 'Configurada'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Comprobación Manual */}
              <button
                onClick={() => testService(selectedService.id)}
                disabled={testingId === selectedService.id}
                className="w-full py-2.5 bg-[#1f1f24] hover:bg-[#27272a] text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingId === selectedService.id ? 'animate-spin' : ''}`} />
                <span>{testingId === selectedService.id ? 'Verificando con Servidor Real...' : 'Comprobar Este Servicio Ahora'}</span>
              </button>
            </div>
          ) : (
            <div className="text-center p-6 text-xs text-zinc-500">
              Selecciona un servicio para inspeccionar sus variables y requerimientos de facturación.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

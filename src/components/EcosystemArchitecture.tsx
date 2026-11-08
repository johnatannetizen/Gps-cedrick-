import React, { useState } from 'react';
import { 
  Cpu, 
  GitBranch, 
  CheckCircle2, 
  Play, 
  Server, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Download, 
  FileCode,
  Terminal,
  Activity
} from 'lucide-react';
import { TestResult } from '../types';

export const EcosystemArchitecture: React.FC = () => {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [testSummary, setTestSummary] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<'architecture' | 'docker' | 'install'>('architecture');

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/test/run', { method: 'POST' });
      const data = await res.json();
      setTestResults(data.results);
      setTestSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningTests(false);
    }
  };

  const repositories = [
    {
      name: 'traccar (Servidor Backend Central)',
      url: 'https://github.com/johnatannetizen/traccar',
      tech: 'Java 21 / Netty / Gradle / PostgreSQL',
      version: 'Traccar Server 6.5+ Core',
      role: 'Motor central de telemetría, protocolos GPS (5055, 5023, 5001, 5027), geocodificación y eventos en tiempo real.'
    },
    {
      name: 'traccar-web (Panel Web)',
      url: 'https://github.com/johnatannetizen/traccar-web',
      tech: 'React 19 / MapLibre GL / Material UI / Vite / Tailwind',
      version: 'Traccar Web 6.17.0',
      role: 'Monitoreo en vivo, geocercas, gestión de flotas, reproducción de recorridos y reportes telemáticos.'
    },
    {
      name: 'traccar-manager (App Móvil)',
      url: 'https://github.com/johnatannetizen/traccar-manager',
      tech: 'Flutter 3.x / Dart / Android SDK / iOS CocoaPods',
      version: 'Manager 6.2.4+87',
      role: 'Gestión móvil de vehículos, visualización satelital, biometría y notificaciones push FCM.'
    },
    {
      name: 'CEDRICK GPS TRACKER (Módulo Adicional)',
      url: 'Módulo Ecosistema CEDRICK',
      tech: 'Geolocalización Nativa / Background Service / Puerto 5055',
      version: 'v1.0.0 Pro',
      role: 'Convierte cualquier smartphone en rastreador GPS continuo con buffer offline y control de batería.'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabecera */}
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
            Auditoría de Repositorios y Verificación de Integración
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#D4AF37]" />
            Arquitectura del Ecosistema CEDRICK GPS
          </h2>
        </div>

        {/* Botón Ejecutar Pruebas */}
        <button
          onClick={runTests}
          disabled={isRunningTests}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-black rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#D4AF37]/20"
        >
          {isRunningTests ? (
            <Activity className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          <span>{isRunningTests ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas de Integración'}</span>
        </button>
      </div>

      {/* Resultados de la Suite de Pruebas de Integración */}
      {testResults && (
        <div className="bg-[#141418] border border-[#D4AF37]/40 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <b className="text-sm text-white">Resultado de Pruebas de Integración (Fase 11)</b>
            </div>
            <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#0e0e11] px-2.5 py-1 rounded-md border border-[#27272a]">
              {testSummary}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            {testResults.map((t, idx) => (
              <div key={idx} className="p-2.5 bg-[#0e0e11] rounded-lg border border-[#1f1f24] flex items-center justify-between">
                <span className="text-zinc-300 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {t.name}
                </span>
                <span className="text-zinc-500 shrink-0">{t.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventario de Repositorios Oficiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repositories.map((repo, idx) => (
          <div key={idx} className="bg-[#141418] border border-[#23232a] rounded-xl p-5 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-[#D4AF37] uppercase font-bold block mb-1">
                  {repo.version}
                </span>
                <h3 className="text-sm font-bold text-white">{repo.name}</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold shrink-0">
                Auditado
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">{repo.role}</p>

            <div className="p-2.5 bg-[#0e0e11] rounded-lg border border-[#1f1f24] text-xs font-mono text-zinc-300">
              <span className="text-zinc-500 block text-[10px]">Pila Tecnológica:</span>
              <span>{repo.tech}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Documentación & Despliegue Docker */}
      <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#23232a] pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Infraestructura Productiva & Despliegue en Servidor
            </h3>
          </div>

          <div className="flex bg-[#0e0e11] border border-[#27272a] p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedDoc('architecture')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedDoc === 'architecture' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Arquitectura
            </button>
            <button
              onClick={() => setSelectedDoc('docker')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedDoc === 'docker' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Docker Compose
            </button>
            <button
              onClick={() => setSelectedDoc('install')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedDoc === 'install' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Instalación VPS
            </button>
          </div>
        </div>

        {selectedDoc === 'docker' && (
          <div className="space-y-3 text-xs font-mono">
            <p className="text-zinc-400">
              Orquestación multi-contenedor para Traccar Java Server + PostgreSQL 16 + Web Nginx:
            </p>
            <pre className="p-4 bg-[#0a0a0c] rounded-xl text-zinc-300 overflow-x-auto leading-relaxed border border-[#1f1f24]">
{`version: '3.8'
services:
  cedrick-db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: cedrick_gps
      POSTGRES_USER: cedrick_admin
      POSTGRES_PASSWORD: \${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  cedrick-server:
    image: traccar/traccar:latest
    depends_on: [cedrick-db]
    ports:
      - "8082:8082"   # REST API & WebSockets
      - "5055:5055"   # CEDRICK GPS TRACKER / OsmAnd
      - "5023:5023"   # Protocolo GT06 / Concox
      - "5001:5001"   # Protocolo Coban
      - "5027:5027"   # Protocolo Teltonika
    volumes:
      - ./server/traccar.xml:/opt/traccar/conf/traccar.xml:ro

  cedrick-web:
    build: ./web
    ports:
      - "80:80"
      - "443:443"
`}
            </pre>
          </div>
        )}

        {selectedDoc === 'architecture' && (
          <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <p>
              El ecosistema <b>CEDRICK GPS</b> opera bajo una arquitectura distribuida de alta disponibilidad:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                <b className="text-[#D4AF37] block mb-1">Capa de Ingestión Multi-Protocolo</b>
                Receptores Netty asíncronos para dispositivos vehiculares (Teltonika, Coban, GT06) y smartphones (puerto 5055 HTTP OsmAnd).
              </div>
              <div className="p-3 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                <b className="text-[#D4AF37] block mb-1">Capa de Procesamiento & Alertas</b>
                Motor de geocercas, cálculo de excesos de velocidad, geocodificación inversa con OpenStreetMap y despacho de notificaciones push.
              </div>
              <div className="p-3 bg-[#0e0e11] rounded-lg border border-[#1f1f24]">
                <b className="text-[#D4AF37] block mb-1">Capa de Presentación Unificada</b>
                Panel Web en React 19 con MapLibre/Leaflet y Aplicación Móvil nativa en Flutter (Android / iOS) compartiendo el mismo backend.
              </div>
            </div>
          </div>
        )}

        {selectedDoc === 'install' && (
          <div className="space-y-3 text-xs font-mono text-zinc-300">
            <p className="text-zinc-400">Comandos para desplegar CEDRICK GPS en un servidor Ubuntu 22.04 / 24.04:</p>
            <pre className="p-4 bg-[#0a0a0c] rounded-xl text-zinc-300 overflow-x-auto leading-relaxed border border-[#1f1f24]">
{`# 1. Clonar estructura del ecosistema CEDRICK GPS
git clone https://github.com/johnatannetizen/traccar.git /opt/cedrick-gps

# 2. Configurar variables de entorno y certificados SSL
cd /opt/cedrick-gps/docker
cp .env.example .env

# 3. Iniciar todos los servicios con Docker Compose
docker compose up -d --build

# 4. Verificar salud del servicio
curl http://localhost:8082/api/server`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Group } from '../types';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Share2, 
  Copy, 
  Check, 
  Lock, 
  FileText, 
  UserX,
  Sparkles
} from 'lucide-react';

interface GroupsAndPrivacyProps {
  groups: Group[];
  onAddGroup: (newGroup: Partial<Group>) => void;
}

export const GroupsAndPrivacy: React.FC<GroupsAndPrivacyProps> = ({
  groups,
  onAddGroup
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'law1581'>('groups');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'fleet' | 'family' | 'security'>('family');

  const handleCopyInvite = (groupId: number) => {
    const code = `CEDRICK-GRP-${groupId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const url = `https://app.cedrickgps.com/invite/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGroup({
      name,
      description,
      type,
      admin: 'admin@cedrickgps.com',
      membersCount: 1,
      sharingConsentLaw1581: true
    });
    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabecera */}
      <div className="bg-[#0e0e11] border border-[#23232a] rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
            Gestión Multi-Usuario y Protección Habeas Data
          </span>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            Familias, Grupos & Privacidad Normativa
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#141418] border border-[#27272a] p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'groups' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Grupos & Familias
            </button>
            <button
              onClick={() => setActiveTab('law1581')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'law1581' ? 'bg-[#D4AF37] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ley 1581 (Colombia)
            </button>
          </div>

          {activeTab === 'groups' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black rounded-xl text-xs font-bold transition-all shadow-md shadow-[#D4AF37]/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear Grupo</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'groups' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(grp => (
            <div key={grp.id} className="bg-[#141418] border border-[#23232a] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    grp.type === 'family' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    grp.type === 'fleet' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {grp.type === 'family' ? 'Círculo Familiar' : 'Flota Corporativa'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{grp.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{grp.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white font-mono">{grp.membersCount}</span>
                  <span className="text-[10px] text-zinc-500 block">Miembros</span>
                </div>
              </div>

              <div className="p-3 bg-[#0e0e11] rounded-lg border border-[#1f1f24] space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Administrador:</span>
                  <span className="text-white font-mono">{grp.admin}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Consentimiento Ley 1581:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado y Firmado
                  </span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Permisos:</span>
                  <span className="text-[#D4AF37]">Ubicación voluntaria y Alertas SOS</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => handleCopyInvite(grp.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1f1f24] hover:bg-[#27272a] text-[#D4AF37] border border-[#2d2d34] rounded-lg text-xs font-semibold transition-all"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedCode ? '¡Enlace de Invitación Copiado!' : 'Generar Invitación Segura'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Cumplimiento Normativo Ley 1581 de 2012 */
        <div className="bg-[#141418] border border-[#23232a] rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#23232a]">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Régimen General de Protección de Datos Personales (Colombia)
              </h3>
              <span className="text-xs text-zinc-400">
                Auditoría Legal según Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
              <b className="text-white block font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                1. Consentimiento Previo e Informado
              </b>
              <p className="text-zinc-400 leading-relaxed">
                Ninguna ubicación o coordenada satelital es emitida sin la autorización activa del usuario. La modalidad CEDRICK GPS TRACKER exige validación voluntaria explícita.
              </p>
            </div>

            <div className="p-4 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
              <b className="text-white block font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                2. Cero Rastreo Oculto o Espía
              </b>
              <p className="text-zinc-400 leading-relaxed">
                El sistema prohíbe estrictamente modos espías. La aplicación en Android e iOS exhibe una notificación persistente con la leyenda "CEDRICK GPS está transmitiendo su ubicación".
              </p>
            </div>

            <div className="p-4 bg-[#0e0e11] rounded-xl border border-[#23232a] space-y-2">
              <b className="text-white block font-bold flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-amber-400" />
                3. Derechos ARCO & Revocación
              </b>
              <p className="text-zinc-400 leading-relaxed">
                Cualquier titular puede revocar en tiempo real el permiso de compartir ubicación o solicitar la supresión completa de su historial telemático de las bases de datos.
              </p>
            </div>
          </div>

          {/* Registro de Auditoría de Consentimientos */}
          <div className="pt-4 border-t border-[#23232a]">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Registro de Trazabilidad y Consentimientos en Colombia
            </h4>
            <div className="bg-[#0e0e11] rounded-xl border border-[#23232a] overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#18181b] text-zinc-400 border-b border-[#27272a]">
                  <tr>
                    <th className="p-3">Titular / Dispositivo</th>
                    <th className="p-3">Fecha y Hora UTC</th>
                    <th className="p-3">IP / Origen</th>
                    <th className="p-3">Estado Legal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f24] text-zinc-300">
                  <tr>
                    <td className="p-3">Carlos Mendoza (KLR-942)</td>
                    <td className="p-3">2026-11-08 08:30:12</td>
                    <td className="p-3">181.129.88.42 (Bogotá)</td>
                    <td className="p-3 text-emerald-400 font-bold">Autorizado Válido</td>
                  </tr>
                  <tr>
                    <td className="p-3">Javier Restrepo (WZE-512)</td>
                    <td className="p-3">2026-11-08 09:14:55</td>
                    <td className="p-3">190.27.144.10 (Medellín)</td>
                    <td className="p-3 text-emerald-400 font-bold">Autorizado Válido</td>
                  </tr>
                  <tr>
                    <td className="p-3">CEDRICK-MOBILE-01 (Móvil)</td>
                    <td className="p-3">2026-11-08 11:20:00</td>
                    <td className="p-3">186.84.90.15 (Cali)</td>
                    <td className="p-3 text-emerald-400 font-bold">Autorizado Válido</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Grupo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#141418] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              Crear Nuevo Círculo o Flota
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre del Grupo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Familia Cabrales o Flota Zona Norte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Propósito / Descripción:</label>
                <input
                  type="text"
                  placeholder="Ej: Monitoreo voluntario y seguridad en traslados"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Tipo de Grupo:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-[#0e0e11] border border-[#27272a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="family">Familiar (Consentimiento individual mutuo)</option>
                  <option value="fleet">Flota Corporativa (Gestión de transporte)</option>
                  <option value="security">Seguridad Privada (Patrullas y escoltas)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#23232a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs rounded-lg shadow-md shadow-[#D4AF37]/20"
                >
                  Guardar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

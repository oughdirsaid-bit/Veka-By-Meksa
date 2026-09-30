import React, { useState } from 'react';
import {
  PVCSystem,
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  CalculationRules,
  StockItem
} from '../types';
import {
  Layers,
  Scissors,
  ShieldCheck,
  Box,
  Settings,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Edit,
  Trash2,
  Sliders,
  DollarSign
} from 'lucide-react';

interface TechnicalCatalogsViewProps {
  activeTab: 'gammes' | 'profilés' | 'quincaillerie' | 'vitrages' | 'accessoires' | 'tarifs' | 'règles' | 'stock';
  systems: PVCSystem[];
  profiles: ProfileItem[];
  hardware: HardwareItem[];
  glass: GlassItem[];
  accessories: AccessoryItem[];
  rules: CalculationRules;
  stock: StockItem[];
  devise?: string;
  onSaveSystems: (systems: PVCSystem[]) => void;
  onSaveProfiles: (profiles: ProfileItem[]) => void;
  onSaveHardware: (hardware: HardwareItem[]) => void;
  onSaveGlass: (glass: GlassItem[]) => void;
  onSaveAccessories: (accessories: AccessoryItem[]) => void;
  onSaveRules: (rules: CalculationRules) => void;
  onSaveStock: (stock: StockItem[]) => void;
  onOpenImport: () => void;
}

export const TechnicalCatalogsView: React.FC<TechnicalCatalogsViewProps> = ({
  activeTab,
  systems,
  profiles,
  hardware,
  glass,
  accessories,
  rules,
  stock,
  devise = 'DH',
  onSaveSystems,
  onSaveProfiles,
  onSaveHardware,
  onSaveGlass,
  onSaveAccessories,
  onSaveRules,
  onSaveStock,
  onOpenImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Quick edit state for profiles
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editPrixAchat, setEditPrixAchat] = useState<string>('');
  const [editPrixVente, setEditPrixVente] = useState<string>('');

  const startEditProfile = (p: ProfileItem) => {
    setEditingProfileId(p.id);
    setEditPrixAchat(p.prixAchatMl !== null ? String(p.prixAchatMl) : '');
    setEditPrixVente(p.prixVenteMl !== null ? String(p.prixVenteMl) : '');
  };

  const saveProfilePrice = (id: string) => {
    const pAchat = editPrixAchat.trim() ? parseFloat(editPrixAchat.replace(',', '.')) : null;
    const pVente = editPrixVente.trim() ? parseFloat(editPrixVente.replace(',', '.')) : null;

    const updated = profiles.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          prixAchatMl: pAchat,
          prixVenteMl: pVente,
          prixRevientMl: pAchat ? Number((pAchat * 1.1).toFixed(2)) : null,
          isConfigured: pAchat !== null && !isNaN(pAchat)
        };
      }
      return p;
    });

    onSaveProfiles(updated);
    setEditingProfileId(null);
  };

  // Quick edit for hardware
  const [editingHwId, setEditingHwId] = useState<string | null>(null);
  const [editHwPrixAchat, setEditHwPrixAchat] = useState('');
  const [editHwPrixVente, setEditHwPrixVente] = useState('');

  const saveHardwarePrice = (id: string) => {
    const pAchat = editHwPrixAchat.trim() ? parseFloat(editHwPrixAchat.replace(',', '.')) : null;
    const pVente = editHwPrixVente.trim() ? parseFloat(editHwPrixVente.replace(',', '.')) : null;

    const updated = hardware.map((h) => {
      if (h.id === id) {
        return {
          ...h,
          prixAchat: pAchat,
          prixVente: pVente,
          isConfigured: pAchat !== null && !isNaN(pAchat)
        };
      }
      return h;
    });
    onSaveHardware(updated);
    setEditingHwId(null);
  };

  // Update calculation rules directly
  const handleUpdateRuleNumber = (key: keyof CalculationRules, val: number) => {
    onSaveRules({
      ...rules,
      [key]: val
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls - Clean White Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 capitalize">
            {activeTab === 'gammes' && <Layers className="w-5 h-5 text-blue-600" />}
            {activeTab === 'profilés' && <Scissors className="w-5 h-5 text-blue-600" />}
            {activeTab === 'quincaillerie' && <ShieldCheck className="w-5 h-5 text-blue-600" />}
            {activeTab === 'vitrages' && <Box className="w-5 h-5 text-blue-600" />}
            {activeTab === 'accessoires' && <Sliders className="w-5 h-5 text-blue-600" />}
            {activeTab === 'tarifs' && <DollarSign className="w-5 h-5 text-blue-600" />}
            {activeTab === 'règles' && <Settings className="w-5 h-5 text-blue-600" />}
            {activeTab === 'stock' && <Box className="w-5 h-5 text-blue-600" />}
            Base Technique : {activeTab}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestion des références, règles d'usinage et mercuriale tarifaire atelier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrer la liste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-52 shadow-xs"
            />
          </div>

          <button
            onClick={onOpenImport}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Importer Excel / CSV
          </button>
        </div>
      </div>

      {/* 1. GAMMES PVC */}
      {activeTab === 'gammes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems
            .filter((s) => s.nom.toLowerCase().includes(searchTerm.toLowerCase()) || s.gamme.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((sys) => (
              <div
                key={sys.id}
                className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-blue-700 uppercase tracking-wider">
                      {sys.gamme}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        sys.isConfigured
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {sys.isConfigured ? 'Configuré' : 'À VÉRIFIER'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{sys.nom}</h3>
                  <p className="text-xs text-slate-500 mt-1">{sys.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-500">Dormant</div>
                    <div className="font-mono font-bold text-slate-800">{sys.epaisseurDormantMm} mm</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-500">Chambres</div>
                    <div className="font-mono font-bold text-slate-800">{sys.nombreChambres}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded border border-slate-200/80">
                    <div className="text-[10px] text-slate-500">Joint</div>
                    <div className="font-mono font-bold text-slate-800">{sys.typeJoint}</div>
                  </div>
                </div>

                {sys.notes && (
                  <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-200/60">
                    {sys.notes}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* 2. PROFILÉS */}
      {activeTab === 'profilés' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Fournisseur / Gamme</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Longueur Barre</th>
                <th className="py-3 px-4 text-right">Prix Achat / ML</th>
                <th className="py-3 px-4 text-right">Prix Vente / ML</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles
                .filter(
                  (p) =>
                    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.type.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((p) => {
                  const isEditing = editingProfileId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {p.reference}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{p.designation}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.couleur} · {p.largeurProfilMm}mm
                        </div>
                        {p.prixFinitions && (
                          <div className="flex flex-wrap gap-1.5 mt-1 text-[10px] font-mono text-slate-600">
                            {p.prixFinitions.blanc !== undefined && p.prixFinitions.blanc !== null && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                                Blanc: {p.prixFinitions.blanc.toFixed(2)} {devise}
                              </span>
                            )}
                            {p.prixFinitions.spectral !== undefined && p.prixFinitions.spectral !== null && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                                Spectral: {p.prixFinitions.spectral.toFixed(2)} {devise}
                              </span>
                            )}
                            {p.prixFinitions.renolitPX !== undefined && p.prixFinitions.renolitPX !== null && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
                                PX: {p.prixFinitions.renolitPX.toFixed(2)} {devise}
                              </span>
                            )}
                            {p.prixFinitions.renolitMX !== undefined && p.prixFinitions.renolitMX !== null && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800">
                                MX: {p.prixFinitions.renolitMX.toFixed(2)} {devise}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-mono font-semibold text-blue-700">{p.fournisseur}</span>
                        <div className="text-[11px] text-slate-400">{p.systemId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {p.longueurBarreMm} mm
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPrixAchat}
                            onChange={(e) => setEditPrixAchat(e.target.value)}
                            placeholder="ex: 10.50"
                            className="w-20 bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-right text-slate-900 font-mono"
                          />
                        ) : p.prixAchatMl !== null ? (
                          <span className="text-slate-800 font-semibold">{p.prixAchatMl.toFixed(2)} {devise}</span>
                        ) : (
                          <span className="text-rose-600 font-bold">NON CONFIGURÉ</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editPrixVente}
                            onChange={(e) => setEditPrixVente(e.target.value)}
                            placeholder="ex: 15.00"
                            className="w-20 bg-white border border-blue-500 rounded px-1.5 py-0.5 text-xs text-right text-slate-900 font-mono"
                          />
                        ) : p.prixVenteMl !== null ? (
                          <span className="text-blue-700 font-bold">{p.prixVenteMl.toFixed(2)} {devise}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.isConfigured && p.prixAchatMl !== null ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            NON CONFIGURÉ
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => saveProfilePrice(p.id)}
                            className="px-2.5 py-1 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 shadow-2xs cursor-pointer"
                          >
                            Valider
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditProfile(p)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Modifier le prix"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. QUINCAILLERIE ROTO */}
      {activeTab === 'quincaillerie' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Réf Roto Exacte</th>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-4">Système</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Plage FFH/FB (mm)</th>
                <th className="py-3 px-4 text-right">Prix Achat</th>
                <th className="py-3 px-4 text-right">Prix Vente</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hardware
                .filter(
                  (h) =>
                    h.referenceExacte.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    h.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    h.systeme.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((h) => {
                  const isEditing = editingHwId === h.id;
                  return (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {h.referenceExacte}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {h.designation}
                        {h.regleSelection && (
                          <div className="text-[10px] text-slate-500 font-normal">{h.regleSelection}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-blue-700">{h.systeme}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {h.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600">
                        {h.dimensionMinMm && h.dimensionMaxMm
                          ? `${h.dimensionMinMm} - ${h.dimensionMaxMm} mm`
                          : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editHwPrixAchat}
                            onChange={(e) => setEditHwPrixAchat(e.target.value)}
                            className="w-16 bg-white border border-blue-500 rounded px-1 text-right text-xs font-mono"
                          />
                        ) : h.prixAchat !== null ? (
                          <span className="text-slate-800 font-semibold">{h.prixAchat.toFixed(2)} {devise}</span>
                        ) : (
                          <span className="text-rose-600 font-bold">NON CONFIGURÉ</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editHwPrixVente}
                            onChange={(e) => setEditHwPrixVente(e.target.value)}
                            className="w-16 bg-white border border-blue-500 rounded px-1 text-right text-xs font-mono"
                          />
                        ) : h.prixVente !== null ? (
                          <span className="text-blue-700 font-bold">{h.prixVente.toFixed(2)} {devise}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {h.isConfigured && h.prixAchat !== null ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Valide
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            NON CONFIGURÉ
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => saveHardwarePrice(h.id)}
                            className="px-2.5 py-1 bg-blue-600 text-white font-semibold text-xs rounded hover:bg-blue-700 shadow-2xs"
                          >
                            OK
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingHwId(h.id);
                              setEditHwPrixAchat(h.prixAchat !== null ? String(h.prixAchat) : '');
                              setEditHwPrixVente(h.prixVente !== null ? String(h.prixVente) : '');
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. VITRAGES */}
      {activeTab === 'vitrages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {glass
            .filter((g) => g.designation.toLowerCase().includes(searchTerm.toLowerCase()) || g.code.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((g) => (
              <div key={g.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">{g.code}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        g.isConfigured && g.prixAchatM2 !== null
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {g.isConfigured ? 'Configuré' : 'NON CONFIGURÉ'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{g.designation}</h3>
                  <p className="text-xs text-slate-500 mt-1">{g.composition}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-slate-50 rounded border border-slate-200/80">
                  <div>
                    <div className="text-[10px] text-slate-500">Thermique Ug</div>
                    <div className="font-mono font-bold text-slate-800">{g.coefficientUg} W/m²K</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Acoustique Rw</div>
                    <div className="font-mono font-bold text-slate-800">{g.affaiblissementRwDb} dB</div>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prix Achat Verrier</span>
                    <span className="font-mono font-bold text-slate-800">
                      {g.prixAchatM2 !== null ? `${g.prixAchatM2.toFixed(2)} ${devise}/m²` : 'NON CONFIGURÉ'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Prix Vente Chiffrage</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {g.prixVenteM2 !== null ? `${g.prixVenteM2.toFixed(2)} ${devise}/m²` : '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 5. ACCESSOIRES (ROTO, VEKA, MEKSA, STANDARD) */}
      {activeTab === 'accessoires' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Catalogues intégrés :</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-mono">
                Roto Accessoires ({accessories.filter(a => a.id.startsWith('roto_') || a.reference.startsWith('F') || a.designation.toLowerCase().includes('roto')).length})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-mono">
                VEKA Accessoires ({accessories.filter(a => a.id.startsWith('veka_')).length})
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono">
                MEKSA Accessoires ({accessories.filter(a => a.id.startsWith('meksa_')).length})
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Total : {accessories.length} articles
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Désignation</th>
                  <th className="py-3 px-4">Marque</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-center">Unité</th>
                  <th className="py-3 px-4 text-right">Prix Achat</th>
                  <th className="py-3 px-4 text-right">Prix Vente</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessories
                  .filter((a) => a.designation.toLowerCase().includes(searchTerm.toLowerCase()) || a.reference.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((a) => {
                    const isRoto = a.id.startsWith('roto_') || a.reference.startsWith('F') || a.designation.toLowerCase().includes('roto');
                    const isVeka = a.id.startsWith('veka_');
                    const isMeksa = a.id.startsWith('meksa_');
                    const brand = isRoto ? 'Roto' : isVeka ? 'VEKA' : isMeksa ? 'MEKSA' : 'Standard';

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{a.reference}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {a.designation}
                          {a.description && <div className="text-[10px] text-slate-500 font-normal">{a.description}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            isRoto
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : isVeka
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : isMeksa
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {brand}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{a.categorie}</td>
                        <td className="py-3 px-4 text-center font-mono">{a.unite}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-800">
                          {a.prixAchat !== null ? `${a.prixAchat.toFixed(2)} ${devise}` : 'NON CONFIGURÉ'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-700">
                          {a.prixVente !== null ? `${a.prixVente.toFixed(2)} ${devise}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Actif
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TARIFS & TAUX HORAIRES */}
      {activeTab === 'tarifs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              Taux Horaires & Main d'Œuvre Atelier
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Taux Horaire Fabrication ({devise}/heure)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={rules.tauxHoraireFabrication}
                    onChange={(e) => handleUpdateRuleNumber('tauxHoraireFabrication', Number(e.target.value))}
                    className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <span className="text-slate-500">{devise} HT / heure</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Temps de base par Cadre Dormant (minutes)</label>
                <input
                  type="number"
                  value={rules.minutesFabricationParCadre}
                  onChange={(e) => handleUpdateRuleNumber('minutesFabricationParCadre', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Temps additionnel par Vantail Ouvrant (minutes)</label>
                <input
                  type="number"
                  value={rules.minutesFabricationParVantail}
                  onChange={(e) => handleUpdateRuleNumber('minutesFabricationParVantail', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              Forfaits Pose, Transport & Coefficient Marge
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Prix de Pose au m² ({devise}/m²)</label>
                <input
                  type="number"
                  value={rules.prixPoseAuM2}
                  onChange={(e) => handleUpdateRuleNumber('prixPoseAuM2', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Forfait Pose Minimum par chantier ({devise})</label>
                <input
                  type="number"
                  value={rules.forfaitPoseMinimum}
                  onChange={(e) => handleUpdateRuleNumber('forfaitPoseMinimum', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Prix Transport au km ({devise}/km)</label>
                <input
                  type="number"
                  step="0.05"
                  value={rules.prixTransportParKm}
                  onChange={(e) => handleUpdateRuleNumber('prixTransportParKm', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Coefficient Marge Standard par défaut</label>
                <input
                  type="number"
                  step="0.05"
                  value={rules.coefficientMargeDefault}
                  onChange={(e) => handleUpdateRuleNumber('coefficientMargeDefault', Number(e.target.value))}
                  className="w-32 bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. RÈGLES DE CALCUL */}
      {activeTab === 'règles' && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Paramètres Techniques de Débit & Jeux d'Atelier
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Valeurs utilisées par le moteur pour calculer les cotes de coupe des profilés, renforts acier et vitrages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-semibold">Recouvrement dormant / ouvrant (mm)</label>
              <input
                type="number"
                value={rules.recouvrementDormantMm}
                onChange={(e) => handleUpdateRuleNumber('recouvrementDormantMm', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 block">Standard NF = 20 mm</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-semibold">Jeu fond de feuillure (mm)</label>
              <input
                type="number"
                value={rules.jeuFondDeFeuillureMm}
                onChange={(e) => handleUpdateRuleNumber('jeuFondDeFeuillureMm', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 block">Jeu périphérique = 4 mm</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-semibold">Retrait prise vitrage (mm)</label>
              <input
                type="number"
                value={rules.retraitVitrageMm}
                onChange={(e) => handleUpdateRuleNumber('retraitVitrageMm', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 block">Pénétration parclose = 12 mm</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-semibold">Déduction battement central Stulp (mm)</label>
              <input
                type="number"
                value={rules.deductionBattementCentralMm}
                onChange={(e) => handleUpdateRuleNumber('deductionBattementCentralMm', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 block">Pour fenêtre 2 vantaux = 34 mm</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-slate-700 font-semibold">Majoration chutes & pertes (%)</label>
              <input
                type="number"
                value={rules.majorationChutesPourcent}
                onChange={(e) => handleUpdateRuleNumber('majorationChutesPourcent', Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 block">Surplus perte de barre = 8%</span>
            </div>
          </div>
        </div>
      )}

      {/* 8. STOCK */}
      {activeTab === 'stock' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Désignation Article</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Emplacement Râtelier</th>
                <th className="py-3 px-4 text-center">Stock Actuel</th>
                <th className="py-3 px-4 text-center">Seuil Mini Alerte</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map((item) => {
                const isLow = item.quantiteEnStock <= item.seuilMinimum;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.reference}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.designation}</td>
                    <td className="py-3 px-4 text-slate-600">{item.articleType}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.emplacement || '-'}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {item.quantiteEnStock} {item.unite}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      {item.seuilMinimum} {item.unite}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Réapprovisionner
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Stock suffisant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

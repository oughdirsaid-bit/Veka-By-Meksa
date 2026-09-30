import React, { useState, useMemo } from 'react';
import {
  JoineryItem,
  WindowType,
  OpeningConfiguration,
  Client,
  Project,
  PVCSystem,
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  CalculationRules
} from '../types';
import { calculateJoinery } from '../services/calculationEngine';
import { TechnicalElevationViewer } from './TechnicalElevationViewer';
import {
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Layers,
  Calculator,
  Sliders,
  Maximize2,
  Building,
  User,
  FolderKanban,
  Compass,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';

interface JoineryConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: JoineryItem, targetProjectId?: string, targetClientId?: string) => void;
  initialItem?: JoineryItem | null;
  clients: Client[];
  projects: Project[];
  systems: PVCSystem[];
  profiles: ProfileItem[];
  hardware: HardwareItem[];
  glass: GlassItem[];
  accessories: AccessoryItem[];
  rules: CalculationRules;
  defaultClientId?: string;
  defaultProjectId?: string;
  devise?: string;
}

export const JoineryConfiguratorModal: React.FC<JoineryConfiguratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  clients,
  projects,
  systems,
  profiles,
  hardware,
  glass,
  accessories,
  rules,
  defaultClientId,
  defaultProjectId,
  devise = 'DH'
}) => {
  // 1. Client & 2. Project
  const [selectedClientId, setSelectedClientId] = useState<string>(defaultClientId || clients[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || projects[0]?.id || '');

  // 3. Menuiserie & 4. Dimensions
  const [repere, setRepere] = useState<string>(initialItem?.repere || 'F01');
  const [type, setType] = useState<WindowType>(initialItem?.type || 'Fenêtre');
  const [largeurMm, setLargeurMm] = useState<number>(initialItem?.largeurMm || 1200);
  const [hauteurMm, setHauteurMm] = useState<number>(initialItem?.hauteurMm || 1450);
  const [quantite, setQuantite] = useState<number>(initialItem?.quantite || 1);

  // 5. Gamme & 6. Configuration
  const [gamme, setGamme] = useState<'VEKA' | 'MEKSA' | 'AUTRE'>(initialItem?.gamme || 'VEKA');
  const [systemId, setSystemId] = useState<string>(initialItem?.systemId || 'veka_softline_70');
  const [configuration, setConfiguration] = useState<OpeningConfiguration>(initialItem?.configuration || '2_vantaux_OB_OF');
  const [couleur, setCouleur] = useState<string>(initialItem?.couleur || 'Blanc RAL 9016');

  // 7. Quincaillerie & 8. Vitrage
  const [quincaillerieSystemId, setQuincaillerieSystemId] = useState<string>(initialItem?.quincaillerieSystemId || 'roto_nx');
  const [vitrageId, setVitrageId] = useState<string>(initialItem?.vitrageId || 'glass_dv_4_16_4_argon');

  // 9. Accessoires
  const [accFilter, setAccFilter] = useState<'TOUS' | 'ROTO' | 'VEKA' | 'MEKSA'>('TOUS');
  const [accSearch, setAccSearch] = useState('');
  const [selectedAccessories, setSelectedAccessories] = useState<{ accessoireId: string; quantite: number }[]>(
    initialItem?.accessoires || [
      { accessoireId: 'acc_poignee_secustik_blanche', quantite: 2 }
    ]
  );

  // 10, 11, 12, 13: Conditions de Pose, Transport & Marge
  const [typePose, setTypePose] = useState<JoineryItem['typePose']>(initialItem?.typePose || 'Applique_Neuf');
  const [inclurePose, setInclurePose] = useState<boolean>(initialItem?.inclurePose ?? true);
  const [inclureTransport, setInclureTransport] = useState<boolean>(initialItem?.inclureTransport ?? false);
  const [distanceKm, setDistanceKm] = useState<number>(initialItem?.distanceKm || 20);
  const [customMarginCoeff, setCustomMarginCoeff] = useState<number>(initialItem?.calcul?.coefficientMarge || rules.coefficientMargeDefault || 1.35);
  const [notesTechniques, setNotesTechniques] = useState<string>(initialItem?.notesTechniques || '');

  // Filter projects by client
  const clientProjects = useMemo(() => {
    return projects.filter((p) => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  // Systems filtered by Gamme
  const availableSystems = useMemo(() => {
    return systems.filter((s) => s.gamme === gamme);
  }, [systems, gamme]);

  // Active client object
  const activeClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Active project object
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Active system object
  const activeSystem = useMemo(() => {
    return systems.find((s) => s.id === systemId);
  }, [systems, systemId]);

  // Dynamic real-time joinery calculation (UNCHANGED ENGINE)
  const calculation = useMemo(() => {
    return calculateJoinery({
      largeurMm,
      hauteurMm,
      quantite,
      gamme,
      systemId,
      type,
      configuration,
      couleur,
      quincaillerieSystemId,
      vitrageId,
      accessoires: selectedAccessories,
      typePose,
      inclurePose,
      inclureTransport,
      customMarginCoeff,
      systems,
      profiles,
      hardwares: hardware,
      glasses: glass,
      accessoriesList: accessories,
      rules
    });
  }, [
    largeurMm,
    hauteurMm,
    quantite,
    gamme,
    systemId,
    type,
    configuration,
    couleur,
    quincaillerieSystemId,
    vitrageId,
    selectedAccessories,
    typePose,
    inclurePose,
    inclureTransport,
    distanceKm,
    customMarginCoeff,
    systems,
    profiles,
    hardware,
    glass,
    accessories,
    rules
  ]);

  if (!isOpen) return null;

  const toggleAccessory = (accId: string) => {
    const existing = selectedAccessories.find((a) => a.accessoireId === accId);
    if (existing) {
      setSelectedAccessories(selectedAccessories.filter((a) => a.accessoireId !== accId));
    } else {
      setSelectedAccessories([...selectedAccessories, { accessoireId: accId, quantite: 1 }]);
    }
  };

  const updateAccessoryQty = (accId: string, delta: number) => {
    setSelectedAccessories(
      selectedAccessories.map((a) => {
        if (a.accessoireId === accId) {
          const newQty = Math.max(1, a.quantite + delta);
          return { ...a, quantite: newQty };
        }
        return a;
      })
    );
  };

  const handleSave = () => {
    const newItem: JoineryItem = {
      id: initialItem?.id || `item_${Date.now()}`,
      repere: repere.trim() || 'F01',
      type,
      largeurMm,
      hauteurMm,
      quantite,
      gamme,
      systemId,
      configuration,
      couleur,
      quincaillerieSystemId,
      vitrageId,
      accessoires: selectedAccessories,
      typePose,
      inclurePose,
      inclureTransport,
      distanceKm,
      notesTechniques,
      calcul: calculation
    };
    onSave(newItem, selectedProjectId, selectedClientId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-800">
        {/* Header - PROGES Style Clean White Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Poste de Chiffrage Technique Menuiserie PVC
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  {gamme} · {activeSystem?.nom || systemId}
                </span>
                <span className="text-[10px] font-medium text-slate-500 hidden sm:inline">
                  | Norme NF Fenêtres PVC & Ferrage Roto
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Calcul paramétrique en temps réel des profilés, débits atelier, vitrage isolant et prix de vente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP STATUS BAR: Instant Visual Hierarchy (Ce que je chiffre / Gamme / Dimensions / Coût / Marge / Prix) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs shrink-0">
          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-600">Ouvrage en cours</div>
            <div className="font-bold text-slate-900 truncate">
              {repere} · {type}
            </div>
          </div>

          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-600">Dimensions</div>
            <div className="font-mono font-bold text-blue-700">
              {largeurMm} × {hauteurMm} mm
            </div>
          </div>

          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-600">Gamme / Profil</div>
            <div className="font-semibold text-slate-800 truncate">
              {gamme} ({activeSystem?.epaisseurDormantMm || 70}mm)
            </div>
          </div>

          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-600">Coût Revient HT</div>
            <div className="font-mono font-semibold text-slate-700">
              {(calculation.coutTotalRevientHT * quantite).toFixed(2)} {devise}
            </div>
          </div>

          <div className="border-r border-slate-200/80 pr-2">
            <div className="text-[10px] uppercase font-bold text-slate-600">Marge Brute</div>
            <div className="font-mono font-bold text-emerald-700">
              {calculation.margePourcent}% (×{customMarginCoeff})
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase font-bold text-blue-700">Prix Vente Net HT</div>
            <div className="font-mono font-bold text-blue-700 text-sm">
              {(calculation.prixVenteTotalHT * quantite).toFixed(2)} {devise}
            </div>
          </div>
        </div>

        {/* Modal Main Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Form Sections 1 to 9 (7 cols) */}
          <div className="lg:col-span-7 p-5 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white overflow-y-auto">
            
            {/* ROW 1: SECTIONS 1 & 2 - CLIENT & PROJET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SECTION 1: CLIENT */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>CLIENT</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Sélection Client *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom} {c.prenom || ''} ({c.type})
                      </option>
                    ))}
                  </select>
                  {activeClient && (
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {activeClient.codeClient} · {activeClient.telephone || activeClient.email || 'Sans contact direct'}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: PROJET */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>PROJET / AFFAIRE</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Affaire Liée</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {clientProjects.length === 0 ? (
                      <option value="">Aucune affaire spécifique (Par défaut)</option>
                    ) : (
                      clientProjects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.codeProjet} - {p.nom}
                        </option>
                      ))
                    )}
                  </select>
                  {activeProject && (
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      Chantier : {activeProject.adresseChantier}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ROW 2: SECTIONS 3 & 4 - MENUISERIE & DIMENSIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SECTION 3: MENUISERIE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>MENUISERIE</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Repère Plan *</label>
                    <input
                      type="text"
                      value={repere}
                      onChange={(e) => setRepere(e.target.value)}
                      placeholder="Ex: F01 Séjour"
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Type de Menuiserie</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as WindowType)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Fenêtre">Fenêtre</option>
                      <option value="Porte-fenêtre">Porte-fenêtre</option>
                      <option value="Baie coulissante">Baie coulissante</option>
                      <option value="Coulissant">Coulissant</option>
                      <option value="Porte">Porte d'entrée</option>
                      <option value="Fixe">Châssis Fixe</option>
                      <option value="Ensemble composé">Ensemble composé</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DIMENSIONS */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>DIMENSIONS FABRICATION (MM)</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Largeur L</label>
                    <input
                      type="number"
                      step="1"
                      min="350"
                      max="4000"
                      value={largeurMm}
                      onChange={(e) => setLargeurMm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-mono font-bold tabular-nums text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
                    />
                    <span className="text-[9px] text-slate-400 block text-center mt-0.5">mm</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Hauteur H</label>
                    <input
                      type="number"
                      step="1"
                      min="350"
                      max="3500"
                      value={hauteurMm}
                      onChange={(e) => setHauteurMm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-mono font-bold tabular-nums text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
                    />
                    <span className="text-[9px] text-slate-400 block text-center mt-0.5">mm</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Quantité</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={quantite}
                      onChange={(e) => setQuantite(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1.5 text-xs font-mono font-bold tabular-nums text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center"
                    />
                    <span className="text-[9px] text-slate-400 block text-center mt-0.5">Unité(s)</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 text-center bg-white py-0.5 rounded border border-slate-200">
                  Surface : <strong>{calculation.surfaceM2} m²</strong> · Périmètre : {((largeurMm + hauteurMm) * 2 / 1000).toFixed(2)} ml
                </div>
              </div>
            </div>

            {/* ROW 3: SECTIONS 5 & 6 - GAMME & CONFIGURATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SECTION 5: GAMME */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>GAMME PVC</span>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Fournisseur</label>
                      <select
                        value={gamme}
                        onChange={(e) => {
                          const newGamme = e.target.value as 'VEKA' | 'MEKSA' | 'AUTRE';
                          setGamme(newGamme);
                          const matching = systems.find((s) => s.gamme === newGamme);
                          if (matching) setSystemId(matching.id);
                        }}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="VEKA">VEKA</option>
                        <option value="MEKSA">MEKSA</option>
                        <option value="AUTRE">Autre Gamme</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Teinte PVC</label>
                      <select
                        value={couleur}
                        onChange={(e) => setCouleur(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Blanc RAL 9016">Blanc RAL 9016</option>
                        <option value="Gris Anthracite RAL 7016">Gris RAL 7016</option>
                        <option value="Chêne Doré">Chêne Doré</option>
                        <option value="Noyer">Noyer</option>
                        <option value="Noir Mat RAL 9005">Noir Mat RAL 9005</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Système Profilé</label>
                    <select
                      value={systemId}
                      onChange={(e) => setSystemId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      {availableSystems.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom} ({s.epaisseurDormantMm}mm) {!s.isConfigured ? '⚠️ NON CONFIGURÉ' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 6: CONFIGURATION */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">6</span>
                  <span>CONFIGURATION OUVRANTS</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Cinématique d'Ouverture</label>
                    <select
                      value={configuration}
                      onChange={(e) => setConfiguration(e.target.value as OpeningConfiguration)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="1_vantail_OF">1 Vantail Ouvrant Français (OF)</option>
                      <option value="1_vantail_OB">1 Vantail Oscillo-Battant (OB)</option>
                      <option value="2_vantaux_OF">2 Vantaux Ouvrants Français (OF)</option>
                      <option value="2_vantaux_OB_OF">2 Vantaux (1 OB + 1 OF semi-fixe)</option>
                      <option value="3_vantaux">3 Vantaux</option>
                      <option value="coulissant_2V">Coulissant 2 Vantaux</option>
                      <option value="coulissant_3V">Coulissant 3 Vantaux</option>
                      <option value="fixe">Châssis Fixe</option>
                      <option value="porte_entree">Porte d'entrée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Type de Pose Chantier</label>
                    <select
                      value={typePose}
                      onChange={(e) => setTypePose(e.target.value as JoineryItem['typePose'])}
                      className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Applique_Neuf">Applique en neuf (avec tapée)</option>
                      <option value="Renovation_Dormant_Existant">Rénovation sur dormant existant</option>
                      <option value="Tunnel">Pose en tunnel</option>
                      <option value="Feuillure">Pose en feuillure</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 4: SECTIONS 7 & 8 - QUINCAILLERIE & VITRAGE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* SECTION 7: QUINCAILLERIE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">7</span>
                  <span>QUINCAILLERIE (ROTO)</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Gamme Ferrage</label>
                  <select
                    value={quincaillerieSystemId}
                    onChange={(e) => setQuincaillerieSystemId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="roto_nx">Roto NX (Haute Sécurité Standard)</option>
                    <option value="roto_nt">Roto NT</option>
                    <option value="roto_alversa">Roto Patio Alversa (Coulissant)</option>
                  </select>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Gâche de sécurité + crémone adaptée à la hauteur {hauteurMm} mm.
                  </div>
                </div>
              </div>

              {/* SECTION 8: VITRAGE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">8</span>
                  <span>VITRAGE ISOLANT</span>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Type de Verre</label>
                  <select
                    value={vitrageId}
                    onChange={(e) => setVitrageId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {glass.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.code} {!g.isConfigured ? '⚠️ NON CONFIGURÉ' : `(${g.prixVenteM2} ${devise}/m²)`}
                      </option>
                    ))}
                  </select>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Surface vitrée calculée : {calculation.surfaceM2} m² (déduction dormants/ouvrants).
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 9: ACCESSOIRES */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">9</span>
                  <span>ACCESSOIRES & OPTIONS COMPLÉMENTAIRES</span>
                </div>

                {/* Filter tags for Roto / VEKA / MEKSA / TOUS */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-slate-200">
                  {(['TOUS', 'ROTO', 'VEKA', 'MEKSA'] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAccFilter(tag)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        accFilter === tag
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tag === 'ROTO' ? 'Roto' : tag === 'VEKA' ? 'VEKA' : tag === 'MEKSA' ? 'MEKSA' : 'Tous'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input for accessories */}
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Rechercher poignée Secustik, grille de ventilation, cale..."
                  value={accSearch}
                  onChange={(e) => setAccSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-md border border-slate-200">
                {accessories
                  .filter((acc) => {
                    const matchesSearch =
                      acc.designation.toLowerCase().includes(accSearch.toLowerCase()) ||
                      acc.reference.toLowerCase().includes(accSearch.toLowerCase()) ||
                      acc.categorie.toLowerCase().includes(accSearch.toLowerCase());
                    if (!matchesSearch) return false;
                    if (accFilter === 'ROTO') {
                      return acc.id.startsWith('roto_') || acc.reference.startsWith('F') || acc.designation.toLowerCase().includes('roto');
                    }
                    if (accFilter === 'VEKA') {
                      return acc.id.startsWith('veka_');
                    }
                    if (accFilter === 'MEKSA') {
                      return acc.id.startsWith('meksa_');
                    }
                    return true;
                  })
                  .map((acc) => {
                    const isChecked = selectedAccessories.some((a) => a.accessoireId === acc.id);
                    const item = selectedAccessories.find((a) => a.accessoireId === acc.id);
                    const isRoto = acc.id.startsWith('roto_') || acc.reference.startsWith('F') || acc.designation.toLowerCase().includes('roto');
                    const isVeka = acc.id.startsWith('veka_');
                    const isMeksa = acc.id.startsWith('meksa_');
                    const brandTag = isRoto ? 'Roto' : isVeka ? 'VEKA' : isMeksa ? 'MEKSA' : null;

                    return (
                      <div
                        key={acc.id}
                        className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                          isChecked ? 'bg-blue-50/70 border border-blue-200' : 'bg-slate-50/60 border border-slate-200/60'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAccessory(acc.id)}
                            className="rounded text-blue-600 focus:ring-0"
                          />
                          <div className="truncate flex-1">
                            <div className="truncate text-slate-800 flex items-center gap-1.5 font-medium">
                              {brandTag && (
                                <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                                  isRoto ? 'bg-amber-100 text-amber-800' : isVeka ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {brandTag}
                                </span>
                              )}
                              <span className="truncate">{acc.designation}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Réf: {acc.reference} · {(acc.prixVente || acc.prixAchat || 0).toFixed(2)} {devise}
                            </div>
                          </div>
                        </label>

                        {isChecked && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateAccessoryQty(acc.id, -1)}
                              className="w-5 h-5 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-mono text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono tabular-nums text-xs px-1 text-blue-700 font-bold">
                              {item?.quantite || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateAccessoryQty(acc.id, 1)}
                              className="w-5 h-5 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-mono text-xs"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Pose & Transport Conditions Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inclurePoseModal"
                    checked={inclurePose}
                    onChange={(e) => setInclurePose(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="inclurePoseModal" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Prestation de Pose ({rules.prixPoseAuM2} {devise}/m²)
                  </label>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 ml-5">
                  Pose certifiée DTU 36.5 avec calage et étanchéité.
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inclureTransportModal"
                    checked={inclureTransport}
                    onChange={(e) => setInclureTransport(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="inclureTransportModal" className="text-xs font-medium text-slate-700 cursor-pointer">
                    Livraison & Transport Chantier
                  </label>
                </div>
                {inclureTransport && (
                  <div className="flex items-center gap-1.5 mt-1 ml-5">
                    <span className="text-xs text-slate-500">Distance :</span>
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono text-slate-800"
                    />
                    <span className="text-xs text-slate-500">km ({rules.prixTransportParKm} {devise}/km)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview & SECTIONS 10, 11, 12, 13 (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-slate-50/50 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Technical Drawing Elevation on Clean White Blueprint */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative shadow-xs">
                <div className="px-3 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
                    Élévation Vue Extérieure (Échelle)
                  </span>
                  <span className="font-mono text-[11px] font-bold text-blue-700">
                    {largeurMm} × {hauteurMm} mm
                  </span>
                </div>
                <div className="p-3 bg-white flex items-center justify-center">
                  <TechnicalElevationViewer
                    largeurMm={largeurMm}
                    hauteurMm={hauteurMm}
                    configuration={configuration}
                    type={type}
                    couleur={couleur}
                    repere={repere}
                  />
                </div>
              </div>

              {/* Status & Non-config warnings */}
              {calculation.warnings.length > 0 && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    calculation.status === 'NON_CONFIGURE'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>
                      {calculation.status === 'NON_CONFIGURE'
                        ? 'Données de prix réels incomplètes'
                        : 'Avertissement technique dimensionnel'}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                    {calculation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* SECTIONS 10, 11, 12 & 13: CALCUL, PRIX DE REVIENT, MARGE, PRIX DE VENTE */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
                {/* SECTION 10: CALCUL (DÉCOMPOSITION DU COÛT MATIÈRE & MO) */}
                <div>
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">10</span>
                      <span>CALCUL TECHNIQUE MATIÈRES & MO</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-medium">
                      x{quantite} unité{quantite > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs pt-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Profilés PVC (Dormant, Ouvrant, Parclose) :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutProfilsHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Renforts Acier galvanisé :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutRenfortsHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Quincaillerie Roto :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutQuincaillerieHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Vitrage isolant ({calculation.surfaceM2} m²) :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutVitrageHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Accessoires & Quincaillerie complémentaire :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutAccessoiresHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Main d'œuvre fabrication atelier (débit, soudure) :</span>
                      <span className="font-mono tabular-nums text-slate-900 font-medium">
                        {(calculation.coutFabricationHT * quantite).toFixed(2)} {devise}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 11: PRIX DE REVIENT */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold">11</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wide">PRIX DE REVIENT HT TOTAL</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {(calculation.coutTotalRevientHT * quantite).toFixed(2)} {devise}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono text-right">
                    Revient unitaire : {calculation.coutTotalRevientHT.toFixed(2)} {devise} / U
                  </div>
                </div>

                {/* SECTION 12: MARGE */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">12</span>
                      <span className="font-bold text-slate-800 uppercase tracking-wide text-xs">MARGE APPLIQUÉE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Coeff :</span>
                      <input
                        type="number"
                        step="0.05"
                        min="1.0"
                        max="3.0"
                        value={customMarginCoeff}
                        onChange={(e) => setCustomMarginCoeff(Number(e.target.value))}
                        className="w-16 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 text-center"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100">
                    <span className="text-emerald-800 font-medium">Taux de marge brute calculé :</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      {calculation.margePourcent}%
                    </span>
                  </div>
                </div>

                {/* SECTION 13: PRIX DE VENTE */}
                <div className="pt-3 border-t-2 border-blue-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">13</span>
                      <span className="font-bold text-blue-900 uppercase text-xs">PRIX DE VENTE TOTAL HT</span>
                    </div>
                    <span className="text-xl font-bold font-mono tabular-nums text-blue-700">
                      {(calculation.prixVenteTotalHT * quantite).toFixed(2)} {devise}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-blue-200/60 font-mono">
                    <span>TVA (20%) : {((calculation.prixVenteTTC - calculation.prixVenteTotalHT) * quantite).toFixed(2)} {devise}</span>
                    <span className="font-bold text-slate-900">
                      TOTAL TTC : {(calculation.prixVenteTTC * quantite).toFixed(2)} {devise}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Valider et Ajouter au Devis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

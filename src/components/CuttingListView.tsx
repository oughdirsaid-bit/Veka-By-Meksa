import React, { useState } from 'react';
import { Order, CompanySettings, Client, Project } from '../types';
import { Printer, ArrowLeft, Scissors, Box, Layers, ShieldCheck, CheckSquare, Image } from 'lucide-react';

interface CuttingListViewProps {
  order: Order;
  client?: Client;
  project?: Project;
  settings: CompanySettings;
  onBack: () => void;
}

export const CuttingListView: React.FC<CuttingListViewProps> = ({
  order,
  client,
  project,
  settings,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'profils' | 'vitrages' | 'quincaillerie'>('profils');
  const [showLogo, setShowLogo] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  // Aggregate all profile cuts across items
  const allProfileCuts = order.items.flatMap((item) =>
    (item.calcul.cuts || []).map((cut) => ({
      ...cut,
      menuiserieRepere: item.repere,
      menuiserieType: item.type,
      largeurFenetre: item.largeurMm,
      hauteurFenetre: item.hauteurMm,
      quantiteTotale: cut.quantite * item.quantite
    }))
  );

  // Aggregate all glass panels across items
  const allGlassPanes = order.items.flatMap((item) =>
    (item.calcul.vitrageDimensions || []).map((v) => ({
      ...v,
      menuiserieRepere: item.repere,
      menuiserieType: item.type,
      quantiteTotale: v.quantite * item.quantite
    }))
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux commandes
        </button>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('profils')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'profils' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Débit Profilés PVC ({allProfileCuts.length})
            </button>
            <button
              onClick={() => setActiveTab('vitrages')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'vitrages' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Commande Miroiterie ({allGlassPanes.length})
            </button>
            <button
              onClick={() => setActiveTab('quincaillerie')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'quincaillerie' ? 'bg-amber-400 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ferrage & Quincaillerie Roto
            </button>
          </div>

          {settings.logoUrl && (
            <button
              onClick={() => setShowLogo(!showLogo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                showLogo
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              {showLogo ? 'Logo affiché' : 'Sans logo'}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm ml-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer Fiche Atelier
          </button>
        </div>
      </div>

      {/* Workshop Sheet Document */}
      <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 max-w-5xl mx-auto print:shadow-none print:border-none print:p-0 text-xs">
        {/* Header with Company Logo */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6 gap-6">
          <div className="flex items-start gap-3.5">
            {showLogo && settings.logoUrl && (
              <div className="w-16 h-16 p-1 bg-white rounded-lg border border-slate-300 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt={settings.nomEntreprise}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block">
                DOSSIER ATELIER & FABRICATION
              </span>
              <h1 className="text-xl font-black text-slate-950">
                FICHE DE DÉBIT & NOMENCLATURE MENUISERIE
              </h1>
              <p className="text-slate-600 font-medium">
                Commande N° <span className="font-mono font-bold text-slate-900">{order.numeroCommande}</span> (Réf Devis : {order.devisNumero})
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="font-bold text-slate-900">{settings.nomEntreprise}</div>
            <div className="text-slate-600">Client : {client?.nom} {client?.prenom || ''}</div>
            <div className="text-slate-600">Chantier : {project?.nom}</div>
            <div className="text-[11px] font-mono text-slate-500 mt-1">Date : {order.dateCommande}</div>
          </div>
        </div>

        {/* SECTION 1: PVC PROFILES CUTTING LIST */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded">
            <h3 className="font-bold tracking-wide flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              1. LISTE DE DÉBIT PROFILÉS PVC & RENFORTS ACIER
            </h3>
            <span className="text-[11px] text-slate-300 font-mono">
              Coupeuse double-tête & Centre d'usinage
            </span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                <th className="py-2 px-2.5 border-r border-slate-300">Repère Menuiserie</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Type Profilé</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Réf Profilé</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Qté</th>
                <th className="py-2 px-2.5 text-right border-r border-slate-300 font-mono">Longueur Coupe</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Angles</th>
                <th className="py-2 px-2.5 border-r border-slate-300">Renfort Acier</th>
                <th className="py-2 px-2 text-center">Fait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {allProfileCuts.map((cut, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2.5 border-r border-slate-300 font-sans font-bold text-slate-900">
                    {cut.menuiserieRepere}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-300 font-sans text-slate-800">
                    {cut.profil} ({cut.designation})
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-300 font-semibold text-slate-900">
                    {cut.reference}
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-300 font-bold text-amber-700">
                    {cut.quantiteTotale}
                  </td>
                  <td className="py-2 px-2.5 text-right border-r border-slate-300 font-bold text-slate-950 text-sm">
                    {cut.longueurMm} mm
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-300 text-slate-600">
                    {cut.angleGauche} / {cut.angleDroit}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-300 text-[11px] text-slate-700">
                    {cut.avecRenfort ? (
                      <span>
                        Acier {cut.referenceRenfort} : <span className="font-bold">{cut.longueurRenfortMm} mm</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Sans renfort</span>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-block w-4 h-4 border border-slate-400 rounded-sm"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 2: GLAZING CUTTING LIST FOR GLASS SUPPLIER */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded">
            <h3 className="font-bold tracking-wide flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              2. COMMANDE DE VITRAGES (Miroiterie / Verrier)
            </h3>
            <span className="text-[11px] text-slate-300 font-mono">
              Dimensions réelles de fabrication
            </span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                <th className="py-2 px-3 border-r border-slate-300">Repère</th>
                <th className="py-2 px-3 border-r border-slate-300">Description Vitrage</th>
                <th className="py-2 px-2 text-center border-r border-slate-300">Qté</th>
                <th className="py-2 px-3 text-right border-r border-slate-300 font-mono">Largeur mm</th>
                <th className="py-2 px-3 text-right border-r border-slate-300 font-mono">Hauteur mm</th>
                <th className="py-2 px-3 text-right border-r border-slate-300 font-mono">Surface m²</th>
                <th className="py-2 px-2 text-center">Réceptionné</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {allGlassPanes.map((pane, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3 border-r border-slate-300 font-sans font-bold text-slate-900">
                    {pane.menuiserieRepere}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-300 font-sans text-slate-800">
                    Double Vitrage 4/16/4 ITR Argon + Warm Edge
                  </td>
                  <td className="py-2 px-2 text-center border-r border-slate-300 font-bold text-amber-700">
                    {pane.quantiteTotale}
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-bold text-slate-900">
                    {pane.largeurMm} mm
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 font-bold text-slate-900">
                    {pane.hauteurMm} mm
                  </td>
                  <td className="py-2 px-3 text-right border-r border-slate-300 text-slate-700">
                    {pane.surfaceM2.toFixed(3)} m²
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className="inline-block w-4 h-4 border border-slate-400 rounded-sm"></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION 3: ROTO HARDWARE CHECKLIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-slate-900 text-white px-3 py-1.5 rounded">
            <h3 className="font-bold tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              3. QUINCAILLERIE ROTO & ACCESSOIRES DE MONTAGE
            </h3>
            <span className="text-[11px] text-slate-300 font-mono">
              Poste de ferrage & Contrôle final
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 border border-slate-300 rounded bg-slate-50/50">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 flex justify-between">
                  <span>{item.repere} - {item.type} ({item.quantite} ex)</span>
                  <span className="font-mono text-slate-600">{item.largeurMm} × {item.hauteurMm} mm</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-700">
                  <p>· Ferrure : <span className="font-semibold">{item.quincaillerieSystemId.toUpperCase()}</span> - Config : {item.configuration.replace(/_/g, ' ')}</p>
                  <p>· Poignée : Secustik Blanche (x{item.quantite * 2})</p>
                  <p>· Cales de vitrage : 4mm / 5mm périphériques</p>
                  <p>· Joints EPDM : Soudés dans les angles</p>
                  {item.accessoires.length > 0 && (
                    <p className="text-amber-800 font-medium">
                      · Accessoires : {item.accessoires.map(a => a.accessoireId).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop validation footer */}
        <div className="mt-8 pt-4 border-t-2 border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
          <div>Document généré par PRO-MENUISERIE PVC · Ne jamais modifier sans validation du responsable atelier</div>
          <div className="flex gap-8">
            <div>Opérateur scie : __________________</div>
            <div>Contrôle qualité : __________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

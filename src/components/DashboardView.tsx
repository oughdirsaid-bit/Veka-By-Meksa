import React from 'react';
import {
  Quotation,
  Order,
  Client,
  Project,
  ProfileItem,
  HardwareItem,
  GlassItem,
  CompanySettings
} from '../types';
import {
  FileText,
  ShoppingCart,
  Users,
  FolderKanban,
  AlertTriangle,
  Plus,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Building
} from 'lucide-react';

interface DashboardViewProps {
  quotations: Quotation[];
  orders: Order[];
  clients: Client[];
  projects: Project[];
  profiles: ProfileItem[];
  hardware: HardwareItem[];
  glass: GlassItem[];
  devise?: string;
  settings?: CompanySettings;
  onNavigate: (tab: string) => void;
  onOpenNewQuote: () => void;
  onOpenImport: () => void;
  onViewQuote: (quote: Quotation) => void;
  onViewOrder: (order: Order) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quotations,
  orders,
  clients,
  projects,
  profiles,
  hardware,
  glass,
  devise = 'DH',
  settings,
  onNavigate,
  onOpenNewQuote,
  onOpenImport,
  onViewQuote,
  onViewOrder
}) => {
  // Financial metrics
  const totalDevisActifs = quotations.reduce((acc, q) => acc + (q.totalNetHT || 0), 0);
  const totalCommandesTTC = orders.reduce((acc, o) => acc + (o.totalTTC || 0), 0);

  // Unconfigured count
  const unconfiguredProfiles = profiles.filter((p) => !p.isConfigured || p.prixAchatMl === null);
  const unconfiguredHardware = hardware.filter((h) => !h.isConfigured || h.prixAchat === null);
  const unconfiguredGlass = glass.filter((g) => !g.isConfigured || g.prixAchatM2 === null);
  const totalUnconfigured = unconfiguredProfiles.length + unconfiguredHardware.length + unconfiguredGlass.length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions & Company Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-4">
          {settings?.logoUrl ? (
            <div className="w-14 h-14 rounded-xl bg-white p-1 border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center">
              <img
                src={settings.logoUrl}
                alt={settings.nomEntreprise}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
              <Building className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                {settings?.nomEntreprise || 'PRO-MENUISERIE PVC'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                VEKA · MEKSA · ROTO
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
              Tableau de Bord Chiffrage & Fabrication
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings?.adresse ? `${settings.adresse}, ${settings.codePostal} ${settings.ville}` : 'Atelier de fabrication industrielle menuiserie PVC.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenImport}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Importer Excel / CSV
          </button>

          <button
            onClick={onOpenNewQuote}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Nouveau Devis
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Clean White */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Devis en cours */}
        <div className="p-4.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Devis en cours</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalDevisActifs.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {devise}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>{quotations.length} devis créés</span>
            <button onClick={() => onNavigate('devis')} className="text-blue-600 hover:text-blue-800 font-medium">
              Consulter →
            </button>
          </div>
        </div>

        {/* KPI 2: Commandes Atelier */}
        <div className="p-4.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Commandes Atelier</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {totalCommandesTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {devise}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>{orders.length} en fabrication</span>
            <button onClick={() => onNavigate('commandes')} className="text-emerald-700 hover:text-emerald-900 font-medium">
              Consulter →
            </button>
          </div>
        </div>

        {/* KPI 3: Clients & Affaires */}
        <div className="p-4.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Clients & Affaires</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {clients.length} <span className="text-xs font-normal text-slate-500">clients / {projects.length} affaires</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>Fiches actives</span>
            <button onClick={() => onNavigate('clients')} className="text-indigo-600 hover:text-indigo-800 font-medium">
              Gérer →
            </button>
          </div>
        </div>

        {/* KPI 4: Technical Integrity */}
        <div
          className={`p-4.5 rounded-xl border shadow-xs space-y-1 ${
            totalUnconfigured > 0
              ? 'bg-rose-50/50 border-rose-200'
              : 'bg-emerald-50/40 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
            <span className={totalUnconfigured > 0 ? 'text-rose-700' : 'text-emerald-700'}>
              Intégrité Données
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              totalUnconfigured > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {totalUnconfigured > 0 ? (
              <span className="text-rose-700">{totalUnconfigured} non configurés</span>
            ) : (
              <span className="text-emerald-700">100% Configuré</span>
            )}
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
            <span>Tarifs VEKA / Roto</span>
            <button onClick={() => onNavigate('profilés')} className="text-slate-800 hover:text-blue-600 font-medium">
              Compléter →
            </button>
          </div>
        </div>
      </div>

      {/* Warning Alert if articles need configuration */}
      {totalUnconfigured > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Avertissement Données Manquantes : </span>
              {unconfiguredProfiles.length} profilé(s), {unconfiguredHardware.length} quincaillerie(s) et{' '}
              {unconfiguredGlass.length} vitrage(s) n'ont pas de prix d'achat configuré.
              Conformément aux normes, aucun prix fictif n'est appliqué.
            </div>
          </div>
          <button
            onClick={onOpenImport}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap ml-4 transition-colors shadow-2xs"
          >
            Importer mes tarifs
          </button>
        </div>
      )}

      {/* Main Grid: Recent Quotes & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Devis (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Derniers Devis Chiffrés</h2>
            </div>
            <button
              onClick={() => onNavigate('devis')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              Consulter tous les devis ({quotations.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {quotations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucun devis enregistré. Cliquez sur "Nouveau Devis" pour démarrer.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {quotations.slice(0, 5).map((quote) => {
                const client = clients.find((c) => c.id === quote.clientId);
                return (
                  <div
                    key={quote.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                    onClick={() => onViewQuote(quote)}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {quote.numero} v{quote.version}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                          quote.statut === 'Accepte'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : quote.statut === 'Transmis'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : quote.statut === 'Refuse'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {quote.statut}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Client : <span className="text-slate-800 font-medium">{client?.nom || 'Client direct'}</span> · {quote.items.length} menuiserie(s)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {quote.totalNetHT.toFixed(2)} {devise} HT
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {quote.totalTTC.toFixed(2)} {devise} TTC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Orders in Production (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Fabrication Atelier</h2>
            </div>
            <button
              onClick={() => onNavigate('commandes')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
            >
              Fiches de débit ({orders.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Aucune commande active. Lorsqu'un devis est accepté, il bascule ici avec sa fiche de débit complète.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => {
                return (
                  <div
                    key={order.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                    onClick={() => onViewOrder(order)}
                  >
                    <div className="space-y-0.5">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {order.numeroCommande}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items.length} menuiseries · Réf {order.devisNumero}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.statut.replace(/_/g, ' ')}
                      </span>
                      <div className="text-[11px] font-mono text-slate-600 mt-1 font-medium">
                        {order.totalTTC.toFixed(2)} {devise} TTC
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

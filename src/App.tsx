import React, { useState, useEffect } from 'react';
import {
  Client,
  Project,
  Quotation,
  Order,
  PVCSystem,
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  CalculationRules,
  StockItem,
  CompanySettings,
  JoineryItem
} from './types';
import { storageService } from './services/storageService';
import { DashboardView } from './components/DashboardView';
import { ClientsProjectsView } from './components/ClientsProjectsView';
import { QuotationsView } from './components/QuotationsView';
import { OrdersView } from './components/OrdersView';
import { TechnicalCatalogsView } from './components/TechnicalCatalogsView';
import { SettingsView } from './components/SettingsView';
import { JoineryConfiguratorModal } from './components/JoineryConfiguratorModal';
import { QuotationPDFView } from './components/QuotationPDFView';
import { CuttingListView } from './components/CuttingListView';
import { ImportExportModal } from './components/ImportExportModal';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  ShoppingCart,
  Layers,
  Scissors,
  ShieldCheck,
  Box,
  Sliders,
  DollarSign,
  Settings,
  Database,
  FileSpreadsheet,
  Plus,
  Building,
  Menu,
  X,
  Search,
  Bell,
  User
} from 'lucide-react';

export default function App() {
  // Database states
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [rules, setRules] = useState<CalculationRules>(storageService.getRules());
  const [systems, setSystems] = useState<PVCSystem[]>(storageService.getSystems());
  const [profiles, setProfiles] = useState<ProfileItem[]>(storageService.getProfiles());
  const [hardware, setHardware] = useState<HardwareItem[]>(storageService.getHardware());
  const [glass, setGlass] = useState<GlassItem[]>(storageService.getGlass());
  const [accessories, setAccessories] = useState<AccessoryItem[]>(storageService.getAccessories());
  const [stock, setStock] = useState<StockItem[]>(storageService.getStock());
  const [clients, setClients] = useState<Client[]>(storageService.getClients());
  const [projects, setProjects] = useState<Project[]>(storageService.getProjects());
  const [quotations, setQuotations] = useState<Quotation[]>(storageService.getQuotations());
  const [orders, setOrders] = useState<Order[]>(storageService.getOrders());

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active document views (PDF Devis or Fiche de Débit)
  const [viewingQuote, setViewingQuote] = useState<Quotation | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Modals
  const [isConfiguratorOpen, setIsConfiguratorOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetQuoteIdForConfig, setTargetQuoteIdForConfig] = useState<string | null>(null);

  // Initialize storage once on mount
  useEffect(() => {
    storageService.initDefaultData();
    refreshAllData();
  }, []);

  const refreshAllData = () => {
    setSettings(storageService.getSettings());
    setRules(storageService.getRules());
    setSystems(storageService.getSystems());
    setProfiles(storageService.getProfiles());
    setHardware(storageService.getHardware());
    setGlass(storageService.getGlass());
    setAccessories(storageService.getAccessories());
    setStock(storageService.getStock());
    setClients(storageService.getClients());
    setProjects(storageService.getProjects());
    setQuotations(storageService.getQuotations());
    setOrders(storageService.getOrders());
  };

  // Quotation Actions
  const handleSaveQuotation = (quote: Quotation) => {
    const existing = quotations.find((q) => q.id === quote.id);
    let updated: Quotation[];
    if (existing) {
      updated = quotations.map((q) => (q.id === quote.id ? quote : q));
    } else {
      updated = [quote, ...quotations];
    }
    setQuotations(updated);
    storageService.saveQuotations(updated);
  };

  const handleDeleteQuotation = (id: string) => {
    if (window.confirm('Supprimer définitivement ce devis ?')) {
      const updated = quotations.filter((q) => q.id !== id);
      setQuotations(updated);
      storageService.saveQuotations(updated);
    }
  };

  const handleCreateNewQuote = () => {
    const nextNum = (quotations.length + 1).toString().padStart(4, '0');
    const newQuote: Quotation = {
      id: `quote_${Date.now()}`,
      numero: `DEV-2026-${nextNum}`,
      version: 1,
      dateDevis: new Date().toISOString().split('T')[0],
      dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      clientId: clients[0]?.id || '',
      projetId: projects[0]?.id || '',
      statut: 'Brouillon',
      tauxTva: settings.tauxTvaDefaut || 20,
      remiseGlobalePourcent: 0,
      items: [],
      totalFournitureHT: 0,
      totalPoseHT: 0,
      totalTransportHT: 0,
      totalRemiseHT: 0,
      totalNetHT: 0,
      totalTva: 0,
      totalTTC: 0,
      conditionsReglement: settings.conditionsDefaut,
      notesDevis: 'Chiffrage initial menuiseries PVC'
    };

    handleSaveQuotation(newQuote);
    setTargetQuoteIdForConfig(newQuote.id);
    setIsConfiguratorOpen(true);
  };

  // Convert Quote to Order
  const handleConvertToOrder = (quote: Quotation) => {
    const nextOrderNum = (orders.length + 1).toString().padStart(4, '0');
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      numeroCommande: `CMD-2026-${nextOrderNum}`,
      devisId: quote.id,
      devisNumero: quote.numero,
      clientId: quote.clientId,
      projetId: quote.projetId,
      dateCommande: new Date().toISOString().split('T')[0],
      dateLivraisonPrevue: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 weeks
      statut: 'Validee',
      acompteVerse: quote.totalTTC * 0.3,
      resteDuTTC: quote.totalTTC * 0.7,
      items: quote.items,
      totalTTC: quote.totalTTC,
      notesProduction: 'Commande validée avec acompte de 30% reçu.'
    };

    // Update quote status to accepted
    const updatedQuote: Quotation = {
      ...quote,
      statut: 'Accepte',
      dateAcceptation: new Date().toISOString().split('T')[0]
    };
    handleSaveQuotation(updatedQuote);

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    storageService.saveOrders(updatedOrders);

    // Switch to order view and show workshop sheet
    setViewingQuote(null);
    setViewingOrder(newOrder);
    setActiveTab('commandes');
  };

  // Add Item to Quotation from Configurator
  const handleSaveJoineryItem = (item: JoineryItem, targetProjId?: string, targetCliId?: string) => {
    if (targetQuoteIdForConfig) {
      const quote = quotations.find((q) => q.id === targetQuoteIdForConfig);
      if (quote) {
        const updatedItems = [...quote.items, item];
        const fournitureHT = updatedItems.reduce((acc, i) => acc + i.calcul.prixVenteFournitureHT * i.quantite, 0);
        const poseHT = updatedItems.reduce((acc, i) => acc + i.calcul.prixVentePoseHT * i.quantite, 0);
        const transportHT = updatedItems.reduce((acc, i) => acc + i.calcul.prixVenteTransportHT * i.quantite, 0);
        const netHT = fournitureHT + poseHT + transportHT;
        const tva = netHT * (quote.tauxTva / 100);
        const ttc = netHT + tva;

        const updatedQuote: Quotation = {
          ...quote,
          items: updatedItems,
          totalFournitureHT: fournitureHT,
          totalPoseHT: poseHT,
          totalTransportHT: transportHT,
          totalNetHT: netHT,
          totalTva: tva,
          totalTTC: ttc
        };
        handleSaveQuotation(updatedQuote);
        setViewingQuote(updatedQuote);
      }
    }
  };

  // Nav items configuration strictly adhering to prompt's requested menu structure:
  // TABLEAU DE BORD, CLIENTS, AFFAIRES / PROJETS, DEVIS, COMMANDES, GAMMES PVC,
  // PROFILÉS, QUINCAILLERIE, VITRAGES, ACCESSOIRES, TARIFS, RÈGLES DE CALCUL,
  // STOCK, PARAMÈTRES, IMPORT / EXPORT
  const menuSections = [
    {
      title: 'VUE GLOBALE',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard }
      ]
    },
    {
      title: 'COMMERCIAL',
      items: [
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'projets', label: 'Affaires / Projets', icon: FolderKanban },
        { id: 'devis', label: 'Devis', icon: FileText },
        { id: 'commandes', label: 'Commandes', icon: ShoppingCart }
      ]
    },
    {
      title: 'DONNÉES TECHNIQUES',
      items: [
        { id: 'gammes', label: 'Gammes PVC', icon: Layers },
        { id: 'profilés', label: 'Profilés', icon: Scissors },
        { id: 'quincaillerie', label: 'Quincaillerie', icon: ShieldCheck },
        { id: 'vitrages', label: 'Vitrages', icon: Box },
        { id: 'accessoires', label: 'Accessoires', icon: Sliders }
      ]
    },
    {
      title: 'MOTEUR & ATELIER',
      items: [
        { id: 'tarifs', label: 'Tarifs', icon: DollarSign },
        { id: 'règles', label: 'Règles de calcul', icon: Settings },
        { id: 'stock', label: 'Stock', icon: Box }
      ]
    },
    {
      title: 'SYSTÈME',
      items: [
        { id: 'import_export', label: 'Import / Export', icon: FileSpreadsheet },
        { id: 'paramètres', label: 'Paramètres', icon: Building }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation - Clean Enterprise White */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-64'
        } print:hidden`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header with Company Logo */}
          <div className="px-4 py-3.5 border-b border-slate-200/90 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              {settings.logoUrl ? (
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white p-0.5 border border-slate-200 shadow-xs shrink-0 flex items-center justify-center">
                  <img
                    src={settings.logoUrl}
                    alt={settings.nomEntreprise}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                  PVC
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-slate-900 truncate">
                  {settings.nomEntreprise || 'PRO-MENUISERIE PVC'}
                </div>
                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Chiffrage & Débit Atelier
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {menuSections.map((sec, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  {sec.title}
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'import_export') {
                          setIsImportModalOpen(true);
                        } else {
                          setActiveTab(item.id);
                          setViewingQuote(null);
                          setViewingOrder(null);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Bottom Info Bar */}
          <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between bg-slate-50/70">
            <span className="truncate font-medium text-slate-700">{settings.nomEntreprise}</span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              VEKA / Roto
            </span>
          </div>
        </div>
      </aside>

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar - Clean Professional White (Nom du logiciel, recherche, notifications, utilisateur connecté, version) */}
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 print:hidden z-10">
          {/* Zone 1: Mobile toggle + Breadcrumb & Version */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 tracking-tight hidden sm:inline">PRO-MENUISERIE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 hidden md:inline">
                v2.4 Pro
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-semibold capitalize text-blue-700">
                {activeTab.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Zone 2: Global Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher devis, client, profilé..."
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('devis');
                  }
                }}
              />
            </div>
          </div>

          {/* Zone 3: Quick Navigation, User, Notifications & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Quick counters */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 mr-1 border-r border-slate-200 pr-3">
              <button
                onClick={() => {
                  setActiveTab('devis');
                  setViewingQuote(null);
                  setViewingOrder(null);
                }}
                className="hover:text-blue-600 transition-colors"
              >
                Devis : <strong className="font-semibold text-slate-900">{quotations.length}</strong>
              </button>
              <button
                onClick={() => {
                  setActiveTab('commandes');
                  setViewingQuote(null);
                  setViewingOrder(null);
                }}
                className="hover:text-blue-600 transition-colors"
              >
                Commandes : <strong className="font-semibold text-slate-900">{orders.length}</strong>
              </button>
            </div>

            {/* Notifications Button */}
            <button
              type="button"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Notifications système"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full absolute top-1 right-1"></span>
            </button>

            {/* Connected User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/80">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Chiffreur Atelier</span>
            </div>

            {/* Import Button */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Import Excel</span>
            </button>

            {/* Primary Action Button - Professional Blue */}
            <button
              onClick={handleCreateNewQuote}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Devis</span>
            </button>
          </div>
        </header>

        {/* Dynamic Main Workspace View - Clean Light Background */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          {viewingQuote ? (
            <QuotationPDFView
              quotation={viewingQuote}
              client={clients.find((c) => c.id === viewingQuote.clientId)}
              project={projects.find((p) => p.id === viewingQuote.projetId)}
              settings={settings}
              onBack={() => setViewingQuote(null)}
              onConvertToOrder={handleConvertToOrder}
              onEdit={(quote) => {
                setTargetQuoteIdForConfig(quote.id);
                setIsConfiguratorOpen(true);
              }}
            />
          ) : viewingOrder ? (
            <CuttingListView
              order={viewingOrder}
              client={clients.find((c) => c.id === viewingOrder.clientId)}
              project={projects.find((p) => p.id === viewingOrder.projetId)}
              settings={settings}
              onBack={() => setViewingOrder(null)}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  quotations={quotations}
                  orders={orders}
                  clients={clients}
                  projects={projects}
                  profiles={profiles}
                  hardware={hardware}
                  glass={glass}
                  devise={settings.devise || 'DH'}
                  settings={settings}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenNewQuote={handleCreateNewQuote}
                  onOpenImport={() => setIsImportModalOpen(true)}
                  onViewQuote={(q) => setViewingQuote(q)}
                  onViewOrder={(o) => setViewingOrder(o)}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsProjectsView
                  clients={clients}
                  projects={projects}
                  activeSubTab="clients"
                  onSaveClient={(c) => {
                    const existing = clients.find((item) => item.id === c.id);
                    const updated = existing
                      ? clients.map((item) => (item.id === c.id ? c : item))
                      : [...clients, c];
                    setClients(updated);
                    storageService.saveClients(updated);
                  }}
                  onDeleteClient={(id) => {
                    if (window.confirm('Supprimer ce client ?')) {
                      const updated = clients.filter((c) => c.id !== id);
                      setClients(updated);
                      storageService.saveClients(updated);
                    }
                  }}
                  onSaveProject={(p) => {
                    const existing = projects.find((item) => item.id === p.id);
                    const updated = existing
                      ? projects.map((item) => (item.id === p.id ? p : item))
                      : [...projects, p];
                    setProjects(updated);
                    storageService.saveProjects(updated);
                  }}
                  onDeleteProject={(id) => {
                    if (window.confirm('Supprimer cette affaire ?')) {
                      const updated = projects.filter((p) => p.id !== id);
                      setProjects(updated);
                      storageService.saveProjects(updated);
                    }
                  }}
                  onSelectProjectForQuote={(p) => {
                    handleCreateNewQuote();
                  }}
                />
              )}

              {activeTab === 'projets' && (
                <ClientsProjectsView
                  clients={clients}
                  projects={projects}
                  activeSubTab="projets"
                  onSaveClient={(c) => {
                    const updated = clients.map((item) => (item.id === c.id ? c : item));
                    setClients(updated);
                    storageService.saveClients(updated);
                  }}
                  onDeleteClient={(id) => {
                    const updated = clients.filter((c) => c.id !== id);
                    setClients(updated);
                    storageService.saveClients(updated);
                  }}
                  onSaveProject={(p) => {
                    const existing = projects.find((item) => item.id === p.id);
                    const updated = existing
                      ? projects.map((item) => (item.id === p.id ? p : item))
                      : [...projects, p];
                    setProjects(updated);
                    storageService.saveProjects(updated);
                  }}
                  onDeleteProject={(id) => {
                    const updated = projects.filter((p) => p.id !== id);
                    setProjects(updated);
                    storageService.saveProjects(updated);
                  }}
                  onSelectProjectForQuote={(p) => {
                    handleCreateNewQuote();
                  }}
                />
              )}

              {activeTab === 'devis' && (
                <QuotationsView
                  quotations={quotations}
                  clients={clients}
                  projects={projects}
                  devise={settings.devise || 'DH'}
                  onSaveQuotation={handleSaveQuotation}
                  onDeleteQuotation={handleDeleteQuotation}
                  onViewQuoteDetails={(q) => setViewingQuote(q)}
                  onOpenConfiguratorForQuote={(qId) => {
                    setTargetQuoteIdForConfig(qId);
                    setIsConfiguratorOpen(true);
                  }}
                  onConvertToOrder={handleConvertToOrder}
                  onNewQuoteClick={handleCreateNewQuote}
                />
              )}

              {activeTab === 'commandes' && (
                <OrdersView
                  orders={orders}
                  clients={clients}
                  projects={projects}
                  devise={settings.devise || 'DH'}
                  onUpdateOrderStatus={(ordId, st) => {
                    const updated = orders.map((o) => (o.id === ordId ? { ...o, statut: st } : o));
                    setOrders(updated);
                    storageService.saveOrders(updated);
                  }}
                  onOpenCuttingSheet={(o) => setViewingOrder(o)}
                  onDeleteOrder={(ordId) => {
                    if (window.confirm('Supprimer cette commande ?')) {
                      const updated = orders.filter((o) => o.id !== ordId);
                      setOrders(updated);
                      storageService.saveOrders(updated);
                    }
                  }}
                />
              )}

              {(activeTab === 'gammes' ||
                activeTab === 'profilés' ||
                activeTab === 'quincaillerie' ||
                activeTab === 'vitrages' ||
                activeTab === 'accessoires' ||
                activeTab === 'tarifs' ||
                activeTab === 'règles' ||
                activeTab === 'stock') && (
                <TechnicalCatalogsView
                  activeTab={activeTab as any}
                  systems={systems}
                  profiles={profiles}
                  hardware={hardware}
                  glass={glass}
                  accessories={accessories}
                  rules={rules}
                  stock={stock}
                  devise={settings.devise || 'DH'}
                  onSaveSystems={(sys) => {
                    setSystems(sys);
                    storageService.saveSystems(sys);
                  }}
                  onSaveProfiles={(profs) => {
                    setProfiles(profs);
                    storageService.saveProfiles(profs);
                  }}
                  onSaveHardware={(hws) => {
                    setHardware(hws);
                    storageService.saveHardware(hws);
                  }}
                  onSaveGlass={(gl) => {
                    setGlass(gl);
                    storageService.saveGlass(gl);
                  }}
                  onSaveAccessories={(accs) => {
                    setAccessories(accs);
                    storageService.saveAccessories(accs);
                  }}
                  onSaveRules={(rls) => {
                    setRules(rls);
                    storageService.saveRules(rls);
                  }}
                  onSaveStock={(stk) => {
                    setStock(stk);
                    storageService.saveStock(stk);
                  }}
                  onOpenImport={() => setIsImportModalOpen(true)}
                />
              )}

              {activeTab === 'paramètres' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={(s) => {
                    setSettings(s);
                    storageService.saveSettings(s);
                  }}
                  onResetAllData={() => {
                    storageService.resetAllData();
                    refreshAllData();
                  }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Joinery Configurator Modal */}
      <JoineryConfiguratorModal
        isOpen={isConfiguratorOpen}
        onClose={() => setIsConfiguratorOpen(false)}
        onSave={handleSaveJoineryItem}
        clients={clients}
        projects={projects}
        systems={systems}
        profiles={profiles}
        hardware={hardware}
        glass={glass}
        accessories={accessories}
        rules={rules}
        devise={settings.devise || 'DH'}
        defaultClientId={
          targetQuoteIdForConfig
            ? quotations.find((q) => q.id === targetQuoteIdForConfig)?.clientId
            : undefined
        }
        defaultProjectId={
          targetQuoteIdForConfig
            ? quotations.find((q) => q.id === targetQuoteIdForConfig)?.projetId
            : undefined
        }
      />

      {/* Excel / CSV Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRefreshData={refreshAllData}
      />
    </div>
  );
}

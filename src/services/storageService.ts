import {
  PVCSystem,
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  CalculationRules,
  StockItem,
  Client,
  Project,
  Quotation,
  Order,
  CompanySettings
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_CALCULATION_RULES,
  INITIAL_SYSTEMS,
  INITIAL_PROFILES,
  INITIAL_HARDWARE,
  INITIAL_GLASS,
  INITIAL_ACCESSORIES,
  INITIAL_STOCK,
  INITIAL_CLIENTS,
  INITIAL_PROJECTS
} from '../data/seedData';
import { calculateJoinery } from './calculationEngine';

const STORAGE_KEYS = {
  SETTINGS: 'promenuiserie_settings',
  RULES: 'promenuiserie_rules',
  SYSTEMS: 'promenuiserie_systems',
  PROFILES: 'promenuiserie_profiles',
  HARDWARE: 'promenuiserie_hardware',
  GLASS: 'promenuiserie_glass',
  ACCESSORIES: 'promenuiserie_accessories',
  STOCK: 'promenuiserie_stock',
  CLIENTS: 'promenuiserie_clients',
  PROJECTS: 'promenuiserie_projects',
  QUOTATIONS: 'promenuiserie_quotations',
  ORDERS: 'promenuiserie_orders',
  INITIALIZED: 'promenuiserie_initialized_v5_veka_meksa_roto'
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const storageService = {
  getSettings(): CompanySettings {
    const s = getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!s.devise) {
      s.devise = 'DH';
    }
    if (!s.logoUrl) {
      s.logoUrl = INITIAL_SETTINGS.logoUrl || '/src/assets/images/pvc_company_logo_1790723227858.jpg';
    }
    return s;
  },
  saveSettings(settings: CompanySettings): void {
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },

  getRules(): CalculationRules {
    return getItem(STORAGE_KEYS.RULES, INITIAL_CALCULATION_RULES);
  },
  saveRules(rules: CalculationRules): void {
    setItem(STORAGE_KEYS.RULES, rules);
  },

  getSystems(): PVCSystem[] {
    return getItem(STORAGE_KEYS.SYSTEMS, INITIAL_SYSTEMS);
  },
  saveSystems(systems: PVCSystem[]): void {
    setItem(STORAGE_KEYS.SYSTEMS, systems);
  },

  getProfiles(): ProfileItem[] {
    return getItem(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
  },
  saveProfiles(profiles: ProfileItem[]): void {
    setItem(STORAGE_KEYS.PROFILES, profiles);
  },

  getHardware(): HardwareItem[] {
    return getItem(STORAGE_KEYS.HARDWARE, INITIAL_HARDWARE);
  },
  saveHardware(hardware: HardwareItem[]): void {
    setItem(STORAGE_KEYS.HARDWARE, hardware);
  },

  getGlass(): GlassItem[] {
    return getItem(STORAGE_KEYS.GLASS, INITIAL_GLASS);
  },
  saveGlass(glass: GlassItem[]): void {
    setItem(STORAGE_KEYS.GLASS, glass);
  },

  getAccessories(): AccessoryItem[] {
    return getItem(STORAGE_KEYS.ACCESSORIES, INITIAL_ACCESSORIES);
  },
  saveAccessories(accessories: AccessoryItem[]): void {
    setItem(STORAGE_KEYS.ACCESSORIES, accessories);
  },

  getStock(): StockItem[] {
    return getItem(STORAGE_KEYS.STOCK, INITIAL_STOCK);
  },
  saveStock(stock: StockItem[]): void {
    setItem(STORAGE_KEYS.STOCK, stock);
  },

  getClients(): Client[] {
    return getItem(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS);
  },
  saveClients(clients: Client[]): void {
    setItem(STORAGE_KEYS.CLIENTS, clients);
  },

  getProjects(): Project[] {
    return getItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  },
  saveProjects(projects: Project[]): void {
    setItem(STORAGE_KEYS.PROJECTS, projects);
  },

  getQuotations(): Quotation[] {
    return getItem(STORAGE_KEYS.QUOTATIONS, []);
  },
  saveQuotations(quotations: Quotation[]): void {
    setItem(STORAGE_KEYS.QUOTATIONS, quotations);
  },

  getOrders(): Order[] {
    return getItem(STORAGE_KEYS.ORDERS, []);
  },
  saveOrders(orders: Order[]): void {
    setItem(STORAGE_KEYS.ORDERS, orders);
  },

  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.initDefaultData(true);
  },

  initDefaultData(force = false): void {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized || force) {
      this.saveSettings(INITIAL_SETTINGS);
      this.saveRules(INITIAL_CALCULATION_RULES);
      this.saveSystems(INITIAL_SYSTEMS);
      this.saveProfiles(INITIAL_PROFILES);
      this.saveHardware(INITIAL_HARDWARE);
      this.saveGlass(INITIAL_GLASS);
      this.saveAccessories(INITIAL_ACCESSORIES);
      this.saveStock(INITIAL_STOCK);
      this.saveClients(INITIAL_CLIENTS);
      this.saveProjects(INITIAL_PROJECTS);

      // Create an initial sample quotation so the user sees a complete worked example
      const sampleItemCalc = calculateJoinery({
        type: 'Fenêtre',
        largeurMm: 1200,
        hauteurMm: 1450,
        quantite: 2,
        gamme: 'VEKA',
        systemId: 'veka_softline_70',
        configuration: '2_vantaux_OB_OF',
        couleur: 'Blanc RAL 9016',
        quincaillerieSystemId: 'roto_nx',
        vitrageId: 'glass_dv_4_16_4_argon',
        accessoires: [
          { accessoireId: 'roto_acc_f641101', quantite: 2 },
          { accessoireId: 'acc_grille_vmc_22', quantite: 1 }
        ],
        typePose: 'Applique_Neuf',
        inclurePose: true,
        inclureTransport: true,
        distanceKm: 25,
        systems: INITIAL_SYSTEMS,
        profiles: INITIAL_PROFILES,
        hardwares: INITIAL_HARDWARE,
        glasses: INITIAL_GLASS,
        accessoriesList: INITIAL_ACCESSORIES,
        rules: INITIAL_CALCULATION_RULES
      });

      const sampleItem2Calc = calculateJoinery({
        type: 'Porte-fenêtre',
        largeurMm: 1400,
        hauteurMm: 2150,
        quantite: 1,
        gamme: 'VEKA',
        systemId: 'veka_softline_70',
        configuration: '2_vantaux_OB_OF',
        couleur: 'Blanc RAL 9016',
        quincaillerieSystemId: 'roto_nx',
        vitrageId: 'glass_dv_acoustique_442',
        accessoires: [
          { accessoireId: 'roto_acc_f641101', quantite: 1 },
          { accessoireId: 'acc_volet_monobloc_moteur', quantite: 1 }
        ],
        typePose: 'Applique_Neuf',
        inclurePose: true,
        inclureTransport: false,
        systems: INITIAL_SYSTEMS,
        profiles: INITIAL_PROFILES,
        hardwares: INITIAL_HARDWARE,
        glasses: INITIAL_GLASS,
        accessoriesList: INITIAL_ACCESSORIES,
        rules: INITIAL_CALCULATION_RULES
      });

      const initialQuote: Quotation = {
        id: 'quote_demo_01',
        numero: 'DEV-2026-0042',
        version: 1,
        dateDevis: '2026-03-12',
        dateValidite: '2026-04-12',
        clientId: 'cli_dupont',
        projetId: 'proj_villa_californie',
        statut: 'Transmis',
        tauxTva: 20,
        remiseGlobalePourcent: 0,
        items: [
          {
            id: 'item_f01',
            repere: 'F01 - Salon',
            type: 'Fenêtre',
            largeurMm: 1200,
            hauteurMm: 1450,
            quantite: 2,
            gamme: 'VEKA',
            systemId: 'veka_softline_70',
            configuration: '2_vantaux_OB_OF',
            couleur: 'Blanc RAL 9016',
            quincaillerieSystemId: 'roto_nx',
            vitrageId: 'glass_dv_4_16_4_argon',
            accessoires: [
              { accessoireId: 'roto_acc_f641101', quantite: 2 },
              { accessoireId: 'acc_grille_vmc_22', quantite: 1 }
            ],
            typePose: 'Applique_Neuf',
            inclurePose: true,
            inclureTransport: true,
            distanceKm: 25,
            notesTechniques: 'Dormant VEKA 101.266 avec parclose 107.129. Double vitrage 4/16/4 faible émissivité.',
            calcul: sampleItemCalc
          },
          {
            id: 'item_pf01',
            repere: 'PF01 - Séjour Terrasse',
            type: 'Porte-fenêtre',
            largeurMm: 1400,
            hauteurMm: 2150,
            quantite: 1,
            gamme: 'VEKA',
            systemId: 'veka_softline_70',
            configuration: '2_vantaux_OB_OF',
            couleur: 'Blanc RAL 9016',
            quincaillerieSystemId: 'roto_nx',
            vitrageId: 'glass_dv_acoustique_442',
            accessoires: [
              { accessoireId: 'roto_acc_f641101', quantite: 1 },
              { accessoireId: 'acc_volet_monobloc_moteur', quantite: 1 }
            ],
            typePose: 'Applique_Neuf',
            inclurePose: true,
            inclureTransport: false,
            notesTechniques: 'Ouvrant PF 94mm 103.357 avec seuil aluminium RPT 104.591.',
            calcul: sampleItem2Calc
          }
        ],
        totalFournitureHT: sampleItemCalc.prixVenteFournitureHT * 2 + sampleItem2Calc.prixVenteFournitureHT,
        totalPoseHT: sampleItemCalc.prixVentePoseHT * 2 + sampleItem2Calc.prixVentePoseHT,
        totalTransportHT: sampleItemCalc.prixVenteTransportHT * 2,
        totalRemiseHT: 0,
        totalNetHT: (sampleItemCalc.prixVenteTotalHT * 2) + sampleItem2Calc.prixVenteTotalHT,
        totalTva: ((sampleItemCalc.prixVenteTotalHT * 2) + sampleItem2Calc.prixVenteTotalHT) * 0.20,
        totalTTC: ((sampleItemCalc.prixVenteTotalHT * 2) + sampleItem2Calc.prixVenteTotalHT) * 1.20,
        conditionsReglement: '30% à la commande, solde à la pose. Règlement par virement bancaire.',
        notesDevis: 'Fourniture et pose de menuiseries PVC certifiées NF / CSTB. Classement AEV A*4 E*7A V*A2.'
      };

      this.saveQuotations([initialQuote]);
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  },

  exportDatabaseToJson(): string {
    const fullDb = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      rules: this.getRules(),
      systems: this.getSystems(),
      profiles: this.getProfiles(),
      hardware: this.getHardware(),
      glass: this.getGlass(),
      accessories: this.getAccessories(),
      stock: this.getStock(),
      clients: this.getClients(),
      projects: this.getProjects(),
      quotations: this.getQuotations(),
      orders: this.getOrders()
    };
    return JSON.stringify(fullDb, null, 2);
  },

  importDatabaseFromJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) this.saveSettings(data.settings);
      if (data.rules) this.saveRules(data.rules);
      if (data.systems) this.saveSystems(data.systems);
      if (data.profiles) this.saveProfiles(data.profiles);
      if (data.hardware) this.saveHardware(data.hardware);
      if (data.glass) this.saveGlass(data.glass);
      if (data.accessories) this.saveAccessories(data.accessories);
      if (data.stock) this.saveStock(data.stock);
      if (data.clients) this.saveClients(data.clients);
      if (data.projects) this.saveProjects(data.projects);
      if (data.quotations) this.saveQuotations(data.quotations);
      if (data.orders) this.saveOrders(data.orders);
      return true;
    } catch (e) {
      console.error('Failed to import database JSON:', e);
      return false;
    }
  }
};

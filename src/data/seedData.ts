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
import { VEKA_PROFILES_DATA, VEKA_ACCESSORIES_DATA } from './vekaProfilesData';
import { MEKSA_PROFILES_DATA, MEKSA_ACCESSORIES_DATA } from './meksaProfilesData';
import { ROTO_HARDWARE_DATA, ROTO_ACCESSORIES_DATA } from './rotoHardwareData';

export const INITIAL_SETTINGS: CompanySettings = {
  nomEntreprise: 'PRO-MENUISERIE PVC',
  formeJuridique: 'SARL au capital de 100 000 DH',
  siret: 'RC : 489201 · IF : 3928172',
  rcs: 'Tribunal de Commerce de Casablanca',
  numeroTva: 'ICE : 002938472000038',
  codeApe: '4332A - Menuiserie PVC & Aluminium',
  assuranceDecennale: 'Garantie Décennale & Civile Professionnelle',
  adresse: 'Zone Industrielle Sidi Maârouf, Lot 14',
  codePostal: '20200',
  ville: 'Casablanca',
  telephone: '05 22 45 88 90',
  email: 'contact@menuiserie-pvc.ma',
  siteWeb: 'www.menuiserie-pvc.ma',
  iban: 'MA64 0117 8000 0012 3456 7890 1234',
  bic: 'BMCEMAMCXXX',
  tauxTvaDefaut: 20,
  validiteDevisJours: 30,
  conditionsDefaut: 'Acompte de 40% à la signature du devis. 30% à la fin de fabrication en atelier. Solde 30% à la livraison et pose. Validité de l\'offre : 30 jours.',
  logoUrl: '/src/assets/images/pvc_company_logo_1790723227858.jpg',
  devise: 'DH'
};

export const INITIAL_CALCULATION_RULES: CalculationRules = {
  id: 'rules_standard_pvc',
  nom: 'Règles standards fabrication menuiserie PVC (VEKA / MEKSA / Roto)',
  recouvrementDormantMm: 20,
  jeuFondDeFeuillureMm: 4,
  retraitVitrageMm: 12,
  deductionBattementCentralMm: 34,
  perteCoupeProfilMl: 5,
  majorationChutesPourcent: 8,
  tauxHoraireFabrication: 65.0, // 65 DH/h
  minutesFabricationParVantail: 40,
  minutesFabricationParCadre: 45,
  prixPoseAuM2: 120.0, // 120 DH/m²
  forfaitPoseMinimum: 250.0, // 250 DH
  prixTransportParKm: 3.50, // 3.50 DH/km
  forfaitTransportFixe: 150.0, // 150 DH fixe
  coefficientMargeDefault: 1.35
};

export const INITIAL_SYSTEMS: PVCSystem[] = [
  // VEKA
  {
    id: 'veka_softline_70',
    gamme: 'VEKA',
    nom: 'VEKA Softline 70',
    description: 'Système à 5 chambres 70 mm, double joint EPDM (Dormant 101.266 / 111.045, Ouvrant 103.316).',
    epaisseurDormantMm: 70,
    nombreChambres: 5,
    typeJoint: 'Frappe',
    isConfigured: true,
    notes: 'Tarif officiel VEKA Softline 70mm intégré (DH.HT/ML).'
  },
  {
    id: 'veka_ekosol',
    gamme: 'VEKA',
    nom: 'VEKA Coulissant Ekosol 70',
    description: 'Système coulissant PVC 2 et 3 rails, dormant 70mm / 112mm (Dormants 105.242 / 105.351 / 105.352).',
    epaisseurDormantMm: 70,
    nombreChambres: 3,
    typeJoint: 'Coulissant',
    isConfigured: true,
    notes: 'Tarif officiel VEKA Ekosol 70mm intégré (DH.HT/ML).'
  },
  {
    id: 'veka_softline_76',
    gamme: 'VEKA',
    nom: 'VEKA Softline 76',
    description: 'Système universel haute performance 76 mm.',
    epaisseurDormantMm: 76,
    nombreChambres: 5,
    typeJoint: 'Central',
    isConfigured: false,
    notes: 'À configurer via import CSV.'
  },
  {
    id: 'veka_softline_82',
    gamme: 'VEKA',
    nom: 'VEKA Softline 82',
    description: 'Système passif 82 mm triple joint.',
    epaisseurDormantMm: 82,
    nombreChambres: 7,
    typeJoint: 'Central',
    isConfigured: false,
    notes: 'À configurer via import CSV.'
  },
  {
    id: 'veka_trirail',
    gamme: 'VEKA',
    nom: 'VEKA Tri Rail',
    description: 'Coulissant grande largeur 3 rails.',
    epaisseurDormantMm: 112,
    nombreChambres: 4,
    typeJoint: 'Coulissant',
    isConfigured: true,
    notes: 'Dormant Tri-Rail 105.352 configuré dans Ekosol.'
  },

  // MEKSA
  {
    id: 'meksa_neotherm_60',
    gamme: 'MEKSA',
    nom: 'MEKSA Néotherm 60',
    description: 'Système PVC ouvrant français 60mm 3 chambres (Dormants SP6019 / SP6001, Ouvrant SP6003).',
    epaisseurDormantMm: 60,
    nombreChambres: 3,
    typeJoint: 'Frappe',
    isConfigured: true,
    notes: 'Tarif officiel MEKSA Néotherm 60mm intégré (DH.HT/ML).'
  },
  {
    id: 'meksa_confort_78',
    gamme: 'MEKSA',
    nom: 'MEKSA Coulissant Confort 78',
    description: 'Système coulissant confort 78mm (Dormants SP126 / SP124, Ouvrant SP123 48x80mm).',
    epaisseurDormantMm: 78,
    nombreChambres: 3,
    typeJoint: 'Coulissant',
    isConfigured: true,
    notes: 'Tarif officiel MEKSA Confort 78mm intégré (DH.HT/ML).'
  },
  {
    id: 'meksa_classic_58',
    gamme: 'MEKSA',
    nom: 'MEKSA Coulissant Classic 58',
    description: 'Système coulissant compact 58mm (Dormant SP197, Ouvrant SP196 38x66mm).',
    epaisseurDormantMm: 58,
    nombreChambres: 3,
    typeJoint: 'Coulissant',
    isConfigured: true,
    notes: 'Tarif officiel MEKSA Classic 58mm intégré (DH.HT/ML).'
  }
];

export const INITIAL_PROFILES: ProfileItem[] = [
  ...VEKA_PROFILES_DATA,
  ...MEKSA_PROFILES_DATA
];

export const INITIAL_HARDWARE: HardwareItem[] = [
  ...ROTO_HARDWARE_DATA
];

export const INITIAL_GLASS: GlassItem[] = [
  {
    id: 'glass_dv_4_16_4_argon',
    code: 'DV-4/16/4-ITR',
    designation: 'Double vitrage 4 / 16 / 4 ITR Gaz Argon + Intercalaire Warm-Edge',
    composition: '4 Planiclear / 16 Argon 90% / 4 Planitherm One',
    epaisseurMm: 24,
    prixAchatM2: 280.00,
    prixVenteM2: 420.00,
    prixMinimumM2: 200.00,
    surfaceMinimumM2: 0.5,
    fournisseur: 'Saint-Gobain Glass',
    coefficientUg: 1.1,
    affaiblissementRwDb: 31,
    isConfigured: true
  },
  {
    id: 'glass_dv_4_20_4_argon',
    code: 'DV-4/20/4-ITR',
    designation: 'Double vitrage 4 / 20 / 4 ITR Gaz Argon',
    composition: '4 Planiclear / 20 Argon 90% / 4 Planitherm XN',
    epaisseurMm: 28,
    prixAchatM2: 320.00,
    prixVenteM2: 480.00,
    prixMinimumM2: 220.00,
    surfaceMinimumM2: 0.5,
    fournisseur: 'Saint-Gobain Glass',
    coefficientUg: 1.1,
    affaiblissementRwDb: 32,
    isConfigured: true
  },
  {
    id: 'glass_dv_acoustique_442',
    code: 'DV-44.2/16/4-SILENCE',
    designation: 'Double vitrage Sécurité & Phonique Stadip Silence 44.2 / 16 / 4',
    composition: '44.2 Stadip Silence (8.76mm feuilleté) / 16 Argon / 4 ITR',
    epaisseurMm: 29,
    prixAchatM2: 550.00,
    prixVenteM2: 790.00,
    prixMinimumM2: 350.00,
    surfaceMinimumM2: 0.5,
    fournisseur: 'Saint-Gobain Glass',
    coefficientUg: 1.1,
    affaiblissementRwDb: 37,
    isConfigured: true
  },
  {
    id: 'glass_tv_4_14_4_14_4',
    code: 'TV-4/14/4/14/4-PASSIV',
    designation: 'Triple vitrage 4 / 14 / 4 / 14 / 4 Haute Performance Énergétique',
    composition: '4 ITR / 14 Argon / 4 clair / 14 Argon / 4 ITR',
    epaisseurMm: 40,
    prixAchatM2: 680.00,
    prixVenteM2: 950.00,
    prixMinimumM2: 400.00,
    surfaceMinimumM2: 0.6,
    fournisseur: 'Saint-Gobain Glass',
    coefficientUg: 0.6,
    affaiblissementRwDb: 34,
    isConfigured: true
  },
  {
    id: 'glass_sv_6mm',
    code: 'SV-6MM-CLAIR',
    designation: 'Simple vitrage 6mm Clair',
    composition: '6mm Planiclear',
    epaisseurMm: 6,
    prixAchatM2: 120.00,
    prixVenteM2: 180.00,
    prixMinimumM2: 90.00,
    surfaceMinimumM2: 0.5,
    fournisseur: 'Miroiterie',
    coefficientUg: 5.7,
    affaiblissementRwDb: 31,
    isConfigured: true
  }
];

export const INITIAL_ACCESSORIES: AccessoryItem[] = [
  ...ROTO_ACCESSORIES_DATA,
  ...VEKA_ACCESSORIES_DATA,
  ...MEKSA_ACCESSORIES_DATA,
  // Standard complements
  {
    id: 'acc_grille_vmc_22',
    reference: 'ALDES-MINI-EMA-22',
    designation: 'Grille d\'aération autoréglable acoustique 22 m³/h',
    categorie: 'Grille ventilation',
    unite: 'U',
    prixAchat: 140.00,
    prixVente: 220.00,
    isConfigured: true,
    description: 'Affaiblissement acoustique Dn,e,w 37 dB.'
  },
  {
    id: 'acc_grille_vmc_30',
    reference: 'ALDES-MINI-EMA-30',
    designation: 'Grille d\'aération autoréglable acoustique 30 m³/h',
    categorie: 'Grille ventilation',
    unite: 'U',
    prixAchat: 160.00,
    prixVente: 250.00,
    isConfigured: true,
    description: 'Conforme réglementation ventilation.'
  },
  {
    id: 'acc_tapee_iso_100',
    reference: 'TAPEE-PVC-100',
    designation: 'Tapée d\'isolation PVC clipsable 100 mm',
    categorie: 'Tapée d\'isolation',
    unite: 'ML',
    prixAchat: 48.00,
    prixVente: 75.00,
    isConfigured: true,
    description: 'Pour pose en neuf isolation 100 mm.'
  },
  {
    id: 'acc_tapee_iso_120',
    reference: 'TAPEE-PVC-120',
    designation: 'Tapée d\'isolation PVC clipsable 120 mm',
    categorie: 'Tapée d\'isolation',
    unite: 'ML',
    prixAchat: 54.00,
    prixVente: 85.00,
    isConfigured: true,
    description: 'Pour pose en neuf isolation 120 mm.'
  },
  {
    id: 'acc_volet_monobloc_moteur',
    reference: 'VR-MONO-SOMFY',
    designation: 'Bloc-baie volet roulant PVC coffre isolé lames alu motorisé',
    categorie: 'Volet roulant',
    unite: 'U',
    prixAchat: 1850.00,
    prixVente: 2600.00,
    isConfigured: true,
    description: 'Coffre thermiquement isolé intégré en traverse haute.'
  }
];

export const INITIAL_STOCK: StockItem[] = [
  {
    id: 'stk_1',
    articleType: 'Profile',
    articleId: 'veka_101266',
    reference: '101.266',
    designation: 'Dormant SP VEKA Softline 70',
    quantiteEnStock: 48,
    seuilMinimum: 15,
    unite: 'Barres 6.5m',
    emplacement: 'Râtelier A-01'
  },
  {
    id: 'stk_2',
    articleType: 'Profile',
    articleId: 'veka_103316',
    reference: '103.316',
    designation: 'Ouvrant Fn VEKA Softline 70',
    quantiteEnStock: 36,
    seuilMinimum: 12,
    unite: 'Barres 6.5m',
    emplacement: 'Râtelier A-04'
  },
  {
    id: 'stk_3',
    articleType: 'Profile',
    articleId: 'meksa_sp6001',
    reference: 'SP6001',
    designation: 'Dormant O/F MEKSA Néotherm 60',
    quantiteEnStock: 30,
    seuilMinimum: 10,
    unite: 'Barres 6m',
    emplacement: 'Râtelier B-02'
  },
  {
    id: 'stk_4',
    articleType: 'Profile',
    articleId: 'meksa_sp6003',
    reference: 'SP6003',
    designation: 'Ouvrant OF MEKSA Néotherm 60',
    quantiteEnStock: 25,
    seuilMinimum: 10,
    unite: 'Barres 6m',
    emplacement: 'Râtelier B-05'
  },
  {
    id: 'stk_5',
    articleType: 'Hardware',
    articleId: 'roto_f794638',
    reference: 'F794638',
    designation: 'NX CREM OB F15 2090/1000 3E',
    quantiteEnStock: 22,
    seuilMinimum: 10,
    unite: 'Pièces',
    emplacement: 'Bac ROTO-NX-01'
  },
  {
    id: 'stk_6',
    articleType: 'Accessory',
    articleId: 'roto_acc_f641101',
    reference: 'F641101',
    designation: 'Poignée Secustik Blanche Roto',
    quantiteEnStock: 65,
    seuilMinimum: 25,
    unite: 'Pièces',
    emplacement: 'Bac ACC-08'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli_dupont',
    codeClient: 'CLI-001',
    nom: 'Benjelloun',
    prenom: 'Karim & Samira',
    type: 'Particulier',
    email: 'k.benjelloun@gmail.com',
    telephone: '06 61 23 45 67',
    adresse: 'Villa 12, Résidence Les Palmiers, Californie',
    codePostal: '20150',
    ville: 'Casablanca',
    remiseCommercialePourcent: 0,
    notes: 'Remplacement menuiseries villa par PVC VEKA Softline 70 haute isolation phonique et thermique.',
    dateCreation: '2026-03-10'
  },
  {
    id: 'cli_batipro',
    codeClient: 'CLI-002',
    nom: 'Atlas Bâtiment Pro',
    raisonSociale: 'SARL Atlas Bâtiment & Travaux',
    type: 'Professionnel',
    siret: 'RC : 389201 · IF : 489201',
    tvaIntra: 'ICE : 001928374000021',
    email: 'chantiers@atlas-bat.ma',
    telephone: '05 22 88 99 00',
    adresse: 'Boulevard Chefchaouni, Ain Sebaâ',
    codePostal: '20250',
    ville: 'Casablanca',
    remiseCommercialePourcent: 10,
    notes: 'Promoteur partenaire régulier. Gamme MEKSA Néotherm 60 et coulissants Confort 78.',
    dateCreation: '2026-02-15'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_villa_californie',
    codeProjet: 'AFF-2026-001',
    nom: 'Rénovation Villa Californie',
    clientId: 'cli_dupont',
    adresseChantier: 'Villa 12, Les Palmiers, Californie, Casablanca',
    dateCreation: '2026-03-10',
    statut: 'Devis_Envoye',
    notes: 'Menuiseries VEKA Softline 70 Blanc et baies coulissantes Ekosol.'
  },
  {
    id: 'proj_residence_atlas',
    codeProjet: 'AFF-2026-002',
    nom: 'Immeuble Résidence Atlas Lot 8',
    clientId: 'cli_batipro',
    adresseChantier: 'Lotissement Al Mansour, Bouskoura',
    dateCreation: '2026-03-15',
    statut: 'Chiffre',
    notes: 'Fenêtres 2 vantaux MEKSA Néotherm 60 et coulissants MEKSA Confort 78.'
  }
];

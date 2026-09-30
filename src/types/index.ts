export type ProfileType =
  | 'Dormant'
  | 'Ouvrant'
  | 'Battement'
  | 'Meneau'
  | 'Traverse'
  | 'Parclose'
  | 'Renfort'
  | 'Seuil'
  | 'Couvre-joint'
  | 'Habillage'
  | 'Stulp'
  | 'Autre';

export type WindowType =
  | 'Fenêtre'
  | 'Porte-fenêtre'
  | 'Baie coulissante'
  | 'Coulissant'
  | 'Porte'
  | 'Fixe'
  | 'Ensemble composé';

export type OpeningConfiguration =
  | '1_vantail_OF'
  | '1_vantail_OB'
  | '2_vantaux_OF'
  | '2_vantaux_OB_OF'
  | '3_vantaux'
  | 'fixe'
  | 'coulissant_2V'
  | 'coulissant_3V'
  | 'porte_entree';

export type ItemStatus = 'VALIDE' | 'A_VERIFIER' | 'NON_CONFIGURE';

export interface PVCSystem {
  id: string;
  gamme: 'VEKA' | 'MEKSA' | 'AUTRE';
  nom: string; // e.g. Softline 70, Softline 76, Softline 82, Ekosol, Tri Rail, HI-5, Move, Patio Lift, Patio Fold
  description: string;
  epaisseurDormantMm: number;
  nombreChambres: number;
  typeJoint: 'Frappe' | 'Central' | 'Coulissant';
  isConfigured: boolean;
  notes?: string;
}

export interface ProfileItem {
  id: string;
  fournisseur: string; // e.g. VEKA, MEKSA
  gammeId: string;
  systemId: string;
  reference: string;
  designation: string;
  type: ProfileType;
  description: string;
  couleur: string;
  longueurBarreMm: number; // e.g. 6000 ou 6500 mm
  prixAchatMl: number | null; // null si non configuré
  prixRevientMl: number | null;
  prixVenteMl: number | null;
  unite: 'ML' | 'Barre' | 'U';
  poidsKgMl: number | null;
  largeurProfilMm: number; // ex: 70mm
  hauteurProfilMm: number; // ex: 67mm
  prixFinitions?: {
    blanc?: number | null;
    spectral?: number | null;
    renolitPX?: number | null;
    renolitMX?: number | null;
    renolitPFX?: number | null;
    anodise?: number | null;
    laque?: number | null;
    brut?: number | null;
  };
  referenceRenfort?: string;
  isActif: boolean;
  isConfigured: boolean;
  notes?: string;
}

export interface HardwareItem {
  id: string;
  fabricant: 'Roto' | 'Autre';
  systeme: 'Roto NX' | 'Roto NT' | 'Roto Alversa' | 'Roto Patio Lift' | 'Roto Patio Fold' | 'Autre';
  referenceExacte: string;
  designation: string;
  type: 'Crémone' | 'Compas' | 'Paumelle' | 'Gâche' | 'Renvoi d\'angle' | 'Verrou' | 'Garniture' | 'Kit complet' | 'Autre';
  dimensionMinMm?: number;
  dimensionMaxMm?: number;
  unite: 'U' | 'Jeu' | 'Kit';
  prixAchat: number | null;
  prixVente: number | null;
  quantiteParVantail: number;
  compatibiliteGamme?: string[];
  isConfigured: boolean;
  regleSelection?: string;
}

export interface GlassItem {
  id: string;
  code: string;
  designation: string; // e.g. Double vitrage 4/16/4 ITR + Gaz Argon
  composition: string;
  epaisseurMm: number;
  prixAchatM2: number | null;
  prixVenteM2: number | null;
  prixMinimumM2: number | null;
  surfaceMinimumM2: number;
  fournisseur: string;
  coefficientUg: number; // W/m²K
  affaiblissementRwDb: number; // dB
  isConfigured: boolean;
}

export interface AccessoryItem {
  id: string;
  reference: string;
  designation: string;
  categorie: 'Poignée' | 'Grille ventilation' | 'Tapée d\'isolation' | 'Volet roulant' | 'Cornière' | 'Appui' | 'Autre';
  unite: 'U' | 'ML' | 'Kit';
  prixAchat: number | null;
  prixVente: number | null;
  isConfigured: boolean;
  description?: string;
}

export interface CalculationRules {
  id: string;
  nom: string;
  recouvrementDormantMm: number; // typiquement 20mm
  jeuFondDeFeuillureMm: number; // typiquement 4 à 5mm
  retraitVitrageMm: number; // typiquement 10 à 12mm de prise dans l'ouvrant
  deductionBattementCentralMm: number;
  perteCoupeProfilMl: number; // mm perdus par trait de scie (ex 5mm)
  majorationChutesPourcent: number; // ex: 10%
  tauxHoraireFabrication: number; // €/heure
  minutesFabricationParVantail: number; // ex: 45 min
  minutesFabricationParCadre: number; // ex: 60 min
  prixPoseAuM2: number; // €/m²
  forfaitPoseMinimum: number; // € minimum
  prixTransportParKm: number; // €/km
  forfaitTransportFixe: number; // € fixe
  coefficientMargeDefault: number; // ex: 1.40
}

export interface StockItem {
  id: string;
  articleType: 'Profile' | 'Hardware' | 'Glass' | 'Accessory';
  articleId: string;
  reference: string;
  designation: string;
  quantiteEnStock: number;
  seuilMinimum: number;
  unite: string;
  emplacement?: string;
}

export interface Client {
  id: string;
  codeClient: string;
  nom: string;
  prenom?: string;
  raisonSociale?: string;
  type: 'Particulier' | 'Professionnel';
  email: string;
  telephone: string;
  adresse: string;
  codePostal: string;
  ville: string;
  siret?: string;
  tvaIntra?: string;
  remiseCommercialePourcent: number;
  notes?: string;
  dateCreation: string;
}

export interface Project {
  id: string;
  codeProjet: string;
  nom: string;
  clientId: string;
  adresseChantier: string;
  dateCreation: string;
  statut: 'Etude' | 'Chiffre' | 'Devis_Envoye' | 'Negociation' | 'Gagne' | 'Perdu' | 'Chantier_En_Cours' | 'Termine';
  notes?: string;
}

export interface WindowCutItem {
  profil: string;
  reference: string;
  designation: string;
  quantite: number;
  longueurMm: number;
  angleGauche: '45°' | '90°';
  angleDroit: '45°' | '90°';
  avecRenfort: boolean;
  longueurRenfortMm?: number;
  referenceRenfort?: string;
}

export interface JoineryItemCalculation {
  surfaceM2: number;
  perimetreMl: number;
  
  // Costs
  coutProfilsHT: number;
  coutRenfortsHT: number;
  coutQuincaillerieHT: number;
  coutVitrageHT: number;
  coutAccessoiresHT: number;
  coutFabricationHT: number;
  coutPoseHT: number;
  coutTransportHT: number;
  coutTotalRevientHT: number;
  
  // Selling Prices
  margePourcent: number;
  coefficientMarge: number;
  prixVenteFournitureHT: number;
  prixVentePoseHT: number;
  prixVenteTransportHT: number;
  prixVenteTotalHT: number;
  prixVenteTTC: number;
  
  // Technical cuts
  cuts: WindowCutItem[];
  vitrageDimensions: { largeurMm: number; hauteurMm: number; quantite: number; surfaceM2: number }[];
  
  // Auditing / Missing Data flags
  status: ItemStatus;
  warnings: string[];
}

export interface JoineryItem {
  id: string;
  repere: string; // e.g. F01, F02, PF01, BC01
  type: WindowType;
  largeurMm: number;
  hauteurMm: number;
  quantite: number;
  gamme: 'VEKA' | 'MEKSA' | 'AUTRE';
  systemId: string;
  configuration: OpeningConfiguration;
  couleur: string;
  quincaillerieSystemId: string;
  vitrageId: string;
  accessoires: { accessoireId: string; quantite: number }[];
  typePose: 'Applique_Neuf' | 'Renovation_Dormant_Existant' | 'Tunnel' | 'Feuillure';
  inclurePose: boolean;
  inclureTransport: boolean;
  distanceKm?: number;
  notesTechniques?: string;
  
  // Real-time calculation snapshot
  calcul: JoineryItemCalculation;
}

export interface Quotation {
  id: string;
  numero: string; // e.g. DEV-2026-0001
  version: number; // e.g. 1, 2, 3
  dateDevis: string;
  dateValidite: string;
  clientId: string;
  projetId: string;
  statut: 'Brouillon' | 'Transmis' | 'Accepte' | 'Refuse' | 'Perime';
  tauxTva: number; // 20, 10, 5.5
  remiseGlobalePourcent: number;
  items: JoineryItem[];
  
  // Totals
  totalFournitureHT: number;
  totalPoseHT: number;
  totalTransportHT: number;
  totalRemiseHT: number;
  totalNetHT: number;
  totalTva: number;
  totalTTC: number;
  
  conditionsReglement: string;
  notesDevis?: string;
  dateAcceptation?: string;
}

export interface Order {
  id: string;
  numeroCommande: string; // e.g. CMD-2026-0001
  devisId: string;
  devisNumero: string;
  clientId: string;
  projetId: string;
  dateCommande: string;
  dateLivraisonPrevue: string;
  statut: 'En_Attente' | 'Validee' | 'Debit_En_Cours' | 'Assemblage' | 'Pret' | 'Livre_Pose' | 'Termine';
  acompteVerse: number;
  resteDuTTC: number;
  items: JoineryItem[];
  totalTTC: number;
  notesProduction?: string;
}

export interface CompanySettings {
  nomEntreprise: string;
  formeJuridique: string;
  siret: string;
  rcs: string;
  numeroTva: string;
  codeApe: string;
  assuranceDecennale: string;
  adresse: string;
  codePostal: string;
  ville: string;
  telephone: string;
  email: string;
  siteWeb: string;
  iban: string;
  bic: string;
  tauxTvaDefaut: number;
  validiteDevisJours: number;
  conditionsDefaut: string;
  logoUrl?: string;
  devise?: string; // 'DH' ou '€'
}

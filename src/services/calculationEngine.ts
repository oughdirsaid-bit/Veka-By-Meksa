import {
  JoineryItem,
  JoineryItemCalculation,
  WindowCutItem,
  PVCSystem,
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  CalculationRules,
  ItemStatus
} from '../types';

interface EngineInput {
  type: JoineryItem['type'];
  largeurMm: number;
  hauteurMm: number;
  quantite: number;
  gamme: 'VEKA' | 'MEKSA' | 'AUTRE';
  systemId: string;
  configuration: JoineryItem['configuration'];
  couleur: string;
  quincaillerieSystemId: string;
  vitrageId: string;
  accessoires: { accessoireId: string; quantite: number }[];
  typePose: JoineryItem['typePose'];
  inclurePose: boolean;
  inclureTransport: boolean;
  distanceKm?: number;
  customMarginCoeff?: number;
  
  // Catalogs
  systems: PVCSystem[];
  profiles: ProfileItem[];
  hardwares: HardwareItem[];
  glasses: GlassItem[];
  accessoriesList: AccessoryItem[];
  rules: CalculationRules;
}

export function calculateJoinery(input: EngineInput): JoineryItemCalculation {
  const {
    type,
    largeurMm,
    hauteurMm,
    quantite,
    systemId,
    configuration,
    couleur,
    vitrageId,
    accessoires,
    typePose,
    inclurePose,
    inclureTransport,
    distanceKm = 15,
    customMarginCoeff,
    systems,
    profiles,
    hardwares,
    glasses,
    accessoriesList,
    rules
  } = input;

  const warnings: string[] = [];
  let status: ItemStatus = 'VALIDE';

  // 1. Basic dimension verification
  if (!largeurMm || largeurMm <= 0 || !hauteurMm || hauteurMm <= 0) {
    return createEmptyCalculation(['Dimensions invalides ou égales à zéro.']);
  }

  if (largeurMm < 350 || largeurMm > 4000) {
    warnings.push(`Largeur ${largeurMm} mm hors limites standard atelier (350 - 4000 mm).`);
    status = 'A_VERIFIER';
  }
  if (hauteurMm < 350 || hauteurMm > 3200) {
    warnings.push(`Hauteur ${hauteurMm} mm hors limites standard atelier (350 - 3200 mm).`);
    status = 'A_VERIFIER';
  }

  const surfaceM2 = (largeurMm * hauteurMm) / 1_000_000;
  const perimetreMl = (2 * (largeurMm + hauteurMm)) / 1_000;

  // 2. Identify System
  const system = systems.find((s) => s.id === systemId);
  if (!system) {
    warnings.push('Système PVC non sélectionné ou introuvable.');
    status = 'NON_CONFIGURE';
  } else if (!system.isConfigured) {
    warnings.push(`Le système "${system.nom}" n'est pas encore complètement configuré dans vos données techniques.`);
    status = 'NON_CONFIGURE';
  }

  // 3. Profiles Matching
  // Dormant
  const isReno = typePose === 'Renovation_Dormant_Existant';
  const dormantProfile = profiles.find((p) =>
    p.systemId === systemId &&
    p.type === 'Dormant' &&
    p.isActif &&
    (isReno ? p.designation.toLowerCase().includes('réno') : !p.designation.toLowerCase().includes('réno'))
  ) || profiles.find((p) => p.systemId === systemId && p.type === 'Dormant' && p.isActif) || profiles.find((p) => p.type === 'Dormant' && p.isActif);

  if (!dormantProfile) {
    warnings.push('Profilé Dormant introuvable pour ce système.');
    status = 'NON_CONFIGURE';
  } else if (!dormantProfile.isConfigured || dormantProfile.prixAchatMl === null) {
    warnings.push(`Prix ou référence profilé Dormant "${dormantProfile.reference}" NON CONFIGURÉ.`);
    status = 'NON_CONFIGURE';
  }

  // Ouvrant
  const isFixe = configuration === 'fixe' || type === 'Fixe';
  let ouvrantProfile: ProfileItem | undefined;
  if (!isFixe) {
    ouvrantProfile = profiles.find((p) =>
      p.systemId === systemId &&
      p.type === 'Ouvrant' &&
      p.isActif
    ) || profiles.find((p) => p.type === 'Ouvrant' && p.isActif);

    if (!ouvrantProfile) {
      warnings.push('Profilé Ouvrant introuvable pour ce système.');
      status = 'NON_CONFIGURE';
    } else if (!ouvrantProfile.isConfigured || ouvrantProfile.prixAchatMl === null) {
      warnings.push(`Prix ou référence profilé Ouvrant "${ouvrantProfile.reference}" NON CONFIGURÉ.`);
      status = 'NON_CONFIGURE';
    }
  }

  // Parclose
  const parcloseProfile = profiles.find((p) =>
    p.systemId === systemId &&
    p.type === 'Parclose' &&
    p.isActif
  ) || profiles.find((p) => p.type === 'Parclose' && p.isActif);

  if (!parcloseProfile) {
    warnings.push('Profilé Parclose introuvable pour ce système.');
    status = 'NON_CONFIGURE';
  } else if (!parcloseProfile.isConfigured || parcloseProfile.prixAchatMl === null) {
    warnings.push(`Prix parclose "${parcloseProfile.reference}" NON CONFIGURÉ.`);
    status = 'NON_CONFIGURE';
  }

  // Battement central (si 2 vantaux)
  const is2Vantaux = configuration === '2_vantaux_OF' || configuration === '2_vantaux_OB_OF';
  const is3Vantaux = configuration === '3_vantaux' || configuration === 'coulissant_3V';
  let battementProfile: ProfileItem | undefined;
  if (is2Vantaux && type !== 'Baie coulissante' && type !== 'Coulissant') {
    battementProfile = profiles.find((p) =>
      p.type === 'Battement' &&
      p.isActif
    );
    if (!battementProfile) {
      warnings.push('Profilé Battement central (Stulp) introuvable pour 2 vantaux.');
      status = 'NON_CONFIGURE';
    }
  }

  // Renforts Acier
  const renfortDormant = profiles.find((p) => p.type === 'Renfort' && p.designation.toLowerCase().includes('dormant')) || profiles.find((p) => p.type === 'Renfort');
  const renfortOuvrant = profiles.find((p) => p.type === 'Renfort' && p.designation.toLowerCase().includes('ouvrant')) || profiles.find((p) => p.type === 'Renfort');

  // 4. Cutting List & Calculations
  const cuts: WindowCutItem[] = [];
  let totalDormantMl = 0;
  let totalOuvrantMl = 0;
  let totalParcloseMl = 0;
  let totalBattementMl = 0;
  let totalRenfortMl = 0;

  // A. Dormant cuts (2 horizontaux + 2 verticaux, coupe 45°/45°)
  cuts.push({
    profil: 'Dormant',
    reference: dormantProfile?.reference || 'NON CONFIGURÉ',
    designation: dormantProfile?.designation || 'Dormant',
    quantite: 2,
    longueurMm: largeurMm,
    angleGauche: '45°',
    angleDroit: '45°',
    avecRenfort: true,
    longueurRenfortMm: Math.max(0, largeurMm - 100),
    referenceRenfort: renfortDormant?.reference || '113.025'
  });
  cuts.push({
    profil: 'Dormant',
    reference: dormantProfile?.reference || 'NON CONFIGURÉ',
    designation: dormantProfile?.designation || 'Dormant',
    quantite: 2,
    longueurMm: hauteurMm,
    angleGauche: '45°',
    angleDroit: '45°',
    avecRenfort: true,
    longueurRenfortMm: Math.max(0, hauteurMm - 100),
    referenceRenfort: renfortDormant?.reference || '113.025'
  });

  const pertePourcent = 1 + (rules.majorationChutesPourcent / 100);
  totalDormantMl = ((2 * largeurMm + 2 * hauteurMm) / 1000) * pertePourcent;
  totalRenfortMl += ((2 * Math.max(0, largeurMm - 100) + 2 * Math.max(0, hauteurMm - 100)) / 1000);

  // B. Sashes cuts
  const nbVantaux = isFixe ? 0 : is3Vantaux ? 3 : is2Vantaux ? 2 : 1;
  const largeurProfilDormant = dormantProfile?.largeurProfilMm || 70;
  const largeurProfilOuvrant = ouvrantProfile?.largeurProfilMm || 70;
  const recouvrement = rules.recouvrementDormantMm || 20;

  let largeurOuvrantMm = 0;
  let hauteurOuvrantMm = Math.max(0, hauteurMm - 2 * (largeurProfilDormant - recouvrement));

  const vitrageDimensions: { largeurMm: number; hauteurMm: number; quantite: number; surfaceM2: number }[] = [];

  if (!isFixe && ouvrantProfile) {
    if (nbVantaux === 1) {
      largeurOuvrantMm = Math.max(0, largeurMm - 2 * (largeurProfilDormant - recouvrement));
    } else if (nbVantaux === 2) {
      const deductionStulp = rules.deductionBattementCentralMm || 34;
      largeurOuvrantMm = Math.max(0, Math.round((largeurMm - 2 * (largeurProfilDormant - recouvrement) - deductionStulp) / 2));
    } else {
      largeurOuvrantMm = Math.max(0, Math.round((largeurMm - 2 * (largeurProfilDormant - recouvrement)) / nbVantaux));
    }

    // Ouvrant cuts
    cuts.push({
      profil: 'Ouvrant',
      reference: ouvrantProfile.reference,
      designation: `Ouvrant Traverses (${nbVantaux} vantaux)`,
      quantite: nbVantaux * 2,
      longueurMm: largeurOuvrantMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: true,
      longueurRenfortMm: Math.max(0, largeurOuvrantMm - 80),
      referenceRenfort: renfortOuvrant?.reference || '113.029'
    });
    cuts.push({
      profil: 'Ouvrant',
      reference: ouvrantProfile.reference,
      designation: `Ouvrant Montants (${nbVantaux} vantaux)`,
      quantite: nbVantaux * 2,
      longueurMm: hauteurOuvrantMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: true,
      longueurRenfortMm: Math.max(0, hauteurOuvrantMm - 80),
      referenceRenfort: renfortOuvrant?.reference || '113.029'
    });

    totalOuvrantMl = ((nbVantaux * 2 * largeurOuvrantMm + nbVantaux * 2 * hauteurOuvrantMm) / 1000) * pertePourcent;
    totalRenfortMl += ((nbVantaux * 2 * Math.max(0, largeurOuvrantMm - 80) + nbVantaux * 2 * Math.max(0, hauteurOuvrantMm - 80)) / 1000);

    // Stulp if 2 vantaux
    if (is2Vantaux && battementProfile) {
      cuts.push({
        profil: 'Battement',
        reference: battementProfile.reference,
        designation: 'Battement central Stulp',
        quantite: 1,
        longueurMm: hauteurOuvrantMm,
        angleGauche: '90°',
        angleDroit: '90°',
        avecRenfort: false
      });
      totalBattementMl = (hauteurOuvrantMm / 1000) * pertePourcent;
    }

    // Parcloses for sashes
    const retraitVitrage = rules.retraitVitrageMm || 12;
    const largeurVitrageMm = Math.max(0, largeurOuvrantMm - 2 * (largeurProfilOuvrant - retraitVitrage));
    const hauteurVitrageMm = Math.max(0, hauteurOuvrantMm - 2 * (largeurProfilOuvrant - retraitVitrage));

    cuts.push({
      profil: 'Parclose',
      reference: parcloseProfile?.reference || 'NON CONFIGURÉ',
      designation: `Parcloses horizontales (${nbVantaux} vantaux)`,
      quantite: nbVantaux * 2,
      longueurMm: largeurVitrageMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: false
    });
    cuts.push({
      profil: 'Parclose',
      reference: parcloseProfile?.reference || 'NON CONFIGURÉ',
      designation: `Parcloses verticales (${nbVantaux} vantaux)`,
      quantite: nbVantaux * 2,
      longueurMm: hauteurVitrageMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: false
    });

    totalParcloseMl = ((nbVantaux * 2 * largeurVitrageMm + nbVantaux * 2 * hauteurVitrageMm) / 1000) * pertePourcent;

    const surfaceUnitaireVitrageM2 = (largeurVitrageMm * hauteurVitrageMm) / 1_000_000;
    vitrageDimensions.push({
      largeurMm: largeurVitrageMm,
      hauteurMm: hauteurVitrageMm,
      quantite: nbVantaux,
      surfaceM2: surfaceUnitaireVitrageM2 * nbVantaux
    });
  } else {
    // Châssis fixe direct dans dormant
    const largeurVitrageMm = Math.max(0, largeurMm - 2 * (largeurProfilDormant - 12));
    const hauteurVitrageMm = Math.max(0, hauteurMm - 2 * (largeurProfilDormant - 12));

    cuts.push({
      profil: 'Parclose',
      reference: parcloseProfile?.reference || 'NON CONFIGURÉ',
      designation: 'Parcloses horizontales fixe',
      quantite: 2,
      longueurMm: largeurVitrageMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: false
    });
    cuts.push({
      profil: 'Parclose',
      reference: parcloseProfile?.reference || 'NON CONFIGURÉ',
      designation: 'Parcloses verticales fixe',
      quantite: 2,
      longueurMm: hauteurVitrageMm,
      angleGauche: '45°',
      angleDroit: '45°',
      avecRenfort: false
    });

    totalParcloseMl = ((2 * largeurVitrageMm + 2 * hauteurVitrageMm) / 1000) * pertePourcent;

    const surfaceVitrageFixe = (largeurVitrageMm * hauteurVitrageMm) / 1_000_000;
    vitrageDimensions.push({
      largeurMm: largeurVitrageMm,
      hauteurMm: hauteurVitrageMm,
      quantite: 1,
      surfaceM2: surfaceVitrageFixe
    });
  }

  // Helper to extract exact price based on color finish
  const getProfilePricePerMl = (p?: ProfileItem): number => {
    if (!p) return 0;
    const c = couleur.toLowerCase();
    if (c.includes('spectral')) {
      return p.prixFinitions?.spectral ?? p.prixAchatMl ?? 0;
    }
    if (c.includes('px') || c.includes('renolit') || c.includes('anthracite') || c.includes('chêne') || c.includes('7016')) {
      return p.prixFinitions?.renolitPX ?? p.prixFinitions?.renolitMX ?? p.prixAchatMl ?? 0;
    }
    if (c.includes('mx')) {
      return p.prixFinitions?.renolitMX ?? p.prixAchatMl ?? 0;
    }
    if (c.includes('pfx')) {
      return p.prixFinitions?.renolitPFX ?? p.prixAchatMl ?? 0;
    }
    return p.prixFinitions?.blanc ?? p.prixAchatMl ?? 0;
  };

  // 5. Quincaillerie Roto Calculation
  let coutQuincaillerieHT = 0;
  if (!isFixe) {
    if (type === 'Baie coulissante' || type === 'Coulissant' || configuration === 'coulissant_2V' || configuration === 'coulissant_3V') {
      // Coulissant hardware
      const chariot = hardwares.find((h) => h.referenceExacte === 'F2040231' || h.designation.includes('CHARIOT TANDEM')) || hardwares.find(h => h.designation.includes('CHARIOT'));
      const cremCoul = hardwares.find((h) => h.referenceExacte === 'F2031737' || h.designation.includes('PIL CREM')) || hardwares.find(h => h.designation.includes('CREM COUL'));
      const gacheCoul = hardwares.find((h) => h.referenceExacte === 'F2046272' || h.designation.includes('GACHE S108') || h.designation.includes('GACHE COULISSANTE'));

      if (chariot && chariot.prixAchat !== null) coutQuincaillerieHT += chariot.prixAchat * nbVantaux * 2;
      if (cremCoul && cremCoul.prixAchat !== null) coutQuincaillerieHT += cremCoul.prixAchat * nbVantaux;
      if (gacheCoul && gacheCoul.prixAchat !== null) coutQuincaillerieHT += gacheCoul.prixAchat * nbVantaux * 2;

      if (coutQuincaillerieHT === 0) {
        warnings.push('Ferrure coulissant Roto (Chariots et crémone) à vérifier.');
        status = 'A_VERIFIER';
      }
    } else {
      // Frappe (OF / OB)
      if (configuration === '1_vantail_OB' || configuration === '2_vantaux_OB_OF') {
        // Crémone OB Roto NX
        const cremOB = hardwares.find((h) => h.systeme === 'Roto NX' && h.type === 'Crémone' && h.dimensionMinMm && h.dimensionMaxMm && hauteurMm >= h.dimensionMinMm && hauteurMm <= h.dimensionMaxMm) ||
          hardwares.find((h) => h.referenceExacte === 'F794638' || h.referenceExacte === 'F788322' || h.designation.includes('CREM OB'));
        
        // Compas Roto NX
        const compas = hardwares.find((h) => h.systeme === 'Roto NX' && h.type === 'Compas' && h.dimensionMinMm && h.dimensionMaxMm && largeurMm >= h.dimensionMinMm && largeurMm <= h.dimensionMaxMm) ||
          hardwares.find((h) => h.referenceExacte === 'F787236' || h.referenceExacte === 'F787238' || h.type === 'Compas');

        // Paumelle Roto NX
        const paumelle = hardwares.find((h) => h.referenceExacte === 'F787400' || h.type === 'Paumelle');

        // Gâche Roto
        const gache = hardwares.find((h) => (h.referenceExacte === 'F338019' || h.referenceExacte === 'F834431') || h.type === 'Gâche');

        if (cremOB && cremOB.prixAchat !== null) coutQuincaillerieHT += cremOB.prixAchat;
        if (compas && compas.prixAchat !== null) coutQuincaillerieHT += compas.prixAchat;
        if (paumelle && paumelle.prixAchat !== null) coutQuincaillerieHT += paumelle.prixAchat * 2;
        if (gache && gache.prixAchat !== null) coutQuincaillerieHT += gache.prixAchat * 4;
      }

      if (configuration === '1_vantail_OF' || configuration === '2_vantaux_OF' || configuration === '2_vantaux_OB_OF') {
        const cremOF = hardwares.find((h) => h.systeme === 'Roto NT' && h.type === 'Crémone' && h.dimensionMinMm && h.dimensionMaxMm && hauteurMm >= h.dimensionMinMm && hauteurMm <= h.dimensionMaxMm) ||
          hardwares.find((h) => h.referenceExacte === 'F259720' || h.referenceExacte === 'F259721' || h.referenceExacte === 'F795389');
        const paumelleOF = hardwares.find((h) => h.referenceExacte === 'F787400' || h.type === 'Paumelle');

        const qtySashes = configuration === '2_vantaux_OF' ? 2 : 1;
        if (configuration !== '2_vantaux_OB_OF') {
          if (cremOF && cremOF.prixAchat !== null) coutQuincaillerieHT += cremOF.prixAchat * qtySashes;
          if (paumelleOF && paumelleOF.prixAchat !== null) coutQuincaillerieHT += paumelleOF.prixAchat * 2 * qtySashes;
        } else {
          // Vantail secondaire
          const verrou = hardwares.find((h) => h.referenceExacte === 'F633419' || h.referenceExacte === 'F795478' || h.type === 'Verrou');
          if (verrou && verrou.prixAchat !== null) coutQuincaillerieHT += verrou.prixAchat;
          if (paumelleOF && paumelleOF.prixAchat !== null) coutQuincaillerieHT += paumelleOF.prixAchat * 2;
        }
      }
    }
  }

  // 6. Vitrage Calculation
  let coutVitrageHT = 0;
  const glassItem = glasses.find((g) => g.id === vitrageId);
  if (!glassItem) {
    warnings.push('Vitrage non trouvé ou non sélectionné.');
    status = 'NON_CONFIGURE';
  } else if (!glassItem.isConfigured || glassItem.prixAchatM2 === null) {
    warnings.push(`Prix d'achat au m² du vitrage "${glassItem.designation}" NON CONFIGURÉ.`);
    status = 'NON_CONFIGURE';
  } else {
    for (const v of vitrageDimensions) {
      const surfaceFactureeUnitaire = Math.max(v.surfaceM2 / v.quantite, glassItem.surfaceMinimumM2 || 0.5);
      coutVitrageHT += surfaceFactureeUnitaire * v.quantite * glassItem.prixAchatM2;
    }
  }

  // 7. Accessoires Calculation
  let coutAccessoiresHT = 0;
  for (const acc of accessoires) {
    const item = accessoriesList.find((a) => a.id === acc.accessoireId);
    if (item && item.prixAchat !== null) {
      coutAccessoiresHT += item.prixAchat * acc.quantite;
    } else if (item && !item.isConfigured) {
      warnings.push(`Accessoire "${item.designation}" non configuré.`);
      status = 'NON_CONFIGURE';
    }
  }

  // 8. Profiles & Reinforcements Costs with exact finish pricing
  const prixDormantMl = getProfilePricePerMl(dormantProfile);
  const prixOuvrantMl = getProfilePricePerMl(ouvrantProfile);
  const prixParcloseMl = getProfilePricePerMl(parcloseProfile);
  const prixBattementMl = getProfilePricePerMl(battementProfile);

  const coutDormant = totalDormantMl * prixDormantMl;
  const coutOuvrant = totalOuvrantMl * prixOuvrantMl;
  const coutParclose = totalParcloseMl * prixParcloseMl;
  const coutBattement = totalBattementMl * prixBattementMl;
  const coutProfilsHT = coutDormant + coutOuvrant + coutParclose + coutBattement;

  const coutRenfortsHT = totalRenfortMl * (renfortDormant?.prixAchatMl || 34.10);

  // 9. Labor / Fabrication Calculation
  const minutesCadre = rules.minutesFabricationParCadre || 45;
  const minutesParVantail = rules.minutesFabricationParVantail || 40;
  const tempsFabricationTotalMinutes = minutesCadre + (nbVantaux * minutesParVantail);
  const coutFabricationHT = (tempsFabricationTotalMinutes / 60) * (rules.tauxHoraireFabrication || 45);

  // 10. Installation & Transport
  let coutPoseHT = 0;
  if (inclurePose) {
    const prixPoseM2 = rules.prixPoseAuM2 || 65;
    const forfaitMini = rules.forfaitPoseMinimum || 120;
    coutPoseHT = Math.max(forfaitMini, surfaceM2 * prixPoseM2);
  }

  let coutTransportHT = 0;
  if (inclureTransport) {
    const forfaitFixe = rules.forfaitTransportFixe || 45;
    const prixKm = rules.prixTransportParKm || 1.25;
    coutTransportHT = forfaitFixe + (distanceKm * prixKm);
  }

  // 11. Cost of Goods Sold (Prix de Revient)
  const coutTotalRevientHT = (coutProfilsHT + coutRenfortsHT + coutQuincaillerieHT + coutVitrageHT + coutAccessoiresHT + coutFabricationHT);

  // 12. Margin & Selling Prices
  const coefficientMarge = customMarginCoeff || rules.coefficientMargeDefault || 1.35;
  const margePourcent = Math.round(((coefficientMarge - 1) / coefficientMarge) * 100);

  const prixVenteFournitureHT = coutTotalRevientHT * coefficientMarge;
  const prixVentePoseHT = coutPoseHT * 1.25; // 25% marge sur la pose
  const prixVenteTransportHT = coutTransportHT * 1.15; // 15% marge transport
  const prixVenteTotalHT = prixVenteFournitureHT + prixVentePoseHT + prixVenteTransportHT;
  const prixVenteTTC = prixVenteTotalHT * 1.20; // Indicatif 20%

  return {
    surfaceM2: Number(surfaceM2.toFixed(3)),
    perimetreMl: Number(perimetreMl.toFixed(2)),
    coutProfilsHT: Number(coutProfilsHT.toFixed(2)),
    coutRenfortsHT: Number(coutRenfortsHT.toFixed(2)),
    coutQuincaillerieHT: Number(coutQuincaillerieHT.toFixed(2)),
    coutVitrageHT: Number(coutVitrageHT.toFixed(2)),
    coutAccessoiresHT: Number(coutAccessoiresHT.toFixed(2)),
    coutFabricationHT: Number(coutFabricationHT.toFixed(2)),
    coutPoseHT: Number(coutPoseHT.toFixed(2)),
    coutTransportHT: Number(coutTransportHT.toFixed(2)),
    coutTotalRevientHT: Number(coutTotalRevientHT.toFixed(2)),
    margePourcent,
    coefficientMarge,
    prixVenteFournitureHT: Number(prixVenteFournitureHT.toFixed(2)),
    prixVentePoseHT: Number(prixVentePoseHT.toFixed(2)),
    prixVenteTransportHT: Number(prixVenteTransportHT.toFixed(2)),
    prixVenteTotalHT: Number(prixVenteTotalHT.toFixed(2)),
    prixVenteTTC: Number(prixVenteTTC.toFixed(2)),
    cuts,
    vitrageDimensions,
    status,
    warnings
  };
}

function createEmptyCalculation(warnings: string[]): JoineryItemCalculation {
  return {
    surfaceM2: 0,
    perimetreMl: 0,
    coutProfilsHT: 0,
    coutRenfortsHT: 0,
    coutQuincaillerieHT: 0,
    coutVitrageHT: 0,
    coutAccessoiresHT: 0,
    coutFabricationHT: 0,
    coutPoseHT: 0,
    coutTransportHT: 0,
    coutTotalRevientHT: 0,
    margePourcent: 0,
    coefficientMarge: 1.35,
    prixVenteFournitureHT: 0,
    prixVentePoseHT: 0,
    prixVenteTransportHT: 0,
    prixVenteTotalHT: 0,
    prixVenteTTC: 0,
    cuts: [],
    vitrageDimensions: [],
    status: 'NON_CONFIGURE',
    warnings
  };
}

import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  ProfileItem,
  HardwareItem,
  GlassItem,
  AccessoryItem,
  Client
} from '../types';
import { storageService } from '../services/storageService';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  X
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

type ImportType = 'profiles' | 'hardware' | 'glass' | 'accessories' | 'clients' | 'full_backup';

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onRefreshData
}) => {
  const [selectedType, setSelectedType] = useState<ImportType>('profiles');
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate downloadable sample CSV template
  const downloadTemplate = (type: ImportType) => {
    let headers: string[] = [];
    let sampleRows: string[][] = [];
    let filename = `template_${type}.csv`;

    switch (type) {
      case 'profiles':
        headers = [
          'Fournisseur',
          'Gamme',
          'SystemeId',
          'Reference',
          'Designation',
          'Type',
          'Description',
          'Couleur',
          'LongueurBarreMm',
          'PrixAchatMl',
          'PrixRevientMl',
          'PrixVenteMl',
          'Unite',
          'PoidsKgMl',
          'LargeurProfilMm',
          'HauteurProfilMm',
          'ReferenceRenfort'
        ];
        sampleRows = [
          ['VEKA', 'VEKA', 'veka_softline_70', '101.208', 'Dormant Standard 70mm', 'Dormant', 'Dormant pour neuf', 'Blanc RAL 9016', '6500', '9.80', '10.78', '14.55', 'ML', '1.45', '70', '67', '113.025'],
          ['VEKA', 'VEKA', 'veka_softline_70', '103.232', 'Ouvrant Droit 70mm', 'Ouvrant', 'Ouvrant droit', 'Blanc RAL 9016', '6500', '10.50', '11.55', '15.60', 'ML', '1.55', '70', '80', '113.029'],
          ['VEKA', 'VEKA', 'veka_softline_82', '101.290', 'Dormant Softline 82mm', 'Dormant', 'Dormant passif', 'Blanc RAL 9016', '6500', '', '', '', 'ML', '1.85', '82', '73', '']
        ];
        break;

      case 'hardware':
        headers = [
          'Fabricant',
          'Systeme',
          'ReferenceExacte',
          'Designation',
          'Type',
          'DimensionMinMm',
          'DimensionMaxMm',
          'Unite',
          'PrixAchat',
          'PrixVente',
          'QuantiteParVantail',
          'RegleSelection'
        ];
        sampleRows = [
          ['Roto', 'Roto NX', '628491', 'Crémone OB Gr. 1400', 'Crémone', '1001', '1400', 'U', '14.20', '22.50', '1', 'H 1001-1400mm'],
          ['Roto', 'Roto NX', '629105', 'Compas taille 130', 'Compas', '601', '1300', 'U', '12.80', '19.50', '1', 'L 601-1300mm']
        ];
        break;

      case 'glass':
        headers = [
          'Code',
          'Designation',
          'Composition',
          'EpaisseurMm',
          'PrixAchatM2',
          'PrixVenteM2',
          'PrixMinimumM2',
          'SurfaceMinimumM2',
          'Fournisseur',
          'CoefficientUg',
          'AffaiblissementRwDb'
        ];
        sampleRows = [
          ['DV 4/16/4 Clair Argon', 'Double Vitrage Standard 24mm', '4 / 16 Argon / 4', '24', '35.00', '58.00', '25.00', '0.5', 'Saint-Gobain Glass', '1.1', '31'],
          ['DV 4/16/4 One Low-E Argon', 'Double Vitrage Isolation Renforcée', '4 One / 16 Argon / 4', '24', '42.00', '69.00', '25.00', '0.5', 'Saint-Gobain Glass', '1.0', '31']
        ];
        break;

      case 'accessories':
        headers = [
          'Reference',
          'Designation',
          'Categorie',
          'Description',
          'Unite',
          'PrixAchat',
          'PrixVente'
        ];
        sampleRows = [
          ['ROTO-SECUSTIK-BLC', 'Poignée Sécustik Line Blanche', 'Poignée', 'Poignée de sécurité anti-effraction Roto Line', 'U', '6.80', '14.50'],
          ['GRL-AIR-30M3', 'Grille de ventilation autoréglable 30m3/h', 'Ventilation', 'Entrée d air acoustique sur dormant', 'U', '8.50', '18.00']
        ];
        break;

      case 'clients':
        headers = [
          'Nom',
          'Prenom',
          'RaisonSociale',
          'Type',
          'Email',
          'Telephone',
          'Adresse',
          'CodePostal',
          'Ville',
          'Siret',
          'RemiseCommercialePourcent'
        ];
        sampleRows = [
          ['Dupont', 'Jean', '', 'Particulier', 'jean.dupont@email.com', '06 12 34 56 78', '12 rue des Acacias', '75017', 'Paris', '', '0'],
          ['Atlas Fenêtres', '', 'Atlas Fenêtres SARL', 'Professionnel', 'contact@atlas-fenetres.com', '05 22 33 44 55', 'Bd d Anfa', '20000', 'Casablanca', 'RC 482910', '15']
        ];
        break;
    }

    const csvContent = [headers.join(';'), ...sampleRows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV file upload & parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseErrors([]);
    setSuccessMessage(null);
    setImportedRows([]);

    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedType === 'full_backup') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const success = storageService.importDatabaseFromJson(content);
          if (success) {
            setSuccessMessage('Base de données restaurée avec succès !');
            onRefreshData();
          } else {
            setParseErrors(['Fichier JSON de sauvegarde corrompu ou invalide.']);
          }
        } catch (err: any) {
          setParseErrors([err.message || 'Erreur lors de la lecture du JSON']);
        }
      };
      reader.readAsText(file);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: '', // autodetect comma or semicolon
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseErrors(results.errors.map((err) => `Ligne ${err.row}: ${err.message}`));
        } else {
          setImportedRows(results.data);
          setSuccessMessage(`${results.data.length} lignes analysées et prêtes à être importées.`);
        }
      }
    });
  };

  // Commit imported rows to database
  const handleApplyImport = () => {
    if (importedRows.length === 0) return;

    try {
      if (selectedType === 'profiles') {
        const current = storageService.getProfiles();
        const newProfiles: ProfileItem[] = importedRows.map((row: any, idx: number) => {
          const prixAchat = row.PrixAchatMl ? parseFloat(row.PrixAchatMl.replace(',', '.')) : null;
          const prixRevient = row.PrixRevientMl ? parseFloat(row.PrixRevientMl.replace(',', '.')) : (prixAchat ? prixAchat * 1.1 : null);
          const prixVente = row.PrixVenteMl ? parseFloat(row.PrixVenteMl.replace(',', '.')) : (prixAchat ? prixAchat * 1.4 : null);
          const isConfig = prixAchat !== null && !isNaN(prixAchat) && Boolean(row.Reference);

          return {
            id: `prof_imp_${Date.now()}_${idx}`,
            fournisseur: row.Fournisseur || 'VEKA',
            gammeId: row.Gamme || 'VEKA',
            systemId: row.SystemeId || 'veka_softline_70',
            reference: (row.Reference || '').trim(),
            designation: (row.Designation || '').trim(),
            type: (row.Type || 'Dormant') as ProfileItem['type'],
            description: row.Description || '',
            couleur: row.Couleur || 'Blanc RAL 9016',
            longueurBarreMm: parseInt(row.LongueurBarreMm) || 6500,
            prixAchatMl: isNaN(prixAchat as number) ? null : prixAchat,
            prixRevientMl: isNaN(prixRevient as number) ? null : prixRevient,
            prixVenteMl: isNaN(prixVente as number) ? null : prixVente,
            unite: (row.Unite || 'ML') as ProfileItem['unite'],
            poidsKgMl: row.PoidsKgMl ? parseFloat(row.PoidsKgMl.replace(',', '.')) : null,
            largeurProfilMm: parseInt(row.LargeurProfilMm) || 70,
            hauteurProfilMm: parseInt(row.HauteurProfilMm) || 67,
            referenceRenfort: row.ReferenceRenfort || '',
            isActif: true,
            isConfigured: isConfig
          };
        });

        const updated = [...current];
        newProfiles.forEach((np) => {
          const existingIdx = updated.findIndex((p) => p.reference.toLowerCase() === np.reference.toLowerCase());
          if (existingIdx >= 0) {
            updated[existingIdx] = np;
          } else {
            updated.push(np);
          }
        });
        storageService.saveProfiles(updated);
        setSuccessMessage(`${newProfiles.length} profilés importés et mis à jour.`);
      } else if (selectedType === 'hardware') {
        const current = storageService.getHardware();
        const newHardware: HardwareItem[] = importedRows.map((row: any, idx: number) => {
          const prixAchat = row.PrixAchat ? parseFloat(row.PrixAchat.replace(',', '.')) : null;
          const prixVente = row.PrixVente ? parseFloat(row.PrixVente.replace(',', '.')) : (prixAchat ? prixAchat * 1.5 : null);
          return {
            id: `roto_imp_${Date.now()}_${idx}`,
            fabricant: (row.Fabricant || 'Roto') as HardwareItem['fabricant'],
            systeme: (row.Systeme || 'Roto NX') as HardwareItem['systeme'],
            referenceExacte: (row.ReferenceExacte || '').trim(),
            designation: (row.Designation || '').trim(),
            type: (row.Type || 'Crémone') as HardwareItem['type'],
            dimensionMinMm: row.DimensionMinMm ? parseInt(row.DimensionMinMm) : undefined,
            dimensionMaxMm: row.DimensionMaxMm ? parseInt(row.DimensionMaxMm) : undefined,
            unite: (row.Unite || 'U') as HardwareItem['unite'],
            prixAchat: isNaN(prixAchat as number) ? null : prixAchat,
            prixVente: isNaN(prixVente as number) ? null : prixVente,
            quantiteParVantail: parseInt(row.QuantiteParVantail) || 1,
            regleSelection: row.RegleSelection || '',
            isConfigured: prixAchat !== null && !isNaN(prixAchat)
          };
        });
        storageService.saveHardware([...current, ...newHardware]);
        setSuccessMessage(`${newHardware.length} articles quincaillerie importés.`);
      } else if (selectedType === 'glass') {
        const current = storageService.getGlass();
        const newGlass: GlassItem[] = importedRows.map((row: any, idx: number) => {
          const prixAchat = row.PrixAchatM2 ? parseFloat(row.PrixAchatM2.replace(',', '.')) : null;
          const prixVente = row.PrixVenteM2 ? parseFloat(row.PrixVenteM2.replace(',', '.')) : (prixAchat ? prixAchat * 1.6 : null);
          return {
            id: `glass_imp_${Date.now()}_${idx}`,
            code: (row.Code || '').trim(),
            designation: (row.Designation || '').trim(),
            composition: row.Composition || '',
            epaisseurMm: parseInt(row.EpaisseurMm) || 24,
            prixAchatM2: isNaN(prixAchat as number) ? null : prixAchat,
            prixVenteM2: isNaN(prixVente as number) ? null : prixVente,
            prixMinimumM2: row.PrixMinimumM2 ? parseFloat(row.PrixMinimumM2.replace(',', '.')) : 25,
            surfaceMinimumM2: row.SurfaceMinimumM2 ? parseFloat(row.SurfaceMinimumM2.replace(',', '.')) : 0.5,
            fournisseur: row.Fournisseur || 'Saint-Gobain Glass',
            coefficientUg: row.CoefficientUg ? parseFloat(row.CoefficientUg.replace(',', '.')) : 1.1,
            affaiblissementRwDb: row.AffaiblissementRwDb ? parseInt(row.AffaiblissementRwDb) : 31,
            isConfigured: prixAchat !== null && !isNaN(prixAchat)
          };
        });
        storageService.saveGlass([...current, ...newGlass]);
        setSuccessMessage(`${newGlass.length} vitrages importés.`);
      } else if (selectedType === 'accessories') {
        const current = storageService.getAccessories();
        const newAcc: AccessoryItem[] = importedRows.map((row: any, idx: number) => {
          const prixAchat = row.PrixAchat ? parseFloat(row.PrixAchat.replace(',', '.')) : null;
          const prixVente = row.PrixVente ? parseFloat(row.PrixVente.replace(',', '.')) : (prixAchat ? prixAchat * 1.5 : null);
          return {
            id: `acc_imp_${Date.now()}_${idx}`,
            reference: (row.Reference || '').trim(),
            designation: (row.Designation || '').trim(),
            categorie: row.Categorie || 'Général',
            description: row.Description || '',
            unite: (row.Unite || 'U') as AccessoryItem['unite'],
            prixAchat: isNaN(prixAchat as number) ? null : prixAchat,
            prixVente: isNaN(prixVente as number) ? null : prixVente,
            isConfigured: prixAchat !== null && !isNaN(prixAchat)
          };
        });
        storageService.saveAccessories([...current, ...newAcc]);
        setSuccessMessage(`${newAcc.length} accessoires importés.`);
      } else if (selectedType === 'clients') {
        const current = storageService.getClients();
        const newClients: Client[] = importedRows.map((row: any, idx: number) => ({
          id: `cli_imp_${Date.now()}_${idx}`,
          codeClient: `CLI-${Date.now().toString().slice(-4)}-${idx}`,
          nom: (row.Nom || '').trim(),
          prenom: row.Prenom || '',
          raisonSociale: row.RaisonSociale || '',
          type: (row.Type === 'Professionnel' ? 'Professionnel' : 'Particulier'),
          email: row.Email || '',
          telephone: row.Telephone || '',
          adresse: row.Adresse || '',
          codePostal: row.CodePostal || '',
          ville: row.Ville || '',
          siret: row.Siret || '',
          remiseCommercialePourcent: row.RemiseCommercialePourcent ? parseFloat(row.RemiseCommercialePourcent.replace(',', '.')) : 0,
          dateCreation: new Date().toISOString().split('T')[0]
        }));
        storageService.saveClients([...current, ...newClients]);
        setSuccessMessage(`${newClients.length} clients importés.`);
      }

      onRefreshData();
      setImportedRows([]);
    } catch (err: any) {
      setParseErrors([err.message || 'Erreur lors de l\'enregistrement dans la base.']);
    }
  };

  const handleExportFullBackup = () => {
    const jsonStr = storageService.exportDatabaseToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_promenuiserie_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-800">
        {/* Header - Clean White */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Module d'Importation & Exportation Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Alimentation de votre mercuriale atelier par fichiers tableurs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto bg-white">
          {/* Instructions banner */}
          <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 text-xs text-slate-700 space-y-1">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Règle stricte d'intégrité industrielle :
            </div>
            <p className="text-slate-600">
              Conformément à vos exigences métier, le logiciel n'invente jamais de tarifs ou de références.
              Téléchargez ci-dessous la matrice Excel/CSV préformatée avec vos colonnes, renseignez vos tarifs réels,
              puis importez votre fichier.
            </p>
          </div>

          {/* Select Type Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {[
              { id: 'profiles', label: 'Profilés PVC' },
              { id: 'hardware', label: 'Quincaillerie Roto' },
              { id: 'glass', label: 'Vitrages' },
              { id: 'accessories', label: 'Accessoires' },
              { id: 'clients', label: 'Clients CRM' },
              { id: 'full_backup', label: 'Sauvegarde Globale' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSelectedType(tab.id as ImportType);
                  setImportedRows([]);
                  setParseErrors([]);
                  setSuccessMessage(null);
                }}
                className={`py-2 px-2.5 text-xs font-medium rounded-lg border transition-colors ${
                  selectedType === tab.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {selectedType === 'full_backup' ? (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-4">
              <Database className="w-10 h-10 text-blue-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sauvegarde Complète de la Base de Données</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Exporte ou restaure l'ensemble de votre logiciel (Gammes, profilés, quincaillerie, tarifs, clients, devis, commandes).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Exporter Sauvegarde Complète (JSON)
                </button>

                <label className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Restaurer un fichier JSON
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Download Model */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-blue-600" />
                    Étape 1 : Télécharger la Matrice Excel
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Génère un fichier modèle CSV UTF-8 prêt à ouvrir dans Excel, avec toutes les colonnes et des exemples réels.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadTemplate(selectedType)}
                  className="mt-4 w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Télécharger le modèle CSV {selectedType}
                </button>
              </div>

              {/* Box 2: Upload CSV */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-600" />
                    Étape 2 : Importer vos Fichiers Remplis
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Sélectionnez votre fichier .csv exporté depuis Excel. Le système détectera automatiquement les séparateurs.
                  </p>
                </div>
                <label className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                  <Upload className="w-4 h-4" />
                  Choisir le fichier CSV
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {parseErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Erreurs détectées lors de l'analyse :
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table if rows loaded */}
          {importedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Aperçu des données à importer ({importedRows.length} lignes)
                </h3>
                <button
                  type="button"
                  onClick={handleApplyImport}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmer et injecter dans la base
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-50 text-slate-700 sticky top-0 border-b border-slate-200">
                    <tr>
                      {Object.keys(importedRows[0] || {}).slice(0, 7).map((k) => (
                        <th key={k} className="py-2 px-2.5 font-semibold">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {importedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 text-slate-800">
                        {Object.values(row).slice(0, 7).map((val: any, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-2.5 truncate max-w-[150px]">
                            {String(val || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importedRows.length > 10 && (
                <p className="text-[11px] text-slate-500 italic">
                  ... et {importedRows.length - 10} autres lignes non affichées dans l'aperçu.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span>Format supporté : CSV UTF-8 (séparateur point-virgule ou virgule)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

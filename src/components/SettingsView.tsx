import React, { useState, useRef } from 'react';
import { CompanySettings } from '../types';
import { Building2, ShieldCheck, CheckCircle2, RotateCcw, Save, Image, Upload, Trash2, Sparkles, Eye } from 'lucide-react';

const DEFAULT_SQUARE_LOGO = '/src/assets/images/pvc_company_logo_1790723227858.jpg';
const DEFAULT_WIDE_BANNER = '/src/assets/images/pvc_header_banner_1790723238060.jpg';

interface SettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetAllData
}) => {
  const [form, setForm] = useState<CompanySettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetConfirm = () => {
    if (window.confirm('Attention : Êtes-vous sûr de vouloir réinitialiser toutes les données par défaut ? Toutes les modifications locales seront perdues.')) {
      onResetAllData();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('L\'image sélectionnée est volumineuse (> 2 Mo). Veuillez choisir une image plus légère.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setForm((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Paramètres de l'Entreprise & Facturation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Informations légales, logo d'entreprise, coordonnées bancaires et mentions obligatoires affichées sur les devis PDF et fiches de débit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* LOGO & IMAGE DE MARQUE */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-600" />
                Logo Professionnel & Image de Marque
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Affiché dans le header du logiciel, le tableau de bord, les devis officiels PDF et les fiches de débit atelier.
              </p>
            </div>
            {form.logoUrl && (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Logo Actif
              </span>
            )}
          </div>

          {/* Dual Preview & Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Left: Previews (Header context + PDF print context) */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Aperçu en temps réel
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Header Preview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-mono text-slate-500 mb-2 uppercase tracking-wide">
                    Dans le Header Logiciel
                  </span>
                  <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo Preview Header"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Aucun</span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-800 mt-2 truncate max-w-full">
                    {form.nomEntreprise || 'PRO-MENUISERIE'}
                  </span>
                </div>

                {/* White PDF Document Preview */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[9px] font-mono text-slate-500 mb-2 uppercase tracking-wide">
                    Sur le Devis PDF & Fiche
                  </span>
                  <div className="w-16 h-16 rounded-lg p-1 border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo Preview PDF"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Aucun</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-900 mt-2 truncate max-w-full">
                    {form.nomEntreprise || 'PRO-MENUISERIE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Presets and Upload Controls */}
            <div className="md:col-span-6 space-y-3">
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Logos Professionnels Prédéfinis
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Preset 1: Square Minimalist Logo */}
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoUrl: DEFAULT_SQUARE_LOGO }))}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    form.logoUrl === DEFAULT_SQUARE_LOGO
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={DEFAULT_SQUARE_LOGO}
                    alt="Logo Carré"
                    className="w-9 h-9 rounded bg-white p-0.5 object-contain shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] truncate">Logo Carré Épuré</div>
                    <div className="text-[9px] text-slate-500 truncate">Recommandé Header & Devis</div>
                  </div>
                </button>

                {/* Preset 2: Wide Header Banner */}
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, logoUrl: DEFAULT_WIDE_BANNER }))}
                  className={`p-2.5 rounded-lg border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    form.logoUrl === DEFAULT_WIDE_BANNER
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={DEFAULT_WIDE_BANNER}
                    alt="Bannière Marque"
                    className="w-9 h-9 rounded bg-white p-0.5 object-contain shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[11px] truncate">Bannière Marque</div>
                    <div className="text-[9px] text-slate-500 truncate">Style Signature Large</div>
                  </div>
                </button>
              </div>

              {/* Upload custom file or URL */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    Charger une image (PNG/JPG/SVG)
                  </button>

                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))}
                      className="py-1.5 px-2.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Supprimer le logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5 font-mono">
                    Ou chemin / URL personnalisée :
                  </label>
                  <input
                    type="text"
                    value={form.logoUrl || ''}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="/src/assets/images/... ou https://..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identité Entreprise */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Identité Juridique & Assurances
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Raison Sociale / Nom Entreprise *</label>
              <input
                type="text"
                required
                value={form.nomEntreprise}
                onChange={(e) => setForm({ ...form, nomEntreprise: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Forme Juridique & Capital</label>
              <input
                type="text"
                value={form.formeJuridique}
                onChange={(e) => setForm({ ...form, formeJuridique: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Numéro SIRET / RC</label>
              <input
                type="text"
                value={form.siret}
                onChange={(e) => setForm({ ...form, siret: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">RCS / Greffe</label>
              <input
                type="text"
                value={form.rcs}
                onChange={(e) => setForm({ ...form, rcs: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">N° TVA Intracommunautaire / ICE</label>
              <input
                type="text"
                value={form.numeroTva}
                onChange={(e) => setForm({ ...form, numeroTva: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Garantie Décennale (Police & Assureur)</label>
              <input
                type="text"
                value={form.assuranceDecennale}
                onChange={(e) => setForm({ ...form, assuranceDecennale: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Coordonnées */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Coordonnées de l'Atelier
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-3">
              <label className="block text-slate-600 font-medium mb-1">Adresse postale</label>
              <input
                type="text"
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Code Postal</label>
              <input
                type="text"
                value={form.codePostal}
                onChange={(e) => setForm({ ...form, codePostal: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Ville</label>
              <input
                type="text"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Téléphone</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Email professionnel</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Taux TVA Standard (%)</label>
              <input
                type="number"
                value={form.tauxTvaDefaut}
                onChange={(e) => setForm({ ...form, tauxTvaDefaut: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Devise Monétaire (Tarifs)</label>
              <select
                value={form.devise || 'DH'}
                onChange={(e) => setForm({ ...form, devise: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="DH">DH (Dirham Marocain - Tarifs VEKA / MEKSA)</option>
                <option value="€">€ (Euro)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Coordonnées Bancaires & Conditions */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
            Règlement & Facturation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">IBAN / RIB</label>
              <input
                type="text"
                value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">BIC / Swift</label>
              <input
                type="text"
                value={form.bic}
                onChange={(e) => setForm({ ...form, bic: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-medium mb-1">Conditions de règlement imprimées sur les devis</label>
              <textarea
                rows={2}
                value={form.conditionsDefaut}
                onChange={(e) => setForm({ ...form, conditionsDefaut: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handleResetConfirm}
            className="px-3.5 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser les données initiales
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Paramètres enregistrés avec succès
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

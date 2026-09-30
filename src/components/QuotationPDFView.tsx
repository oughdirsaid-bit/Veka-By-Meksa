import React, { useState } from 'react';
import { Quotation, Client, Project, CompanySettings } from '../types';
import { TechnicalElevationViewer } from './TechnicalElevationViewer';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Download, Edit, Image } from 'lucide-react';

interface QuotationPDFViewProps {
  quotation: Quotation;
  client?: Client;
  project?: Project;
  settings: CompanySettings;
  onBack: () => void;
  onConvertToOrder?: (quote: Quotation) => void;
  onEdit?: (quote: Quotation) => void;
}

export const QuotationPDFView: React.FC<QuotationPDFViewProps> = ({
  quotation,
  client,
  project,
  settings,
  onBack,
  onConvertToOrder,
  onEdit
}) => {
  const [showLogo, setShowLogo] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar - Hidden when printing */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux devis
        </button>

        <div className="flex items-center gap-2">
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

          {onEdit && (
            <button
              onClick={() => onEdit(quotation)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              Modifier ce devis
            </button>
          )}

          {quotation.statut !== 'Accepte' && onConvertToOrder && (
            <button
              onClick={() => onConvertToOrder(quotation)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accepter & Créer Commande
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Exporter en PDF
          </button>
        </div>
      </div>

      {/* The Printable Page - Styled to look like a high-grade A4 document */}
      <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 max-w-5xl mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-xs">
        {/* Header Block with Company Logo */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6 gap-6">
          <div className="flex items-start gap-4">
            {showLogo && settings.logoUrl && (
              <div className="w-20 h-20 sm:w-24 sm:h-24 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={settings.logoUrl}
                  alt={settings.nomEntreprise}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                {settings.nomEntreprise}
              </h1>
              <p className="text-slate-600 font-medium">{settings.formeJuridique}</p>
              <p className="text-slate-600">{settings.adresse} - {settings.codePostal} {settings.ville}</p>
              <p className="text-slate-600">Tél: {settings.telephone} | Email: {settings.email}</p>
              <div className="pt-2 text-[10px] text-slate-500 space-y-0.5">
                <p>SIRET : {settings.siret} · RCS : {settings.rcs}</p>
                <p>N° TVA Intra : {settings.numeroTva} · Code APE : {settings.codeApe}</p>
                <p className="text-emerald-700 font-medium">Assurance Décennale : {settings.assuranceDecennale}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 w-72 text-right shrink-0">
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
              DEVIS PROFESSIONNEL
            </div>
            <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
              {quotation.numero} <span className="text-slate-500 font-normal">v{quotation.version}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
              <p>Date d'émission : <span className="font-semibold text-slate-800">{quotation.dateDevis}</span></p>
              <p>Validité de l'offre : <span className="font-semibold text-slate-800">{quotation.dateValidite}</span></p>
              <p>Statut : <span className="font-semibold text-slate-800 uppercase">{quotation.statut}</span></p>
            </div>
          </div>
        </div>

        {/* Client & Project Addresses Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              CLIENT / DESTINATAIRE
            </h3>
            {client ? (
              <div className="space-y-0.5 text-slate-800">
                <p className="font-semibold text-sm">
                  {client.nom} {client.prenom || ''}
                </p>
                {client.raisonSociale && <p className="text-slate-600">{client.raisonSociale}</p>}
                <p>{client.adresse}</p>
                <p>{client.codePostal} {client.ville}</p>
                <p className="text-slate-600">Tél : {client.telephone}</p>
                <p className="text-slate-600">Email : {client.email}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Client non spécifié</p>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              CHANTIER / AFFAIRE
            </h3>
            {project ? (
              <div className="space-y-0.5 text-slate-800">
                <p className="font-semibold text-sm">{project.nom}</p>
                <p className="text-[11px] font-mono text-slate-600">Réf. Affaire : {project.codeProjet}</p>
                <p className="mt-1 text-slate-700">Adresse d'intervention :</p>
                <p className="font-medium">{project.adresseChantier}</p>
              </div>
            ) : (
              <p className="text-slate-400 italic">Affaire générale</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold text-[11px] border-b border-slate-300">
                  <th className="py-2.5 px-3 w-16 text-center">Croquis</th>
                  <th className="py-2.5 px-3">Description Technique Détaillée</th>
                  <th className="py-2.5 px-3 w-28 text-center">Dimensions</th>
                  <th className="py-2.5 px-2 w-12 text-center">Qté</th>
                  <th className="py-2.5 px-3 w-24 text-right">P.U. HT</th>
                  <th className="py-2.5 px-3 w-24 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotation.items.map((item, idx) => {
                  const lineTotalHT = item.calcul.prixVenteTotalHT * item.quantite;
                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      {/* Technical Elevation Visual */}
                      <td className="py-3 px-2 align-top text-center bg-slate-50/80">
                        <div className="w-20 h-24 mx-auto flex items-center justify-center">
                          <TechnicalElevationViewer
                            largeurMm={item.largeurMm}
                            hauteurMm={item.hauteurMm}
                            configuration={item.configuration}
                            type={item.type}
                            couleur={item.couleur}
                            showDimensions={false}
                          />
                        </div>
                      </td>

                      {/* Technical Specs */}
                      <td className="py-3 px-3 align-top space-y-1">
                        <div className="font-bold text-slate-900 text-sm">
                          {item.repere} - {item.type}
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <p>
                            <span className="font-semibold">Gamme :</span> {item.gamme} {item.systemId.replace('veka_', '').replace(/_/g, ' ')}
                            {' · '}
                            <span className="font-semibold">Configuration :</span> {item.configuration.replace(/_/g, ' ')}
                          </p>
                          <p>
                            <span className="font-semibold">Teinte :</span> {item.couleur}
                            {' · '}
                            <span className="font-semibold">Pose :</span> {item.typePose.replace(/_/g, ' ')}
                          </p>
                          <p>
                            <span className="font-semibold">Vitrage :</span> Double vitrage haute isolation thermique ITR Argon (Warm Edge)
                          </p>
                          <p>
                            <span className="font-semibold">Ferrage :</span> Quincaillerie Roto NX haute sécurité
                          </p>
                          {item.notesTechniques && (
                            <p className="text-slate-500 italic">Note : {item.notesTechniques}</p>
                          )}
                        </div>

                        {/* Missing info warning if any */}
                        {item.calcul.warnings.length > 0 && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded mt-1 border border-amber-200">
                            Avertissement technique : {item.calcul.warnings.join(' · ')}
                          </div>
                        )}
                      </td>

                      {/* Dimensions */}
                      <td className="py-3 px-3 align-top text-center font-mono tabular-nums text-slate-800">
                        <div>L = {item.largeurMm} mm</div>
                        <div>H = {item.hauteurMm} mm</div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {item.calcul.surfaceM2} m²
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2 align-top text-center font-semibold text-slate-900">
                        {item.quantite}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-3 align-top text-right font-mono tabular-nums text-slate-800">
                        {item.calcul.prixVenteTotalHT.toFixed(2)} {settings.devise || 'DH'}
                      </td>

                      {/* Total Line HT */}
                      <td className="py-3 px-3 align-top text-right font-mono tabular-nums font-bold text-slate-900">
                        {lineTotalHT.toFixed(2)} {settings.devise || 'DH'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Financial Summary */}
        <div className="grid grid-cols-12 gap-8 mb-8 items-start">
          {/* Notes & Payment Terms */}
          <div className="col-span-7 space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <h4 className="font-semibold text-slate-800 mb-1">Conditions de règlement & Garantie</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {quotation.conditionsReglement || settings.conditionsDefaut}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                Coordonnées bancaires pour virement : IBAN : {settings.iban} · BIC : {settings.bic}
              </div>
            </div>

            {quotation.notesDevis && (
              <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">Observations : </span>
                {quotation.notesDevis}
              </div>
            )}
          </div>

          {/* Totals Box */}
          <div className="col-span-5 bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-slate-700">
              <span>Total Fourniture Menuiseries HT :</span>
              <span className="font-mono tabular-nums font-medium">{quotation.totalFournitureHT.toFixed(2)} {settings.devise || 'DH'}</span>
            </div>

            {quotation.totalPoseHT > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Prestation de Pose & Fixation HT :</span>
                <span className="font-mono tabular-nums font-medium">{quotation.totalPoseHT.toFixed(2)} {settings.devise || 'DH'}</span>
              </div>
            )}

            {quotation.totalTransportHT > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Frais de Transport & Livraison HT :</span>
                <span className="font-mono tabular-nums font-medium">{quotation.totalTransportHT.toFixed(2)} {settings.devise || 'DH'}</span>
              </div>
            )}

            {quotation.remiseGlobalePourcent > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Remise Commerciale ({quotation.remiseGlobalePourcent}%) :</span>
                <span className="font-mono tabular-nums">-{quotation.totalRemiseHT.toFixed(2)} {settings.devise || 'DH'}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-slate-900 text-sm">
              <span>TOTAL NET HORS TAXES :</span>
              <span className="font-mono tabular-nums">{quotation.totalNetHT.toFixed(2)} {settings.devise || 'DH'}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>TVA ({quotation.tauxTva}%) :</span>
              <span className="font-mono tabular-nums">{quotation.totalTva.toFixed(2)} {settings.devise || 'DH'}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-base font-extrabold text-slate-950">
              <span>TOTAL TTC À PAYER :</span>
              <span className="font-mono tabular-nums">{quotation.totalTTC.toFixed(2)} {settings.devise || 'DH'}</span>
            </div>
          </div>
        </div>

        {/* Partner Accreditation & Certification Badge */}
        <div className="flex flex-wrap items-center justify-between py-2 px-3 bg-slate-50 border border-slate-200 rounded-md text-[10px] text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 uppercase tracking-wide">Qualité Industrielle Certifiée :</span>
            <span className="font-mono text-slate-700">Profilés VEKA · MEKSA | Quincaillerie ROTO Frank</span>
          </div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantie Décennale 10 Ans & Conforme CSTB</span>
          </div>
        </div>

        {/* Signature & Bon pour accord */}
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300">
          <div className="text-[10px] text-slate-500 leading-tight space-y-1">
            <p>Conforme aux normes NF Fenêtres PVC et aux règles professionnelles du CSTB.</p>
            <p>Menuiseries éligibles aux aides de rénovation énergétique (selon loi de finances en vigueur).</p>
            <p className="text-[9px] text-slate-400">Document généré informatiquement par le logiciel officiel {settings.nomEntreprise}.</p>
          </div>

          <div className="border border-slate-300 rounded-md p-4 h-32 flex flex-col justify-between bg-slate-50/50">
            <div className="text-[11px] font-semibold text-slate-700">
              Mention manuscrite "Bon pour accord et commande" :
            </div>
            <div className="flex justify-between items-end text-[10px] text-slate-500">
              <span>Date : ____ / ____ / ________</span>
              <span>Signature du client :</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Quotation, Client, Project, JoineryItem } from '../types';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Copy,
  Trash2,
  CheckCircle,
  FileCheck,
  Printer,
  Sliders,
  AlertTriangle
} from 'lucide-react';

interface QuotationsViewProps {
  quotations: Quotation[];
  clients: Client[];
  projects: Project[];
  devise?: string;
  onSaveQuotation: (quote: Quotation) => void;
  onDeleteQuotation: (id: string) => void;
  onViewQuoteDetails: (quote: Quotation) => void;
  onOpenConfiguratorForQuote: (quoteId: string) => void;
  onConvertToOrder: (quote: Quotation) => void;
  onNewQuoteClick: () => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  clients,
  projects,
  devise = 'DH',
  onSaveQuotation,
  onDeleteQuotation,
  onViewQuoteDetails,
  onOpenConfiguratorForQuote,
  onConvertToOrder,
  onNewQuoteClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredQuotes = quotations.filter((q) => {
    const matchesStatus = statusFilter === 'ALL' || q.statut === statusFilter;
    const client = clients.find((c) => c.id === q.clientId);
    const clientName = client ? `${client.nom} ${client.prenom || ''}`.toLowerCase() : '';
    const matchesSearch =
      q.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const duplicateQuoteVersion = (quote: Quotation) => {
    const newVersion: Quotation = {
      ...quote,
      id: `quote_${Date.now()}`,
      version: quote.version + 1,
      dateDevis: new Date().toISOString().split('T')[0],
      statut: 'Brouillon',
      numero: quote.numero
    };
    onSaveQuotation(newVersion);
  };

  const updateQuoteStatus = (quote: Quotation, newStatus: Quotation['statut']) => {
    const updated: Quotation = {
      ...quote,
      statut: newStatus,
      dateAcceptation: newStatus === 'Accepte' ? new Date().toISOString().split('T')[0] : quote.dateAcceptation
    };
    onSaveQuotation(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Gestion des Devis & Chiffrages ({quotations.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Édition multi-menuiseries, gestion des révisions (v1, v2) et transformation en commande.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-56 shadow-2xs"
            />
          </div>

          <button
            onClick={onNewQuoteClick}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Créer un Devis
          </button>
        </div>
      </div>

      {/* Status filter bar */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 max-w-fit">
        {[
          { id: 'ALL', label: 'Tous' },
          { id: 'Brouillon', label: 'Brouillons' },
          { id: 'Transmis', label: 'Transmis' },
          { id: 'Accepte', label: 'Acceptés' },
          { id: 'Refuse', label: 'Refusés' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              statusFilter === tab.id
                ? 'bg-white text-blue-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quotations List Table - Clean White */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Aucun devis trouvé pour ce filtre.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">N° Devis / Ver.</th>
                <th className="py-3 px-4">Client & Affaire</th>
                <th className="py-3 px-4">Menuiseries</th>
                <th className="py-3 px-4">Date & Validité</th>
                <th className="py-3 px-4 text-right">Montant HT</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((q) => {
                const client = clients.find((c) => c.id === q.clientId);
                const project = projects.find((p) => p.id === q.projetId);
                const hasUnconfiguredItem = q.items.some(
                  (i) => i.calcul.status === 'NON_CONFIGURE'
                );

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        {q.numero}
                        <span className="text-[10px] text-blue-700 px-1 rounded bg-blue-50 border border-blue-100 font-semibold">
                          v{q.version}
                        </span>
                      </div>
                      {hasUnconfiguredItem && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-0.5 font-medium">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Prix à vérifier</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {client ? `${client.nom} ${client.prenom || ''}` : 'Client non assigné'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {project ? project.nom : 'Affaire standard'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-medium text-slate-900">
                        {q.items.length} menuiserie(s)
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {q.items.map((i) => i.repere).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      <div>Émis : <span className="text-slate-700">{q.dateDevis}</span></div>
                      <div>Validité : <span className="text-slate-700">{q.dateValidite}</span></div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {q.totalNetHT.toFixed(2)} {devise}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {q.totalTTC.toFixed(2)} {devise} TTC
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <select
                        value={q.statut}
                        onChange={(e) => updateQuoteStatus(q, e.target.value as Quotation['statut'])}
                        className={`text-[10px] font-semibold px-2 py-1 rounded border bg-white focus:outline-none cursor-pointer ${
                          q.statut === 'Accepte'
                            ? 'text-emerald-700 border-emerald-300 bg-emerald-50/50'
                            : q.statut === 'Refuse'
                            ? 'text-rose-700 border-rose-300 bg-rose-50/50'
                            : q.statut === 'Transmis'
                            ? 'text-blue-700 border-blue-300 bg-blue-50/50'
                            : 'text-slate-700 border-slate-300 bg-slate-50'
                        }`}
                      >
                        <option value="Brouillon">Brouillon</option>
                        <option value="Transmis">Transmis</option>
                        <option value="Accepte">Accepté</option>
                        <option value="Refuse">Refusé</option>
                        <option value="Perime">Périmé</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenConfiguratorForQuote(q.id)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Ajouter une menuiserie"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewQuoteDetails(q)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                          title="Visualiser et Imprimer le Devis PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateQuoteVersion(q)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Créer une nouvelle révision (v+1)"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {q.statut !== 'Accepte' && (
                          <button
                            onClick={() => onConvertToOrder(q)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors"
                            title="Valider en Commande Atelier"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteQuotation(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer le devis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

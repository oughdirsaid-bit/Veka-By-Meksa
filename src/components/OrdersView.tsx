import React, { useState } from 'react';
import { Order, Client, Project } from '../types';
import { ShoppingCart, Scissors, Search, Printer, CheckCircle, Clock, Trash2 } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  clients: Client[];
  projects: Project[];
  onUpdateOrderStatus: (orderId: string, status: Order['statut']) => void;
  onOpenCuttingSheet: (order: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  devise?: string;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  clients,
  projects,
  devise = 'DH',
  onUpdateOrderStatus,
  onOpenCuttingSheet,
  onDeleteOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.statut === statusFilter;
    const client = clients.find((c) => c.id === o.clientId);
    const clientName = client ? `${client.nom} ${client.prenom || ''}`.toLowerCase() : '';
    const matchesSearch =
      o.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.devisNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            Commandes & Suivi de Fabrication Atelier ({orders.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dossiers de fabrication, listes de débit pour coupeuse PVC et commandes verriers.
          </p>
        </div>

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
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 max-w-fit overflow-x-auto">
        {[
          { id: 'ALL', label: 'Toutes' },
          { id: 'Validee', label: 'Validées' },
          { id: 'Debit_En_Cours', label: 'Débit en cours' },
          { id: 'Assemblage', label: 'Assemblage' },
          { id: 'Pret', label: 'Prêtes' },
          { id: 'Livre_Pose', label: 'Livrées / Posées' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              statusFilter === tab.id
                ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table - Clean White */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Aucune commande enregistrée. Pour créer une commande, acceptez un devis depuis l'onglet Devis.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Client & Affaire</th>
                <th className="py-3 px-4">Menuiseries</th>
                <th className="py-3 px-4">Livraison Prévue</th>
                <th className="py-3 px-4 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-center">Statut Production</th>
                <th className="py-3 px-4 text-right">Actions Fiches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => {
                const client = clients.find((c) => c.id === o.clientId);
                const project = projects.find((p) => p.id === o.projetId);
                return (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900 text-xs">
                        {o.numeroCommande}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Devis : {o.devisNumero}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {client ? `${client.nom} ${client.prenom || ''}` : 'Client direct'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {project ? project.nom : 'Affaire générale'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-semibold text-blue-700">
                        {o.items.length} ouvrage(s)
                      </span>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {o.items.map((i) => `${i.repere} (${i.largeurMm}x${i.hauteurMm})`).join(', ')}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px] font-mono">
                      {o.dateLivraisonPrevue || 'À planifier'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {o.totalTTC.toFixed(2)} {devise}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={o.statut}
                        onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as Order['statut'])}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-800 cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="En_Attente">En attente validation</option>
                        <option value="Validee">Validée</option>
                        <option value="Debit_En_Cours">Débit profilés en cours</option>
                        <option value="Assemblage">Assemblage & Vitrage</option>
                        <option value="Pret">Prêt pour livraison/pose</option>
                        <option value="Livre_Pose">Posé / Livré</option>
                        <option value="Termine">Terminé / Facturé</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenCuttingSheet(o)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                          title="Ouvrir la fiche de débit atelier"
                        >
                          <Scissors className="w-3.5 h-3.5" />
                          Fiche Débit
                        </button>

                        <button
                          onClick={() => onDeleteOrder(o.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer la commande"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

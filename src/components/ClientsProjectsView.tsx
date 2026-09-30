import React, { useState } from 'react';
import { Client, Project } from '../types';
import { Users, FolderKanban, Plus, Search, Mail, Phone, MapPin, Building2, User, Edit, Trash2, X, FileText } from 'lucide-react';

interface ClientsProjectsViewProps {
  clients: Client[];
  projects: Project[];
  activeSubTab: 'clients' | 'projets';
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onSelectProjectForQuote: (project: Project) => void;
}

export const ClientsProjectsView: React.FC<ClientsProjectsViewProps> = ({
  clients,
  projects,
  activeSubTab,
  onSaveClient,
  onDeleteClient,
  onSaveProject,
  onDeleteProject,
  onSelectProjectForQuote
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Client form states
  const [clientNom, setClientNom] = useState('');
  const [clientPrenom, setClientPrenom] = useState('');
  const [clientRaison, setClientRaison] = useState('');
  const [clientType, setClientType] = useState<'Particulier' | 'Professionnel'>('Particulier');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAdresse, setClientAdresse] = useState('');
  const [clientCP, setClientCP] = useState('');
  const [clientVille, setClientVille] = useState('');
  const [clientSiret, setClientSiret] = useState('');
  const [clientRemise, setClientRemise] = useState(0);

  // Project form states
  const [projectNom, setProjectNom] = useState('');
  const [projectClientId, setProjectClientId] = useState('');
  const [projectAdresse, setProjectAdresse] = useState('');
  const [projectStatut, setProjectStatut] = useState<Project['statut']>('Etude');
  const [projectNotes, setProjectNotes] = useState('');

  const openClientForm = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientNom(client.nom);
      setClientPrenom(client.prenom || '');
      setClientRaison(client.raisonSociale || '');
      setClientType(client.type);
      setClientEmail(client.email);
      setClientPhone(client.telephone);
      setClientAdresse(client.adresse);
      setClientCP(client.codePostal);
      setClientVille(client.ville);
      setClientSiret(client.siret || '');
      setClientRemise(client.remiseCommercialePourcent || 0);
    } else {
      setEditingClient(null);
      setClientNom('');
      setClientPrenom('');
      setClientRaison('');
      setClientType('Particulier');
      setClientEmail('');
      setClientPhone('');
      setClientAdresse('');
      setClientCP('');
      setClientVille('');
      setClientSiret('');
      setClientRemise(0);
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim()) return;

    const saved: Client = {
      id: editingClient?.id || `cli_${Date.now()}`,
      codeClient: editingClient?.codeClient || `CLI-${(clients.length + 1).toString().padStart(3, '0')}`,
      nom: clientNom.trim(),
      prenom: clientPrenom.trim(),
      raisonSociale: clientRaison.trim(),
      type: clientType,
      email: clientEmail.trim(),
      telephone: clientPhone.trim(),
      adresse: clientAdresse.trim(),
      codePostal: clientCP.trim(),
      ville: clientVille.trim(),
      siret: clientSiret.trim(),
      remiseCommercialePourcent: Number(clientRemise) || 0,
      dateCreation: editingClient?.dateCreation || new Date().toISOString().split('T')[0]
    };
    onSaveClient(saved);
    setIsClientModalOpen(false);
  };

  const openProjectForm = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectNom(project.nom);
      setProjectClientId(project.clientId);
      setProjectAdresse(project.adresseChantier);
      setProjectStatut(project.statut);
      setProjectNotes(project.notes || '');
    } else {
      setEditingProject(null);
      setProjectNom('');
      setProjectClientId(clients[0]?.id || '');
      setProjectAdresse('');
      setProjectStatut('Etude');
      setProjectNotes('');
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectNom.trim() || !projectClientId) return;

    const saved: Project = {
      id: editingProject?.id || `proj_${Date.now()}`,
      codeProjet: editingProject?.codeProjet || `AFF-2026-${(projects.length + 1).toString().padStart(3, '0')}`,
      nom: projectNom.trim(),
      clientId: projectClientId,
      adresseChantier: projectAdresse.trim() || 'Adresse chantier client',
      dateCreation: editingProject?.dateCreation || new Date().toISOString().split('T')[0],
      statut: projectStatut,
      notes: projectNotes.trim()
    };
    onSaveProject(saved);
    setIsProjectModalOpen(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.prenom && c.prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.raisonSociale && c.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codeProjet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.adresseChantier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls - Clean Professional White Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {activeSubTab === 'clients' ? (
              <>
                <Users className="w-5 h-5 text-blue-600" />
                Répertoire Clients ({clients.length})
              </>
            ) : (
              <>
                <FolderKanban className="w-5 h-5 text-blue-600" />
                Affaires & Projets de Menuiserie ({projects.length})
              </>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeSubTab === 'clients'
              ? 'Gestion des clients particuliers, architectes, constructeurs et poseurs.'
              : 'Suivi des chantiers en rénovation et neuf avec liaisons devis et fiches de débit.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-56 shadow-xs"
            />
          </div>

          {activeSubTab === 'clients' ? (
            <button
              onClick={() => openClientForm()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Client
            </button>
          ) : (
            <button
              onClick={() => openProjectForm()}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Affaire
            </button>
          )}
        </div>
      </div>

      {/* Main Content Tables - Clean White */}
      {activeSubTab === 'clients' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Code / Nom</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Localisation</th>
                <th className="py-3 px-4 text-center">Remise</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Aucun client correspondant trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {c.nom} {c.prenom || ''}
                      </div>
                      {c.raisonSociale && <div className="text-[11px] text-slate-500">{c.raisonSociale}</div>}
                      <div className="text-[10px] font-mono text-slate-400">{c.codeClient}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${
                          c.type === 'Professionnel'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {c.type === 'Professionnel' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3 text-slate-500" />}
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {c.email || 'Non renseigné'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.telephone || 'Non renseigné'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.ville ? `${c.codePostal} ${c.ville}` : c.adresse || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-800">
                      {c.remiseCommercialePourcent > 0 ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {c.remiseCommercialePourcent}%
                        </span>
                      ) : (
                        <span className="text-slate-400">0%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openClientForm(c)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          title="Modifier le client"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClient(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-4">Code / Affaire</th>
                <th className="py-3 px-4">Client Associé</th>
                <th className="py-3 px-4">Chantier</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    Aucune affaire trouvée.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const client = clients.find((c) => c.id === p.clientId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.nom}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.codeProjet}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {client ? `${client.nom} ${client.prenom || ''}` : 'Inconnu'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {p.adresseChantier}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.statut.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectProjectForQuote(p)}
                            className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs"
                          >
                            + Chiffrer
                          </button>
                          <button
                            onClick={() => openProjectForm(p)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Modifier l'affaire"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProject(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Client Modal - Clean White Theme */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveClientSubmit}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingClient ? 'Modifier la Fiche Client' : 'Nouveau Client'}
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Type de client</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientType === 'Particulier'}
                      onChange={() => setClientType('Particulier')}
                      className="text-blue-600"
                    />
                    Particulier
                  </label>
                  <label className="flex items-center gap-2 text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="clientType"
                      checked={clientType === 'Professionnel'}
                      onChange={() => setClientType('Professionnel')}
                      className="text-blue-600"
                    />
                    Professionnel / Entreprise
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Nom / Contact *</label>
                <input
                  type="text"
                  required
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Prénom</label>
                <input
                  type="text"
                  value={clientPrenom}
                  onChange={(e) => setClientPrenom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {clientType === 'Professionnel' && (
                <div className="col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Raison Sociale</label>
                  <input
                    type="text"
                    value={clientRaison}
                    onChange={(e) => setClientRaison(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-medium mb-1">Téléphone</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-600 font-medium mb-1">Adresse</label>
                <input
                  type="text"
                  value={clientAdresse}
                  onChange={(e) => setClientAdresse(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Code Postal</label>
                <input
                  type="text"
                  value={clientCP}
                  onChange={(e) => setClientCP(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Ville</label>
                <input
                  type="text"
                  value={clientVille}
                  onChange={(e) => setClientVille(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Remise commerciale (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={clientRemise}
                  onChange={(e) => setClientRemise(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">SIRET / RC</label>
                <input
                  type="text"
                  value={clientSiret}
                  onChange={(e) => setClientSiret(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs cursor-pointer"
              >
                Enregistrer le client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Project Modal - Clean White Theme */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveProjectSubmit}
            className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-blue-600" />
                {editingProject ? 'Modifier l\'Affaire' : 'Nouvelle Affaire / Chantier'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nom de l'affaire *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rénovation Pavillon - Remplacement 8 fenêtres"
                  value={projectNom}
                  onChange={(e) => setProjectNom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Client Associé *</label>
                <select
                  value={projectClientId}
                  onChange={(e) => setProjectClientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} {c.prenom || ''} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Adresse du Chantier</label>
                <input
                  type="text"
                  value={projectAdresse}
                  onChange={(e) => setProjectAdresse(e.target.value)}
                  placeholder="Adresse de livraison / pose"
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Statut du Projet</label>
                <select
                  value={projectStatut}
                  onChange={(e) => setProjectStatut(e.target.value as Project['statut'])}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Etude">Étude préalable</option>
                  <option value="Chiffre">Chiffré</option>
                  <option value="Devis_Envoye">Devis envoyé</option>
                  <option value="Negociation">En négociation</option>
                  <option value="Gagne">Gagné</option>
                  <option value="Chantier_En_Cours">Chantier en cours</option>
                  <option value="Termine">Terminé</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Notes & Particularités</label>
                <textarea
                  rows={2}
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Accès difficile, échafaudage nécessaire..."
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-md"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-2xs cursor-pointer"
              >
                Enregistrer l'affaire
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

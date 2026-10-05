import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Upload, 
  Download, 
  Trash2, 
  Check, 
  Send, 
  Tag, 
  Building, 
  Phone,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { Contact } from '../types';

interface ContactsManagerProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onImportContacts: (contacts: Contact[]) => void;
  onDeleteContact: (id: string) => void;
  onComposeToContacts: (selectedIds: string[]) => void;
}

export function ContactsManager({
  contacts,
  onAddContact,
  onImportContacts,
  onDeleteContact,
  onComposeToContacts,
}: ContactsManagerProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Contact Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [newTags, setNewTags] = useState('VIP, Q4');

  const allTags = ['All', ...Array.from(new Set(contacts.flatMap(c => c.tags)))];

  const filtered = contacts.filter(c => {
    const matchesTag = activeTag === 'All' || c.tags.includes(activeTag);
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.offer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    const contact: Contact = {
      id: `c_${Date.now()}`,
      name: newName,
      phone: newPhone,
      company: newCompany || 'Independent Client',
      offer: newOffer || 'Exclusive VIP Welcome Package',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'active'
    };

    onAddContact(contact);
    setNewName('');
    setNewPhone('');
    setNewCompany('');
    setNewOffer('');
    setShowAddModal(false);
  };

  const handleImportSampleCSV = () => {
    const sampleBatch: Contact[] = [
      {
        id: `imp_${Date.now()}_1`,
        name: 'Jordan Belfort',
        phone: '+1 212 901 4455',
        company: 'Stratton Partners NY',
        offer: 'Private Wealth Advisory 20% Off',
        tags: ['Finance', 'VIP'],
        status: 'active'
      },
      {
        id: `imp_${Date.now()}_2`,
        name: 'Aisha Al-Hashimi',
        phone: '+971 4 332 9901',
        company: 'Emirates Venture Studio',
        offer: 'Seed Cohort Fast-Track Pass',
        tags: ['Venture', 'VIP'],
        status: 'active'
      },
      {
        id: `imp_${Date.now()}_3`,
        name: 'Lucas Dupont',
        phone: '+33 6 12 34 56 78',
        company: 'Atelier Lumière Paris',
        offer: 'Boutique Catalog Early Access',
        tags: ['Retail', 'Design'],
        status: 'active'
      }
    ];
    onImportContacts(sampleBatch);
  };

  const exportContactsCSV = () => {
    const headers = 'Name,Phone,Company,Offer,Tags,Status\n';
    const rows = filtered.map(c => 
      `"${c.name}","${c.phone}","${c.company}","${c.offer}","${c.tags.join(';')}","${c.status}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp_contacts_list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-black text-white p-4 md:p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
              <span>CRM & RECIPIENTS</span>
              <span>·</span>
              <span className="text-green-500 font-semibold">{contacts.length} Total Contacts</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Audience & Contacts</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleImportSampleCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-green-400" />
              <span>Import Sample CSV</span>
            </button>

            <button
              type="button"
              onClick={exportContactsCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-lg shadow-green-600/25 transition-colors"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search contacts by name, phone, or company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {allTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTag === tag
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Floating Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 px-5 rounded-2xl bg-zinc-900 border border-green-500/40 shadow-xl">
            <span className="text-xs font-semibold text-zinc-200">
              <strong className="text-green-400 font-mono">{selectedIds.length}</strong> contacts selected
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onComposeToContacts(selectedIds)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs shadow-md shadow-green-600/20"
              >
                <Send className="h-3 w-3" />
                <span>Compose Campaign</span>
              </button>
            </div>
          </div>
        )}

        {/* Table View */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/90 border-b border-zinc-800 text-zinc-400 font-mono">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && selectedIds.length === filtered.length}
                      onChange={handleSelectAll}
                      className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-green-600 focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-4 font-normal">Contact / Person</th>
                  <th className="py-3 px-4 font-normal">WhatsApp Phone</th>
                  <th className="py-3 px-4 font-normal">Company</th>
                  <th className="py-3 px-4 font-normal">Custom Offer Tag</th>
                  <th className="py-3 px-4 font-normal">Segment Tags</th>
                  <th className="py-3 px-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 italic">
                      No contacts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map(contact => {
                    const isSelected = selectedIds.includes(contact.id);
                    return (
                      <tr 
                        key={contact.id} 
                        className={`hover:bg-zinc-800/40 transition-colors ${
                          isSelected ? 'bg-zinc-800/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(contact.id)}
                            className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-800 text-green-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{contact.name}</span>
                          <span className="text-[10px] text-green-400 font-mono">Verified WhatsApp</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-300">
                          {contact.phone}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          {contact.company}
                        </td>
                        <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                          {contact.offer}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {contact.tags.map(t => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteContact(contact.id)}
                            className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                            title="Remove contact"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-green-500" />
                <span>Add WhatsApp Recipient</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono uppercase text-[10px] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Jordan Belfort"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono uppercase text-[10px] mb-1">Phone Number (WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="+1 415 555 0199"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono uppercase text-[10px] mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono uppercase text-[10px] mb-1">Personalized Offer Tag</label>
                <input
                  type="text"
                  value={newOffer}
                  onChange={e => setNewOffer(e.target.value)}
                  placeholder="25% Q4 VIP Voucher"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono uppercase text-[10px] mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="VIP, Retail, Hot Lead"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-600/25"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

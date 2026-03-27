import { useState } from 'react';
import { clientTickets, SupportTicket } from '../../../mocks/clientPortal';

const statusColors: Record<string, string> = {
  'Ouvert': 'bg-amber-50 text-amber-700 border-amber-200',
  'En cours': 'bg-sky-50 text-sky-700 border-sky-200',
  'Résolu': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fermé': 'bg-gray-100 text-gray-500 border-gray-200',
};

const priorityColors: Record<string, string> = {
  'Basse': 'text-gray-500',
  'Normale': 'text-sky-600',
  'Haute': 'text-orange-600',
  'Urgente': 'text-red-600',
};

const categoryIcons: Record<string, string> = {
  'Panne': 'ri-tools-line',
  'Réapprovisionnement': 'ri-shopping-cart-2-line',
  'Facturation': 'ri-bill-line',
  'Autre': 'ri-question-line',
};

export default function ClientSupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [tickets] = useState<SupportTicket[]>(clientTickets);
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState('Panne');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setSujet(''); setDescription(''); }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <span className="text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">{tickets.filter(t => t.statut === 'Ouvert' || t.statut === 'En cours').length} ticket(s) actif(s)</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer transition-all whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Nouveau ticket
        </button>
      </div>

      {/* New ticket form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#00272B]">Nouveau ticket de support</h3>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#00272B]/40"><i className="ri-close-line text-lg"></i></button>
            </div>
            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="ri-checkbox-circle-line text-emerald-500 text-3xl"></i>
                </div>
                <p className="text-sm font-semibold text-[#00272B]">Ticket envoyé !</p>
                <p className="text-xs text-[#00272B]/50 mt-1">Notre équipe vous répond sous 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-1.5">Catégorie</label>
                  <select value={categorie} onChange={e => setCategorie(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] cursor-pointer text-[#00272B]">
                    {['Panne', 'Réapprovisionnement', 'Facturation', 'Autre'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-1.5">Sujet</label>
                  <input type="text" value={sujet} onChange={e => setSujet(e.target.value)} required placeholder="Décrivez brièvement le problème" className="w-full h-10 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#00272B] mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} maxLength={500} placeholder="Détaillez votre problème..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] resize-none" />
                  <p className="text-xs text-[#00272B]/30 text-right mt-1">{description.length}/500</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 h-10 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-xl hover:bg-gray-50 cursor-pointer whitespace-nowrap">Annuler</button>
                  <button type="submit" className="flex-1 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer whitespace-nowrap">Envoyer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Tickets list */}
      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${categoryIcons[ticket.categorie]} text-[#00272B]/50`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#00272B]">{ticket.sujet}</p>
                  <p className="text-xs text-[#00272B]/40">{ticket.id} · {ticket.date} · {ticket.categorie}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <span className={`text-xs font-semibold ${priorityColors[ticket.priorite]}`}>{ticket.priorite}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[ticket.statut]}`}>{ticket.statut}</span>
              </div>
            </div>

            <p className="text-sm text-[#00272B]/60 mb-3 leading-relaxed">{ticket.description}</p>

            {ticket.reponseAdmin && (
              <div className="p-3.5 bg-[#f0f9f4] rounded-xl border border-[#1AAA3F]/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <i className="ri-shield-user-line text-[#1AAA3F] text-xs"></i>
                  <p className="text-xs font-semibold text-[#1AAA3F]">Réponse SMALIM</p>
                </div>
                <p className="text-sm text-[#00272B]/70">{ticket.reponseAdmin}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

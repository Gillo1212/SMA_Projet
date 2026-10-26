import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClientTickets } from '../../../hooks/useClientPortal';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import type { TicketCategory, TicketPriority } from '../../../types/models';
import { useTranslation } from 'react-i18next';
import { useStatusLabels } from '../../../i18n/useStatusLabels';

const statusColors: Record<string, string> = {
  'Ouvert': 'bg-amber-50 text-amber-700 border-amber-200',
  'En cours': 'bg-sky-50 text-sky-700 border-sky-200',
  'En attente client': 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
  'Maintenance': 'ri-settings-3-line',
  'Question': 'ri-question-line',
  'Livraison': 'ri-truck-line',
  'Facturation': 'ri-bill-line',
  'Autre': 'ri-chat-3-line',
};

// Doit rester aligné sur l'ENUM `category` de la table support_tickets
const CATEGORIES: TicketCategory[] = [
  'Panne',
  'Maintenance',
  'Question',
  'Livraison',
  'Facturation',
  'Autre',
];

const PRIORITES: TicketPriority[] = ['Basse', 'Normale', 'Haute', 'Urgente'];

const fieldClass = 'w-full h-11 px-3 border border-gray-200 rounded-xl text-sm text-[#00272B] bg-white focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10';

export default function ClientSupportPage() {
  const { t } = useTranslation();
  const status = useStatusLabels();
  const { tickets, isLoading, error, refetch, createTicket } = useClientTickets();
  const [params, setParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [sujet, setSujet] = useState('');
  const [description, setDescription] = useState('');
  const [categorie, setCategorie] = useState<TicketCategory>('Panne');
  const [priorite, setPriorite] = useState<TicketPriority>('Normale');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ?nouveau=livraison&commande=CMD-… : signalement depuis une commande, formulaire prérempli
  useEffect(() => {
    const kind = params.get('nouveau');
    if (!kind) return;
    const reference = params.get('commande');
    if (kind === 'livraison' && reference) {
      setCategorie('Livraison');
      setPriorite('Haute');
      setSujet(t('clientPortal.orders.problemSubject', { reference }));
      setDescription(t('clientPortal.orders.problemDescription', { reference }));
    }
    setShowForm(true);
    setParams({}, { replace: true });
  }, [params, setParams, t]);

  const reset = () => {
    setShowForm(false);
    setSubmitted(false);
    setFormError(null);
    setSujet('');
    setDescription('');
    setCategorie('Panne');
    setPriorite('Normale');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFormError(null);
    try {
      await createTicket({ sujet, description, categorie, priorite });
      setSubmitted(true);
      setTimeout(reset, 2000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t('clientPortal.support.sendError'));
    } finally {
      setSending(false);
    }
  };

  if (isLoading) return <LoadingState label={t('clientPortal.support.loading')} />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const active = tickets.filter(tk => tk.statut === 'Ouvert' || tk.statut === 'En cours').length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold px-3 py-1.5 bg-white text-[#00272B]/70 rounded-full border border-gray-100">
          <i className="ri-pulse-line text-amber-500 mr-1"></i>{t('clientPortal.support.activeTickets', { count: active })}
        </span>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] cursor-pointer transition-all whitespace-nowrap shadow-sm shadow-[#1AAA3F]/20"
        >
          <i className="ri-add-line"></i>
          {t('clientPortal.support.newTicket')}
        </button>
      </div>

      <Modal
        open={showForm}
        onClose={reset}
        size="md"
        closeLabel={t('clientPortal.common.close')}
        title={t('clientPortal.support.formTitle')}
      >
        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-checkbox-circle-line text-emerald-500 text-3xl"></i>
            </div>
            <p className="text-sm font-semibold text-[#00272B]">{t('clientPortal.support.sentTitle')}</p>
            <p className="text-xs text-[#00272B]/50 mt-1">{t('clientPortal.support.sentHint')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="tk-category" className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('clientPortal.support.category')}</label>
                <select id="tk-category" value={categorie} onChange={e => setCategorie(e.target.value as TicketCategory)} className={`${fieldClass} cursor-pointer`}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{status.category(c)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="tk-priority" className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('clientPortal.support.priority')}</label>
                <select id="tk-priority" value={priorite} onChange={e => setPriorite(e.target.value as TicketPriority)} className={`${fieldClass} cursor-pointer`}>
                  {PRIORITES.map(p => <option key={p} value={p}>{status.priority(p)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="tk-subject" className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('clientPortal.support.subject')}</label>
              <input id="tk-subject" type="text" value={sujet} onChange={e => setSujet(e.target.value)} required
                placeholder={t('clientPortal.support.subjectPlaceholder')} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="tk-description" className="block text-sm font-semibold text-[#00272B] mb-1.5">{t('clientPortal.support.description')}</label>
              <textarea id="tk-description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} maxLength={500}
                placeholder={t('clientPortal.support.descriptionPlaceholder')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1AAA3F] focus:ring-2 focus:ring-[#1AAA3F]/10 resize-none" />
              <p className="text-xs text-[#00272B]/30 text-right mt-1">{description.length}/500</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
              <button type="button" onClick={reset} className="flex-1 h-11 border border-gray-200 text-[#00272B]/60 text-sm font-medium rounded-xl hover:bg-gray-50 cursor-pointer">{t('clientPortal.common.cancel')}</button>
              <button type="submit" disabled={sending} className="flex-1 h-11 bg-[#1AAA3F] text-white text-sm font-semibold rounded-xl hover:bg-[#158f35] disabled:opacity-60 cursor-pointer">
                {sending ? t('clientPortal.support.sending') : t('clientPortal.support.send')}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {tickets.length === 0 ? (
        <EmptyState
          icon="ri-customer-service-2-line"
          title={t('clientPortal.support.emptyTitle')}
          description={t('clientPortal.support.emptyHint')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map(ticket => (
            <article key={ticket.id} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className={`${categoryIcons[ticket.categorie]} text-[#00272B]/50`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#00272B]">{ticket.sujet}</p>
                      <p className="text-xs text-[#00272B]/40">
                        {ticket.reference} · {ticket.date} · {status.category(ticket.categorie)}
                        {ticket.machineNom ? ` · ${ticket.machineNom}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold ${priorityColors[ticket.priorite]}`}>{status.priority(ticket.priorite)}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${statusColors[ticket.statut]}`}>{status.ticket(ticket.statut)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#00272B]/60 mt-3 leading-relaxed whitespace-pre-line">{ticket.description}</p>
                  {ticket.reponseAdmin && (
                    <div className="mt-3 p-3.5 bg-[#f0f9f4] rounded-xl border border-[#1AAA3F]/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <i className="ri-shield-user-line text-[#1AAA3F] text-xs"></i>
                        <p className="text-xs font-semibold text-[#1AAA3F]">{t('clientPortal.common.smalimReply')}</p>
                      </div>
                      <p className="text-sm text-[#00272B]/70 whitespace-pre-line">{ticket.reponseAdmin}</p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { contactService, type ContactMessage, type ContactStatus } from '../../../services/contact.service';
import { notifyAdminDataChanged } from '../../../services/adminEvents';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';

const STATUS: Record<ContactStatus, { label: string; pill: string; icon: string }> = {
  new:      { label: 'Nouveau',  pill: 'bg-[#1AAA3F]/10 text-[#0D8C2E]', icon: 'ri-mail-unread-line' },
  read:     { label: 'Lu',       pill: 'bg-sky-50 text-sky-700',        icon: 'ri-mail-open-line' },
  replied:  { label: 'Répondu',  pill: 'bg-indigo-50 text-indigo-700',  icon: 'ri-reply-line' },
  archived: { label: 'Archivé',  pill: 'bg-gray-100 text-gray-500',     icon: 'ri-archive-line' },
};

type Filter = 'inbox' | ContactStatus;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'inbox', label: 'Boîte de réception' },
  { key: 'new', label: 'Nouveaux' },
  { key: 'read', label: 'Lus' },
  { key: 'replied', label: 'Répondus' },
  { key: 'archived', label: 'Archivés' },
];

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminMessagesPage() {
  const { user } = useAuthContext();
  const canDelete = user?.role === 'super_admin' || user?.role === 'admin';
  const { toasts, notify, dismiss } = useToasts();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('inbox');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setMessages(await contactService.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Messages indisponibles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const replace = (updated: ContactMessage) =>
    setMessages(prev => prev.map(m => (m.id === updated.id ? updated : m)));

  const counts = useMemo(() => {
    const c: Record<ContactStatus, number> = { new: 0, read: 0, replied: 0, archived: 0 };
    for (const m of messages) c[m.status] += 1;
    return c;
  }, [messages]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter(m => {
      const matchFilter = filter === 'inbox' ? m.status !== 'archived' : m.status === filter;
      const matchSearch = !q || [m.name, m.email, m.subject ?? '', m.message, m.phone ?? ''].some(v => v.toLowerCase().includes(q));
      return matchFilter && matchSearch;
    });
  }, [messages, filter, search]);

  /** Ouverture : un message nouveau passe en « lu » */
  const open = async (m: ContactMessage) => {
    setSelectedId(m.id);
    if (m.status === 'new') {
      try {
        replace(await contactService.update(m.id, { status: 'read' }));
        notifyAdminDataChanged();
      } catch { /* l'affichage reste possible ; le statut sera changé plus tard */ }
    }
  };

  const selected = messages.find(m => m.id === selectedId) ?? null;

  if (isLoading) return <LoadingState label="Chargement des messages…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      {/* Compteurs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(['new', 'read', 'replied', 'archived'] as ContactStatus[]).map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`bg-white rounded-xl p-5 border flex items-center gap-4 text-left cursor-pointer transition-colors ${filter === s ? 'border-[#1AAA3F]' : 'border-gray-100 hover:border-gray-200'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${STATUS[s].pill}`}>
              <i className={`${STATUS[s].icon} text-lg`}></i>
            </div>
            <div>
              <p className="text-xl font-bold text-[#00272B]">{counts[s]}</p>
              <p className="text-xs text-[#00272B]/40">{STATUS[s].label}{counts[s] > 1 && s !== 'new' ? 's' : ''}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Filtrer les messages">
            {FILTERS.map(f => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 h-9 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer ${filter === f.key ? 'bg-[#00272B] text-white' : 'text-[#00272B]/60 hover:bg-gray-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#00272B]/30 text-sm"></i>
            <input
              type="search"
              placeholder="Rechercher (nom, email, sujet, texte)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Rechercher un message"
              className="w-full lg:w-72 h-9 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon="ri-mail-line"
            title={messages.length === 0 ? 'Aucun message pour le moment' : 'Aucun message dans cette vue'}
            description={messages.length === 0 ? 'Les messages envoyés depuis la page Contact du site arriveront ici.' : undefined}
          />
        ) : (
          <ul className="divide-y divide-gray-50">
            {visible.map(m => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className="w-full text-left px-4 sm:px-5 py-4 hover:bg-gray-50/70 flex items-start gap-3 cursor-pointer"
                >
                  <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${m.status === 'new' ? 'bg-[#1AAA3F]' : 'bg-transparent'}`} aria-hidden="true"></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm text-[#00272B] ${m.status === 'new' ? 'font-bold' : 'font-semibold'}`}>{m.name}</p>
                      <span className="text-xs text-[#00272B]/40 truncate">{m.email}</span>
                      <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS[m.status].pill}`}>{STATUS[m.status].label}</span>
                    </div>
                    <p className={`text-sm mt-0.5 ${m.status === 'new' ? 'text-[#00272B] font-semibold' : 'text-[#00272B]/70'}`}>{m.subject || 'Sans sujet'}</p>
                    <p className="text-xs text-[#00272B]/45 mt-0.5 line-clamp-1">{m.message}</p>
                  </div>
                  <span className="text-xs text-[#00272B]/40 whitespace-nowrap hidden sm:block">{dateTime(m.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <MessageModal
          message={selected}
          canDelete={canDelete}
          onClose={() => setSelectedId(null)}
          onUpdated={updated => { replace(updated); notifyAdminDataChanged(); }}
          onDeleted={() => {
            setMessages(prev => prev.filter(m => m.id !== selected.id));
            setSelectedId(null);
            notifyAdminDataChanged();
            notify('success', 'Message supprimé');
          }}
          notify={notify}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

interface MessageModalProps {
  message: ContactMessage;
  canDelete: boolean;
  onClose: () => void;
  onUpdated: (m: ContactMessage) => void;
  onDeleted: () => void;
  notify: ReturnType<typeof useToasts>['notify'];
}

function MessageModal({ message: m, canDelete, onClose, onUpdated, onDeleted, notify }: MessageModalProps) {
  const [note, setNote] = useState(m.adminNote ?? '');
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { setNote(m.adminNote ?? ''); }, [m.id, m.adminNote]);

  const save = async (changes: { status?: ContactStatus; adminNote?: string | null }, success: string) => {
    setBusy(true);
    try {
      onUpdated(await contactService.update(m.id, changes));
      notify('success', success);
    } catch (err) {
      notify('error', 'Modification non enregistrée', err instanceof Error ? err.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await contactService.remove(m.id);
      onDeleted();
    } catch (err) {
      notify('error', 'Suppression impossible', err instanceof Error ? err.message : undefined);
      setBusy(false);
    }
  };

  const replySubject = `Re: ${m.subject || 'Votre message à SMALIM'}`;
  const replyBody = `Bonjour ${m.name},\n\n\n\n---\nVotre message du ${dateTime(m.createdAt)} :\n${m.message}`;
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
  const phoneDigits = (m.phone ?? '').replace(/[^\d+]/g, '');
  const whatsapp = phoneDigits ? `https://wa.me/${phoneDigits.replace(/^\+/, '').replace(/^(?!221)(\d{9})$/, '221$1')}` : null;
  const noteChanged = (note.trim() || null) !== (m.adminNote ?? null);

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        title={m.subject || 'Message sans sujet'}
        subtitle={`Reçu le ${dateTime(m.createdAt)}`}
        headerExtra={<span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS[m.status].pill}`}>{STATUS[m.status].label}</span>}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex gap-2">
              {canDelete && (
                <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy}
                  className="h-10 px-4 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50">
                  <i className="ri-delete-bin-line mr-1.5"></i>Supprimer
                </button>
              )}
              {m.status === 'archived' ? (
                <button type="button" onClick={() => save({ status: 'read' }, 'Message remis dans la boîte de réception')} disabled={busy}
                  className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-[#00272B]/70 hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                  <i className="ri-inbox-unarchive-line mr-1.5"></i>Désarchiver
                </button>
              ) : (
                <button type="button" onClick={() => save({ status: 'archived' }, 'Message archivé')} disabled={busy}
                  className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-semibold text-[#00272B]/70 hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                  <i className="ri-archive-line mr-1.5"></i>Archiver
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {m.status !== 'replied' && (
                <button type="button" onClick={() => save({ status: 'replied' }, 'Marqué comme répondu')} disabled={busy}
                  className="h-10 px-4 rounded-lg border border-[#1AAA3F] text-[#1AAA3F] text-sm font-semibold hover:bg-[#1AAA3F]/5 cursor-pointer disabled:opacity-50 whitespace-nowrap">
                  <i className="ri-check-double-line mr-1.5"></i>Marquer répondu
                </button>
              )}
              <a href={mailto}
                className="h-10 px-5 inline-flex items-center rounded-lg bg-[#1AAA3F] text-white text-sm font-semibold hover:bg-[#158f35] whitespace-nowrap">
                <i className="ri-reply-line mr-1.5"></i>Répondre par email
              </a>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2">
            <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Message</h3>
            <p className="text-sm text-[#00272B] leading-relaxed whitespace-pre-wrap break-words bg-gray-50 rounded-xl p-4">{m.message}</p>

            <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mt-6 mb-2">
              <label htmlFor="admin-note">Note interne</label>
            </h3>
            <textarea
              id="admin-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Visible uniquement par l'équipe (rappel, suite donnée…)"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#1AAA3F] resize-y"
            />
            {noteChanged && (
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => save({ adminNote: note.trim() || null }, 'Note enregistrée')} disabled={busy}
                  className="h-9 px-4 rounded-lg bg-[#00272B] text-white text-sm font-semibold hover:bg-[#00272B]/90 cursor-pointer disabled:opacity-50">
                  Enregistrer la note
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Expéditeur</h3>
              <p className="text-sm font-semibold text-[#00272B]">{m.name}</p>
              <a href={`mailto:${m.email}`} className="block text-sm text-[#1AAA3F] hover:underline break-all">{m.email}</a>
              {m.phone && (
                <div className="flex items-center gap-3 mt-1">
                  <a href={`tel:${phoneDigits}`} className="text-sm text-[#00272B]/70 hover:text-[#1AAA3F]">
                    <i className="ri-phone-line mr-1"></i>{m.phone}
                  </a>
                  {whatsapp && (
                    <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm text-[#25D366] hover:underline" title="Écrire sur WhatsApp">
                      <i className="ri-whatsapp-line"></i>
                    </a>
                  )}
                </div>
              )}
            </div>
            {m.handledByName && m.handledAt && (
              <div>
                <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Suivi</h3>
                <p className="text-xs text-[#00272B]/60">
                  {STATUS[m.status].label} par {m.handledByName}<br />le {dateTime(m.handledAt)}
                </p>
              </div>
            )}
            <p className="text-xs text-[#00272B]/40 leading-relaxed">
              « Répondre par email » ouvre votre messagerie avec le message cité. Pensez ensuite à le marquer comme répondu.
            </p>
          </aside>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer ce message ?"
        message={`Le message de ${m.name} sera définitivement supprimé. Pour simplement le ranger, utilisez plutôt « Archiver ».`}
        confirmLabel="Supprimer"
        tone="danger"
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}

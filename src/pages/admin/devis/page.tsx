import { useMemo, useState } from 'react';
import { useQuotes } from '../../../hooks/useQuotes';
import { useAdminCounters } from '../../../hooks/useAdminCounters';
import { LoadingState, ErrorState, EmptyState } from '../../../components/feature/AsyncState';
import Modal from '../../../components/admin/Modal';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import Toasts, { useToasts } from '../../../components/admin/Toasts';
import type { Quote, QuoteStatus } from '../../../types/models';

// ── Référentiels d'affichage ───────────────────────────────────────────────

const ALL_STATUTS: QuoteStatus[] = ['Nouveau', 'En cours', 'Devis envoyé', 'Accepté', 'Refusé', 'Expiré'];

const STATUS_KEYS: Record<QuoteStatus, string> = {
  'Nouveau': 'pending', 'En cours': 'processing', 'Devis envoyé': 'quoted',
  'Accepté': 'accepted', 'Refusé': 'refused', 'Expiré': 'expired',
};

const STATUS_STYLES: Record<QuoteStatus, { pill: string; dot: string; icon: string }> = {
  'Nouveau':      { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: 'ri-sparkling-line' },
  'En cours':     { pill: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500', icon: 'ri-loader-2-line' },
  'Devis envoyé': { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500', icon: 'ri-mail-send-line' },
  'Accepté':      { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: 'ri-checkbox-circle-line' },
  'Refusé':       { pill: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', icon: 'ri-close-circle-line' },
  'Expiré':       { pill: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400', icon: 'ri-hourglass-line' },
};

type Filter = 'Tous' | 'À traiter' | QuoteStatus;
const TO_HANDLE: QuoteStatus[] = ['Nouveau', 'En cours'];

const fcfa = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;
const inputClass = 'w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[#1AAA3F] text-[#00272B]';

/** Date au format AAAA-MM-JJ, décalée de `days` jours */
function isoDay(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function StatusPill({ statut }: { statut: QuoteStatus }) {
  const s = STATUS_STYLES[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
      {statut}
    </span>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminDevisPage() {
  const { quotes, isLoading, error, updateStatus, sendProposal, refetch } = useQuotes({ limit: 200 });
  const { counters } = useAdminCounters();
  const { toasts, notify, dismiss } = useToasts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('Tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const countOf = (statut: QuoteStatus) =>
    counters?.quotesByStatus[STATUS_KEYS[statut]] ?? quotes.filter(q => q.statut === statut).length;
  const total = counters ? Object.values(counters.quotesByStatus).reduce((a, b) => a + b, 0) : quotes.length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quotes.filter(d => {
      const matchSearch = !q || [d.entreprise, d.contact, d.email, d.reference, d.machine].some(v => v.toLowerCase().includes(q));
      const matchFilter =
        filter === 'Tous' ? true : filter === 'À traiter' ? TO_HANDLE.includes(d.statut) : d.statut === filter;
      return matchSearch && matchFilter;
    });
  }, [quotes, search, filter]);

  if (isLoading) return <LoadingState label="Chargement des devis…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  // Valeurs : seules les propositions en attente de réponse ou acceptées comptent
  const pendingValue = quotes.filter(q => q.statut === 'Devis envoyé').reduce((s, q) => s + (q.montantPropose ?? 0), 0);
  const acceptedValue = quotes.filter(q => q.statut === 'Accepté').reduce((s, q) => s + (q.montantPropose ?? 0), 0);

  const summary: { label: string; hint: string; value: number; statut: QuoteStatus; icon: string; tone: string }[] = [
    { label: 'Nouveaux', hint: 'à prendre en charge', value: countOf('Nouveau'), statut: 'Nouveau', icon: 'ri-sparkling-line', tone: 'text-amber-600 bg-amber-50' },
    { label: 'En cours', hint: 'proposition à préparer', value: countOf('En cours'), statut: 'En cours', icon: 'ri-loader-2-line', tone: 'text-sky-600 bg-sky-50' },
    { label: 'En attente de réponse', hint: pendingValue ? fcfa(pendingValue) : 'aucune proposition envoyée', value: countOf('Devis envoyé'), statut: 'Devis envoyé', icon: 'ri-mail-send-line', tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'Acceptés', hint: acceptedValue ? fcfa(acceptedValue) : 'aucun pour le moment', value: countOf('Accepté'), statut: 'Accepté', icon: 'ri-checkbox-circle-line', tone: 'text-emerald-600 bg-emerald-50' },
  ];

  const tabs: { key: Filter; count: number }[] = [
    { key: 'Tous', count: total },
    { key: 'À traiter', count: countOf('Nouveau') + countOf('En cours') },
    ...ALL_STATUTS.map(s => ({ key: s as Filter, count: countOf(s) })),
  ];

  const selected = quotes.find(q => q.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Synthèse */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.map(card => (
          <button
            key={card.label} type="button" onClick={() => setFilter(card.statut)}
            className={`text-left bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:border-[#1AAA3F]/40 hover:shadow-sm ${
              filter === card.statut ? 'border-[#1AAA3F]' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.tone}`}>
                <i className={`${card.icon} text-lg`}></i>
              </div>
              <i className="ri-arrow-right-up-line text-[#00272B]/20"></i>
            </div>
            <p className="text-2xl font-bold text-[#00272B]">{card.value}</p>
            <p className="text-sm font-medium text-[#00272B]/70">{card.label}</p>
            <p className="text-xs text-[#00272B]/40 truncate">{card.hint}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#00272B]">Demandes de devis</h2>
              <p className="text-xs text-[#00272B]/40">{filtered.length} affichée(s) sur {total}</p>
            </div>
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <div className="relative flex-1 sm:w-72">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#00272B]/30 text-sm"></i>
                <input
                  type="search" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Entreprise, contact, machine…" aria-label="Rechercher un devis"
                  className="w-full h-9 pl-9 pr-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1AAA3F]"
                />
              </div>
              <button onClick={refetch} title="Actualiser" aria-label="Actualiser"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer text-[#00272B]/50">
                <i className="ri-refresh-line"></i>
              </button>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Filtrer par statut">
            {tabs.map(t => (
              <button
                key={t.key} type="button" role="tab" aria-selected={filter === t.key}
                onClick={() => setFilter(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  filter === t.key ? 'bg-[#00272B] text-white' : 'bg-gray-50 text-[#00272B]/60 hover:bg-gray-100'
                }`}
              >
                {t.key}
                <span className={`px-1.5 rounded ${filter === t.key ? 'bg-white/20' : 'bg-white text-[#00272B]/50'}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-file-list-3-line"
            title={quotes.length === 0 ? 'Aucune demande de devis' : 'Aucun résultat'}
            description={quotes.length === 0
              ? 'Les demandes envoyées depuis le site apparaîtront ici.'
              : 'Aucune demande ne correspond à ce filtre.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-gray-50/60">
                <tr>
                  {['Demande', 'Machine', 'Reçue le', 'Proposition', 'Statut', ''].map(h => (
                    <th key={h || 'action'} className="px-5 py-3 text-left text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(d => (
                  <tr key={d.id} onClick={() => setSelectedId(d.id)} className="hover:bg-[#F6F3EC]/60 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 max-w-[260px]">
                      <p className="text-sm font-semibold text-[#00272B] truncate">{d.entreprise}</p>
                      <p className="text-xs text-[#00272B]/40 truncate">{d.contact} · {d.reference}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-[220px]">
                      <p className="text-sm text-[#00272B]/80 truncate">{d.machine || '-'}</p>
                      <p className="text-xs text-[#00272B]/40">{d.quantite} unité(s)</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-[#00272B]/60 whitespace-nowrap">{d.date}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold whitespace-nowrap">
                      {d.montantPropose ? <span className="text-[#00272B]">{fcfa(d.montantPropose)}</span> : <span className="text-[#00272B]/30 font-normal">-</span>}
                    </td>
                    <td className="px-5 py-3.5"><StatusPill statut={d.statut} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button" onClick={e => { e.stopPropagation(); setSelectedId(d.id); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#00272B]/70 hover:border-[#1AAA3F] hover:text-[#1AAA3F] cursor-pointer whitespace-nowrap"
                      >
                        Gérer <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <QuoteModal
          key={selected.id}
          quote={selected}
          onClose={() => setSelectedId(null)}
          onStatus={async (statut, message) => {
            try {
              await updateStatus(selected.id, statut);
              notify('success', message ?? `Statut enregistré : ${statut}`);
              return true;
            } catch (e) {
              notify('error', 'Mise à jour impossible', e instanceof Error ? e.message : undefined);
              return false;
            }
          }}
          onProposal={async proposal => {
            const firstSend = selected.statut !== 'Devis envoyé';
            try {
              await sendProposal(selected.id, proposal);
              notify('success', firstSend ? 'Proposition envoyée' : 'Proposition mise à jour',
                firstSend ? `Le contact (${selected.email}) la reçoit par email.` : 'Aucun nouvel email n’est envoyé.');
              return true;
            } catch (e) {
              notify('error', 'Envoi impossible', e instanceof Error ? e.message : undefined);
              return false;
            }
          }}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

// ── Fenêtre de détail ──────────────────────────────────────────────────────

interface QuoteModalProps {
  quote: Quote;
  onClose: () => void;
  onStatus: (statut: QuoteStatus, message?: string) => Promise<boolean>;
  onProposal: (proposal: { montant: number; validite?: string; reponse?: string }) => Promise<boolean>;
}

function QuoteModal({ quote, onClose, onStatus, onProposal }: QuoteModalProps) {
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState(quote.montantPropose ? String(quote.montantPropose) : '');
  // expires_at est prérempli à la création de la demande : on ne le reprend que pour une proposition déjà envoyée et encore valable
  const [validity, setValidity] = useState(() => {
    const current = quote.validite?.split('T')[0];
    return quote.montantPropose && current && current >= isoDay(0) ? current : isoDay(30);
  });
  const [reply, setReply] = useState(quote.notes ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | 'send' | 'refuse'>(null);
  const [editing, setEditing] = useState(false);

  const sent = quote.statut === 'Devis envoyé';
  const decided = quote.statut === 'Accepté' || quote.statut === 'Refusé' || quote.statut === 'Expiré';
  const canPropose = !decided && (!sent || editing);
  const amountValue = Number(amount.replace(/[\s ]/g, ''));

  const run = async (fn: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await fn();
    setBusy(false);
    if (ok) { setConfirm(null); setEditing(false); }
    return ok;
  };

  const submitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFormError('Indiquez un montant valide.');
      return;
    }
    setFormError(null);
    // Premier envoi : le contact reçoit un email, on fait confirmer
    if (!sent) setConfirm('send');
    else run(() => onProposal({ montant: amountValue, validite: validity || undefined, reponse: reply.trim() || undefined }));
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        size="xl"
        title={quote.entreprise}
        subtitle={`${quote.reference} · reçue le ${quote.date}`}
        headerExtra={<StatusPill statut={quote.statut} />}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {(quote.statut === 'Nouveau' || quote.statut === 'En cours') && (
                <button type="button" disabled={busy} onClick={() => setConfirm('refuse')}
                  className="px-3 h-9 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50">
                  <i className="ri-close-circle-line mr-1"></i>Refuser la demande
                </button>
              )}
              {sent && (
                <>
                  <button type="button" disabled={busy} onClick={() => run(() => onStatus('Refusé', 'Devis marqué refusé'))}
                    className="px-3 h-9 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50">
                    Le client refuse
                  </button>
                  <button type="button" disabled={busy} onClick={() => run(() => onStatus('Expiré', 'Devis marqué expiré'))}
                    className="px-3 h-9 rounded-lg text-sm font-medium text-[#00272B]/60 hover:bg-gray-100 cursor-pointer disabled:opacity-50">
                    Marquer expiré
                  </button>
                </>
              )}
              {decided && (
                <button type="button" disabled={busy} onClick={() => run(() => onStatus('En cours', 'Demande rouverte'))}
                  className="px-3 h-9 rounded-lg text-sm font-medium text-[#00272B]/70 hover:bg-gray-100 cursor-pointer disabled:opacity-50">
                  <i className="ri-arrow-go-back-line mr-1"></i>Rouvrir la demande
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {quote.statut === 'Nouveau' && (
                <button type="button" disabled={busy} onClick={() => run(() => onStatus('En cours', 'Demande prise en charge'))}
                  className="px-4 h-10 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#00272B] hover:bg-gray-50 cursor-pointer disabled:opacity-50">
                  Prendre en charge
                </button>
              )}
              {sent && (
                <button type="button" disabled={busy} onClick={() => run(() => onStatus('Accepté', 'Devis marqué accepté'))}
                  className="px-5 h-10 bg-[#1AAA3F] text-white text-sm font-semibold rounded-lg hover:bg-[#148a33] cursor-pointer disabled:opacity-60">
                  <i className="ri-checkbox-circle-line mr-1"></i>Le client accepte
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Demande */}
          <section className="lg:col-span-3 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Demande</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1 p-3 bg-[#F6F3EC] rounded-xl">
                  <p className="text-xs text-[#00272B]/40">Machine</p>
                  <p className="text-sm font-semibold text-[#00272B]">{quote.machine || '-'}</p>
                </div>
                <div className="p-3 bg-[#F6F3EC] rounded-xl">
                  <p className="text-xs text-[#00272B]/40">Quantité</p>
                  <p className="text-sm font-semibold text-[#00272B]">{quote.quantite}</p>
                </div>
                <div className="p-3 bg-[#F6F3EC] rounded-xl">
                  <p className="text-xs text-[#00272B]/40">Budget annoncé</p>
                  <p className="text-sm font-semibold text-[#00272B]">{quote.budget ? fcfa(quote.budget) : '-'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Message du client</h3>
              <p className="text-sm text-[#00272B]/75 leading-relaxed whitespace-pre-line p-4 border border-gray-100 rounded-xl max-h-56 overflow-y-auto">
                {quote.message || 'Aucun message.'}
              </p>
            </div>

            {/* Proposition */}
            <div className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#00272B]">Proposition</h3>
                {sent && !editing && (
                  <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-[#1AAA3F] hover:underline cursor-pointer">
                    Modifier
                  </button>
                )}
              </div>

              {!canPropose ? (
                quote.montantPropose ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-[#00272B]">{fcfa(quote.montantPropose)}</p>
                    {quote.validite && <p className="text-xs text-[#00272B]/50">Valable jusqu’au {new Date(quote.validite).toLocaleDateString('fr-FR')}</p>}
                    {quote.notes && <p className="text-sm text-[#00272B]/70 whitespace-pre-line p-3 bg-gray-50 rounded-lg">{quote.notes}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-[#00272B]/40">Aucune proposition n’a été envoyée.</p>
                )
              ) : (
                <form onSubmit={submitProposal} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="q-amount" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Montant HT proposé (FCFA)</label>
                      <input id="q-amount" inputMode="numeric" required value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="Ex. 5 200 000" className={inputClass} data-autofocus />
                    </div>
                    <div>
                      <label htmlFor="q-validity" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Valable jusqu’au</label>
                      <input id="q-validity" type="date" min={isoDay(0)} value={validity} onChange={e => setValidity(e.target.value)}
                        className={`${inputClass} cursor-pointer`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="q-reply" className="block text-xs font-semibold text-[#00272B]/60 mb-1.5">Message au client (facultatif)</label>
                    <textarea id="q-reply" rows={3} value={reply} onChange={e => setReply(e.target.value)} maxLength={2000}
                      placeholder="Détail de l’offre, conditions d’installation…"
                      className={`${inputClass} resize-none`} />
                  </div>
                  {formError && <p className="text-xs text-red-600">{formError}</p>}
                  <div className="flex justify-end gap-2">
                    {editing && (
                      <button type="button" onClick={() => setEditing(false)} className="px-4 h-9 rounded-lg text-sm text-[#00272B]/60 hover:bg-gray-100 cursor-pointer">
                        Annuler
                      </button>
                    )}
                    <button type="submit" disabled={busy}
                      className="px-4 h-9 bg-[#00272B] text-white text-sm font-semibold rounded-lg hover:bg-[#003d42] cursor-pointer disabled:opacity-60 flex items-center gap-2">
                      {busy && <i className="ri-loader-4-line animate-spin"></i>}
                      <i className={sent ? 'ri-save-line' : 'ri-mail-send-line'}></i>
                      {sent ? 'Enregistrer (sans renvoyer)' : 'Envoyer la proposition'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Contact */}
          <aside className="lg:col-span-2 space-y-3">
            <div className="p-4 bg-[#F6F3EC] rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-2">Contact</p>
              <p className="text-sm font-semibold text-[#00272B]">{quote.contact}</p>
              <p className="text-xs text-[#00272B]/60">{quote.entreprise}</p>
              {quote.email && <a href={`mailto:${quote.email}`} className="block mt-2 text-xs text-[#1AAA3F] hover:underline break-all"><i className="ri-mail-line mr-1"></i>{quote.email}</a>}
              {quote.phone && <a href={`tel:${quote.phone}`} className="block mt-1 text-xs text-[#00272B]/60 hover:text-[#1AAA3F]"><i className="ri-phone-line mr-1"></i>{quote.phone}</a>}
            </div>
            <div className="p-4 border border-gray-100 rounded-xl">
              <p className="text-xs font-semibold text-[#00272B]/40 uppercase tracking-wide mb-3">Étapes</p>
              <ol className="space-y-2 text-xs">
                {[
                  { s: 'Nouveau', t: 'Demande reçue' },
                  { s: 'En cours', t: 'Prise en charge' },
                  { s: 'Devis envoyé', t: 'Proposition envoyée' },
                  { s: 'Accepté', t: 'Réponse du client' },
                ].map((step, i) => {
                  const order = ['Nouveau', 'En cours', 'Devis envoyé', 'Accepté'];
                  // Refusé / Expiré : la proposition n'a été envoyée que s'il existe un montant
                  const reached = quote.statut === 'Refusé' || quote.statut === 'Expiré'
                    ? i <= (quote.montantPropose ? 3 : 1)
                    : order.indexOf(quote.statut) >= i;
                  return (
                    <li key={step.s} className={`flex items-center gap-2 ${reached ? 'text-[#00272B]' : 'text-[#00272B]/35'}`}>
                      <i className={reached ? 'ri-checkbox-circle-fill text-[#1AAA3F]' : 'ri-checkbox-blank-circle-line'}></i>
                      {i === 3 && (quote.statut === 'Refusé' || quote.statut === 'Expiré') ? `Réponse : ${quote.statut.toLowerCase()}` : step.t}
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm === 'send'}
        title="Envoyer la proposition ?"
        message={<>Le contact <strong>{quote.email}</strong> va recevoir par email une proposition de <strong>{fcfa(amountValue || 0)}</strong>{validity ? <>, valable jusqu’au {new Date(validity).toLocaleDateString('fr-FR')}</> : null}.</>}
        confirmLabel="Envoyer"
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => onProposal({ montant: amountValue, validite: validity || undefined, reponse: reply.trim() || undefined }))}
      />
      <ConfirmDialog
        open={confirm === 'refuse'}
        title="Refuser cette demande ?"
        message="La demande passe en « Refusé ». Aucun email n’est envoyé : pensez à prévenir le contact si nécessaire."
        confirmLabel="Refuser la demande"
        tone="danger"
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => onStatus('Refusé', 'Demande refusée'))}
      />
    </>
  );
}
